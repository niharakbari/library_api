const fs = require('fs');
const file = 'backend/src/services/import/bookImportService.js';
let content = fs.readFileSync(file, 'utf8');

// The replacement logic for the core book handling:
const newLogic = `    let parsedYear = null;
    if (work.first_publish_date) {
        const match = String(work.first_publish_date).match(/\\b(1\\d{3}|20\\d{2})\\b/);
        if (match) {
            parsedYear = parseInt(match[0], 10);
        }
    }
    parsedYear = parsedYear || work.first_publish_year || null;

    const existingBook = await bookModel.findByOpenLibraryWorkKey(cleanWorkKey, connection);

    let finalBookId;
    let finalStatus;

    if (existingBook) {
        await bookModel.update(existingBook.id, {
            title: work.title,
            firstPublishYear: parsedYear,
            coverEditionKey: null,
            coverId: safeCoverId,
        }, connection);

        finalBookId = existingBook.id;
        finalStatus = "updated";

        // Clear existing mappings to prevent duplication on upsert
        await bookAuthorModel.deleteBookAuthor(finalBookId, connection);
        await bookSubjectsModel.deleteBookSubject(finalBookId, connection);
        await bookLanguagesModel.deleteBookLanguage(finalBookId, connection);
    } else {
        finalBookId = await bookModel.create({
            workKey: cleanWorkKey,
            title: work.title,
            firstPublishYear: parsedYear,
            coverEditionKey: null,
            coverId: safeCoverId,
        }, connection);
        finalStatus = "imported";
    }`;

// Regex to replace everything from `const existingBook = ...` down to the `bookModel.create(...);`
const regex = /const existingBook = await bookModel\.findByOpenLibraryWorkKey\([\s\S]*?const bookId = await bookModel\.create\(\{[\s\S]*?connection\s*\);/m;
content = content.replace(regex, newLogic);

// Replace remaining 'bookId' usages with 'finalBookId'
content = content.replace(/await bookAuthorModel\.create\(\s*bookId,/g, 'await bookAuthorModel.create(\n            finalBookId,');
content = content.replace(/await bookSubjectsModel\.create\(bookId,/g, 'await bookSubjectsModel.create(finalBookId,');
content = content.replace(/await bookLanguagesModel\.create\(\s*bookId,/g, 'await bookLanguagesModel.create(\n            finalBookId,');
content = content.replace(/bookId,/g, 'bookId: finalBookId,');
content = content.replace(/status: "imported",/g, 'status: finalStatus,');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed bookImportService.js successfully');
