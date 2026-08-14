const bookImportService = require("../services/import/bookImportService");

const importJobModel = require("../models/importJobModel");
const importJobLogModel = require("../models/importJobLogModel");

const importJobService = require("../services/importJobService");


const importBook = async (req, res, next) => {
    try {
        const { workKey } = req.params;
        const { languages = [] } = req.body;
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

        try {
            const result = await bookImportService.importBook(workKey, languages);

            if (result.status === "imported") {
                await importJobModel.incrementCounters(jobId, { processed: 1, successful: 1 });
            } else if (result.status === "duplicate") {
                await importJobModel.incrementCounters(jobId, { processed: 1, duplicate: 1 });  
            } else {
                await importJobModel.incrementCounters(jobId, { processed: 1, updated: 1 });
            }

            await importJobModel.markCompleted(jobId, 'completed');
            await importJobLogModel.createLog(jobId, 'info', 'Job completed successfully.');

            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (importError) {
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
        const { title, author, limit, offset } = req.body;
        const userId = req.user.id;

        if (!title && !author) {
            return res.status(400).json({
                success: false,
                message: "Please provide a title or author to search for batch import."
            });
        }

        console.log("book import controller");
        const result = await importJobService.startBatchImport(userId, title, author, limit, offset);

        return res.status(202).json({
            success: true,
            data: result,
            message: "Batch import job started successfully.",
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

module.exports = {
    importBook,
    importBatch,
    getImportJobs,
    getImportJobLogs
};