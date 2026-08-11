const db = require('./src/config/database');

db.query("DESCRIBE users", (err, results) => {
    if (err) {
        console.error(err);
    } else {
        console.log(results);
    }
    process.exit();
});
