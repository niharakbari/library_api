const bcrypt = require('bcrypt');

const pass = "Admin@123";
bcrypt.hash(pass, 10).then(hash => {
    console.log("Original hash length:", hash.length);
    const truncatedHash = hash.substring(0, 50);
    console.log("Truncated hash:", truncatedHash);
    
    bcrypt.compare(pass, truncatedHash).then(res => {
        console.log("Match with truncated hash?", res);
    }).catch(e => {
        console.log("Error with truncated hash:", e.message);
    });
});
