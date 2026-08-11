const db = require('./src/config/database');
const bcrypt = require('bcrypt');

db.query("SELECT email, password FROM users LIMIT 3", (err, results) => {
    if (err) {
        console.error(err);
    } else {
        console.log(results);
        results.forEach(user => {
            if (user.password && !user.password.startsWith('$2')) {
                console.log(`User ${user.email} has a PLAIN TEXT password!`);
            } else {
                console.log(`User ${user.email} has a hashed password.`);
            }
        });
    }
    process.exit();
});
