const config = require("../../config/config");

const get = async (path, params = {}) => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            queryParams.set(key, String(value));
        }
    });

    const queryString = queryParams.toString();

    const url = `${config.openLibraryURL}${path}${
        queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Open Library API error: ${response.status} ${response.statusText}`
        );
    }

    return response.json();
};

module.exports = {
    get,
};