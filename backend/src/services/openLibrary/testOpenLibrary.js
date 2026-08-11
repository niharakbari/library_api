const { searchBooks } = require("./openLibraryClient");

const test = async () => {
    try {
        const data = await searchBooks({
            title: "Gita",
            limit: 5,
            offset: 0,
        });

        console.log("Total results:", data.numFound);
        console.log("Results received:", data.docs.length);

        data.docs.forEach((book, index) => {
            console.log(`\n--- Book ${index + 1} ---`);
            console.log("Work key:", book.key);
            console.log("Title:", book.title);
            console.log("Authors:", book.author_name);
            console.log("Author keys:", book.author_key);
            console.log("Edition count:", book.edition_count);
            console.log("Cover edition:", book.cover_edition_key);
        });
    } catch (error) {
        console.error("Open Library test failed:", error);
    }
};

test();