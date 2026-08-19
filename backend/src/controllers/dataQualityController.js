const dataQualityService = require("../services/dataQualityService");

const checkMissingFields = async (req, res, next) => {
    try {
        const { checks } = req.query;

        if (!checks) {
            return res.status(400).json({
                success: false,
                message: "Please provide at least one check."
            });
        }

        const checkList = checks
            .split(',')
            .map(check => check.trim().toLowerCase())
            .filter(Boolean);

        const allowedChecks = [
            "authors",
            "language",
            "subject",
            "publish_year"
        ];

        const invalidChecks = checkList.filter(
            check => !allowedChecks.includes(check)
        );

        if (invalidChecks.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Invalid checks: ${invalidChecks.join(', ')}`
            });
        }

        const result = await dataQualityService.checkMissingFields(checkList);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    checkMissingFields
};