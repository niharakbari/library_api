const bcrypt = require("bcrypt");

const pass = "123";

bcrypt.hash(pass, 10)
    .then((hashedPass) => {
        console.log(hashedPass);
    })
    .catch((err) => {
        console.error(err);
    });