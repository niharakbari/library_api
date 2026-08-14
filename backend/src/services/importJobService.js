const openLibraryService = require("./openLibrary/openLibraryService");
const bookImportService = require("./import/bookImportService");
const importJobModel = require("../models/importJobModel");
const importJobLogModel = require("../models/importJobLogModel");

const startBatchImport = async (userId, title, author, limit, offset) => {

    console.log("importJobService.stattBatchImport");

    const queryText = `title: ${title || '*'}, author: ${author || '*'}, limit: ${limit}, offset: ${offset}`;

    
    // first search all books
    console.log("before searching book");
    const searchData = await openLibraryService.searchBooks(title, author, limit, offset);
    
    const works = searchData.docs || [];
    const totalFound = searchData.num_found || 0;
    const totalToProcess = works.length;

    // Create pending job
    
    const jobId = await importJobModel.create(userId, queryText, totalToProcess);

    // if nothing found by search..
    if (totalToProcess === 0) {
        await importJobModel.markCompleted(jobId, 'completed');
        await importJobLogModel.createLog(jobId, 'info', 'Search returned no results.');
        return { jobId, status: 'completed', message: 'No records to process.' };
    }

    // Start background processing loop
    processBatchInBackground(jobId, works);

    return { jobId, status: 'pending', totalToProcess };
};

const processBatchInBackground = async (jobId, works) => {
    try {
        await importJobModel.updateStatus(jobId, 'running');
        await importJobLogModel.createLog(jobId, 'info', `Job started. Processing ${works.length} records.`);

        for (const work of works) {
            try {
                
                if (!work.key) {
                    await importJobModel.incrementCounters(jobId, { processed: 1, failed: 1 });
                    await importJobLogModel.createLog(jobId, 'warning', `Work has no key. Skipping.`, null);
                    continue;
                }

                // serch.json response 
                const languages = work.language || [];

                const result = await bookImportService.importBook(work.key, languages);

                if (result.status === "imported") {
                    await importJobModel.incrementCounters(jobId, { processed: 1, successful: 1 });
                } else if (result.status === "duplicate") {
                    await importJobModel.incrementCounters(jobId, { processed: 1, duplicate: 1 });
                } else if (result.status === "updated") {
                    await importJobModel.incrementCounters(jobId, { processed: 1, updated: 1 });
                } else {
                    throw new Error(`Unknown import status: ${result.status}`);
                }
            } catch (error) {
                await importJobModel.incrementCounters(jobId, { processed: 1, failed: 1 });
                await importJobLogModel.createLog(jobId, 'error', `Error importing work: ${error.message}`, work.key);
            }
        }

        await importJobModel.markCompleted(jobId, 'completed');
        await importJobLogModel.createLog(jobId, 'info', 'Job completed successfully.');

    } catch (criticalError) {
        // Fallback for catastrophic failure in the batch process itself
        console.error(`Critical error in batch job ${jobId}:`, criticalError);
        await importJobModel.markCompleted(jobId, 'failed');
        await importJobLogModel.createLog(jobId, 'error', `Critical failure during job execution: ${criticalError.message}`);
    }
};

const getJobs = async (limit = 50, offset = 0) => {
    return await importJobModel.findAll(limit, offset);
};

const getJobLogs = async (jobId) => {
    const job = await importJobModel.findById(jobId);
    if (!job) {
        throw new Error("Import job not found.");
    }
    return await importJobLogModel.findByJobId(jobId);
};

module.exports = {
    startBatchImport,
    getJobs,
    getJobLogs,
};
