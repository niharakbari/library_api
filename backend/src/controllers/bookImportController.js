const bookImportService = require("../services/import/bookImportService");

const importJobModel = require("../models/importJobModel");
const importJobLogModel = require("../models/importJobLogModel");

const importJobService = require("../services/importJobService");


const importJobItemModel = require("../models/importJobItemModel");

const importBook = async (req, res, next) => {
    try {

        const { workKey } = req.params;
        const { languages = [] } = req.body || {};
        const userId = req.user.id;

        if (!Array.isArray(languages)) {
             return res.status(400).json({
                 success: false,
                 message: "Languages must be an array."
    });
}

        if (!workKey) {
            return res.status(400).json({
                success: false,
                message: "Work Key is required"
            });
        }

        const languagesString = languages && languages.length > 0 ? `, languages: ${languages.join(' & ')}` : '';
        const queryText = `workKey: ${workKey}${languagesString}`;
        const jobId = await importJobModel.create(userId, queryText, 1);
        await importJobModel.updateStatus(jobId, 'running');
        await importJobLogModel.createLog(jobId, 'info', `Started single import for work ${workKey}`);

        let itemId = null;
        try {
            const cleanWorkKey = workKey.replace("/works/", "");
            
            // Create item in processing state (title unknown until returned)
            itemId = await importJobItemModel.createItem(jobId, {
                workKey: cleanWorkKey,
                title: null,
                languages: languages,
                status: 'processing'
            });

            const result = await bookImportService.importBook(workKey, languages);

            if (result.status === "imported") {
                await importJobItemModel.updateItemStatus(itemId, { status: 'imported', bookId: result.bookId, title: result.bookTitle });
                await importJobModel.incrementCounters(jobId, { processed: 1, successful: 1 });
            } else if (result.status === "updated") {
                await importJobItemModel.updateItemStatus(itemId, { status: 'updated', bookId: result.bookId, title: result.bookTitle });
                await importJobModel.incrementCounters(jobId, { processed: 1, updated: 1 });
            } else if (result.status === "skipped") {
                await importJobItemModel.updateItemStatus(itemId, { status: 'skipped', errorMessage: result.errorMessage });
                await importJobModel.incrementCounters(jobId, { processed: 1, skipped: 1 });
                await importJobLogModel.createLog(jobId, 'warning', `Skipped ${workKey}: ${result.errorMessage}`);
            } else if (result.status === "duplicate") {
                await importJobItemModel.updateItemStatus(itemId, { status: 'duplicate', bookId: result.bookId, title: result.bookTitle });
                await importJobModel.incrementCounters(jobId, { processed: 1, duplicate: 1 });  
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

            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (importError) {
            if (itemId) {
                await importJobItemModel.updateItemStatus(itemId, { status: 'failed', errorMessage: importError.message });
            } else {
                const cleanWorkKey = workKey.replace("/works/", "");
                await importJobItemModel.createItem(jobId, {
                    workKey: cleanWorkKey,
                    languages: languages,
                    status: 'failed',
                    errorMessage: importError.message
                });
            }
            await importJobModel.incrementCounters(jobId, { processed: 1, failed: 1 });
            await importJobModel.markCompleted(jobId, 'failed');
            await importJobLogModel.createLog(jobId, 'error', `Error importing work: ${importError.message}`, workKey);
            throw importError;
        }

    } catch (error) {
        next(error);
    }
};

const importBatch = async (req, res, next) => {
    try {
        const { q, title, author, language, limit, offset } = req.body;
        const userId = req.user.id;

        if (!q && !title && !author) {
            return res.status(400).json({
                success: false,
                message: "Please provide a general query (q), title, or author to search for batch import."
            });
        }

        console.log("book import controller");
        const result = await importJobService.startBatchImport(userId, q, title, author, language, limit, offset);

        return res.status(202).json({
            success: true,
            data: result,
            message: "Batch import job started successfully.",
        });
    } catch (error) {
        next(error);
    }
};

const importSelected = async (req, res, next) => {
    try {
        const { works } = req.body; // works is an array of objects: { key, title, language }
        const userId = req.user.id;

        if (!Array.isArray(works) || works.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide an array of works to import."
            });
        }

        const result = await importJobService.startSelectedImport(userId, works);

        return res.status(202).json({
            success: true,
            data: result,
            message: "Selected works import job started successfully."
        });
    } catch (error) {
        next(error);
    }
};

const getImportJobs = async (req, res, next) => {
    try {
        const limit = Number(req.query.limit) || 50;
        const offset = Number(req.query.offset) || 0;

        const result = await importJobService.getJobs(limit, offset);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getImportJobLogs = async (req, res, next) => {
    try {
        const { jobId } = req.params;

        if (!jobId) {
            return res.status(400).json({
                success: false,
                message: "Job ID is required"
            });
        }

        const logs = await importJobService.getJobLogs(jobId);

        return res.status(200).json({
            success: true,
            data: logs
        });
    } catch (error) {
        if (error.message === "Import job not found.") {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};

const getImportJobItems = async (req, res, next) => {
    try {
        const { jobId } = req.params;

        if (!jobId) {
            return res.status(400).json({
                success: false,
                message: "Job ID is required"
            });
        }

        const items = await importJobService.getJobItems(jobId);

        return res.status(200).json({
            success: true,
            data: items
        });
    } catch (error) {
        if (error.message === "Import job not found.") {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};

const getImportJob = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        if (!jobId) {
            return res.status(400).json({ success: false, message: "Job ID is required" });
        }
        const job = await importJobModel.findById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }
        return res.status(200).json({ success: true, data: job });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    importBook,
    importBatch,
    importSelected,
    getImportJobs,
    getImportJobLogs,
    getImportJobItems,
    getImportJob
};