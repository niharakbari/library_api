require('dotenv').config({ path: __dirname + '/../.env' });
const db = require('./src/config/database');
const importJobService = require('./src/services/importJobService');
const openLibraryService = require('./src/services/openLibrary/openLibraryService');
const importJobModel = require('./src/models/importJobModel');
const importJobItemModel = require('./src/models/importJobItemModel');
const importJobLogModel = require('./src/models/importJobLogModel');

// Mock OpenLibrary search to return specific test cases
openLibraryService.searchBooks = async () => {
    return {
        num_found: 4,
        docs: [
            { key: "/works/TEST_NEW_1", title: "New Book", language: ["eng"] },
            { key: "/works/TEST_EXISTING_2", title: "Existing Book", language: ["eng"] },
            { key: "/works/TEST_MISSING_TITLE_3", title: null, language: ["eng"] },
            { key: "/works/TEST_FAIL_4", title: "Fail Book", language: ["eng"] } // We will make this fail in the DB
        ]
    };
};

// Mock OpenLibrary getWork and getAuthor
openLibraryService.getWork = async (key) => {
    if (key === "/works/TEST_FAIL_4") throw new Error("Simulated network failure");
    return {
        key: key,
        title: key.includes("MISSING_TITLE") ? null : "Mock Title",
        first_publish_year: 2023,
        covers: [12345],
        authors: [{ author: { key: "/authors/MOCK_AUTH" } }],
        subjects: ["Mock Subject"]
    };
};
openLibraryService.getAuthor = async () => ({ key: "/authors/MOCK_AUTH", name: "Mock Author" });

const runTest = async () => {
    try {
        console.log("Setting up existing book...");
        // Ensure the existing book actually exists in DB
        await db.query(`INSERT IGNORE INTO books (open_library_work_key, title) VALUES ('TEST_EXISTING_2', 'Existing Book')`);

        console.log("Starting batch import...");
        const result = await importJobService.startBatchImport(1, 'mock', 'mock', 4, 0);
        console.log("Job ID:", result.jobId);
        
        // Wait for background job to finish
        await new Promise(res => setTimeout(res, 2000));
        
        console.log("Checking job results...");
        const job = await importJobModel.findById(result.jobId);
        console.log("Final Job Status:", job.status);
        console.log("Counters:", {
            total: job.total_records,
            processed: job.processed_records,
            successful: job.successful_records,
            updated: job.updated_records,
            skipped: job.skipped_records,
            failed: job.failed_records
        });

        const items = await importJobItemModel.findByJobId(result.jobId);
        console.log("Items:");
        items.forEach(item => {
            console.log(` - [${item.status}] ${item.open_library_work_key}: ${item.error_message || 'No error'}`);
        });

        const logs = await importJobLogModel.findByJobId(result.jobId);
        console.log("Logs:");
        logs.forEach(log => {
            console.log(` - [${log.level}] ${log.message}`);
        });

        console.log("Testing CASCADE DELETE...");
        await db.query(`DELETE FROM import_jobs WHERE id = ?`, [result.jobId]);
        const itemsAfter = await importJobItemModel.findByJobId(result.jobId);
        const logsAfter = await importJobLogModel.findByJobId(result.jobId);
        console.log(`Items after delete: ${itemsAfter.length} (Expected 0)`);
        console.log(`Logs after delete: ${logsAfter.length} (Expected 0)`);
        
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
};

runTest();
