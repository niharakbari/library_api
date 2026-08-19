const dataQualityModel = require("../models/dataQualityModel");

const checkMissingFields = async (checkList) => {

    return await dataQualityModel.findBooksWithMissingFields(checkList);

};

module.exports = {
    checkMissingFields
};