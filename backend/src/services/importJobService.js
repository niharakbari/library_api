const openLibraryService = require("./openLibrary/openLibraryService");
const bookImportService = require("./import/bookImportService");
const importJobModel = require("../models/importJobModel");
const importJobLogModel = require("../models/importJobLogModel");

const db = require("../config/database");


const startBatchImport = async (userId, q, title, author, language, limit, offset) => {


    console.log("importJobService.stattBatchImport");

    const queryText = `q: ${q || '*'}, title: ${title || '*'}, author: ${author || '*'}, limit: ${limit}, offset: ${offset}`;

    
    // first search all books
    console.log("before searching book");
    const searchData = await openLibraryService.searchBooks(q, title, author, null, language, limit, offset);
    
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
    };

    // Start background processing loop
    processBatchInBackground(jobId, works);

    return { jobId, status: 'pending', totalToProcess };
};

const startSelectedImport = async (userId, works) => {
    const queryText = `Selected ${works.length} works manually`;
    const jobId = await importJobModel.create(userId, queryText, works.length);
    
    // Start background processing loop
    processBatchInBackground(jobId, works);
    
    return { jobId, status: 'pending', totalToProcess: works.length };
};

const importJobItemModel = require("../models/importJobItemModel");

const processBatchInBackground = async (jobId, works) => {
    try {


        await importJobModel.updateStatus(jobId, 'running');
        await importJobLogModel.createLog(jobId, 'info', `Job started. Processing ${works.length} records.`);

        for (const work of works) {

            if (!work.key) {
                    await importJobModel.incrementCounters(jobId, { processed: 1, skipped: 1 });
                    await importJobLogModel.createLog(jobId, 'warning', `Work has no key. Skipping.`, null);
                    continue;
            };

            const cleanWorkKey = work.key.replace("/works/", "");
            const languages = work.language || [];

            let itemId = null;

            itemId = await importJobItemModel.createItem(jobId, {
                    workKey: cleanWorkKey,
                    title: work.title,
                    languages: languages,
                    status: 'processing'
                });

            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {

                const result = await bookImportService.importBook(work.key, languages, connection);

                if (result.status === "imported") {
                    await connection.commit();

                    await importJobItemModel.updateItemStatus(itemId, { status: 'imported', bookId: result.bookId });
                    await importJobModel.incrementCounters(jobId, { processed: 1, successful: 1 });

                } else if (result.status === "updated") {
                    await connection.commit();

                    await importJobItemModel.updateItemStatus(itemId, { status: 'updated', bookId: result.bookId });
                    await importJobModel.incrementCounters(jobId, { processed: 1, updated: 1 });

                } else if (result.status === "skipped") {
                    await connection.rollback();

                    await importJobItemModel.updateItemStatus(itemId, { status: 'skipped', errorMessage: result.errorMessage });
                    await importJobModel.incrementCounters(jobId, { processed: 1, skipped: 1 });
                    await importJobLogModel.createLog(jobId, 'warning', `Skipped ${work.key}: ${result.errorMessage}`, work.key);

                } else if (result.status === "duplicate") {
                    await connection.commit();

                    await importJobItemModel.updateItemStatus(itemId, { status: 'duplicate', bookId: result.bookId });
                    await importJobModel.incrementCounters(jobId, { processed: 1, duplicate: 1 });
                }

            } catch (error) {

                await connection.rollback();

                await importJobItemModel.updateItemStatus(itemId, { status: 'failed', errorMessage: error.message });

                await importJobModel.incrementCounters(jobId, { processed: 1, failed: 1 });
                await importJobLogModel.createLog(jobId, 'error', `Error importing work: ${error.message}`, work.key);

            } finally {
                connection.release();
            }
        }

        const job = await importJobModel.findById(jobId);
        let finalStatus = 'completed';

        if (job.failed_records > 0 || job.skipped_records > 0) {
            if (job.successful_records === 0 && job.updated_records === 0 && job.duplicate_records === 0) {
                finalStatus = 'failed';
            } else {
                finalStatus = 'partially_completed';
            }
        }

        await importJobModel.markCompleted(jobId, finalStatus);
        await importJobLogModel.createLog(jobId, 'info', `Job finished with status: ${finalStatus}`);

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

const getJobItems = async (jobId) => {
    const job = await importJobModel.findById(jobId);
    if (!job) {
        throw new Error("Import job not found.");
    }
    return await importJobItemModel.findByJobId(jobId);
};

module.exports = {
    startBatchImport,
    startSelectedImport,
    getJobs,
    getJobLogs,
    getJobItems,
};