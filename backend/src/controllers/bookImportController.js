const bookImportService = require("../services/import/bookImportService");

const importBook = async (req, res, next) => {
    try {
        const { workKey } = req.params;
        const { languages = [] } = req.body;

        if (!workKey) {
            return res.status(400).json({
                success: false,
                message: "Work Key is required"
            });
        }

        const result = await bookImportService.importBook(
            workKey,
            languages
        );

        return res.status(200).json({
            success: true,
            data: result,
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    importBook
};