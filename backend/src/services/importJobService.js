const openLibraryService = require("./openLibrary/openLibraryService");
const bookImportService = require("./import/bookImportService");
const importJobModel = require("../models/importJobModel");
const importJobLogModel = require("../models/importJobLogModel");

const startBatchImport = async (userId, title, author, limit, offset) => {
    // We will formulate a generic query string for logging
    const queryText = `title: ${title || '*'}, author: ${author || '*'}, limit: ${limit}, offset: ${offset}`;
    
    // First, search books to get the total count and works
    const searchData = await openLibraryService.searchBooks(title, author, limit, offset);
    
    const works = searchData.docs || [];
    const totalFound = searchData.numFound || 0;
    const totalToProcess = works.length;

    // Create pending job
    const jobId = await importJobModel.create(userId, queryText, totalToProcess);

    // If no works found, mark completed immediately
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
                // Ensure work key is present
                if (!work.key) {
                    await importJobModel.incrementCounters(jobId, { processed: 1, failed: 1 });
                    await importJobLogModel.createLog(jobId, 'warning', `Work has no key. Skipping.`, null);
                    continue;
                }

                // The Search API returns language array, if any. Use it.
                const languages = work.language || [];

                const result = await bookImportService.importBook(work.key, languages);

                if (result.status === "imported") {
                    await importJobModel.incrementCounters(jobId, { processed: 1, successful: 1 });
                } else if (result.status === "duplicate") {
                    await importJobModel.incrementCounters(jobId, { processed: 1, duplicate: 1 });
                } else {
                    // Fallback for any unknown status
                    await importJobModel.incrementCounters(jobId, { processed: 1, updated: 1 });
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

module.exports = {
    startBatchImport,
};
