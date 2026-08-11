const bcrypt = require('bcrypt');
async function test() {
    try {
        await bcrypt.compare(123456, "hash");
        console.log("number worked");
    } catch (e) {
        console.log("Error with number:", e.message);
    }
    try {
        await bcrypt.compare("pass", undefined);
        console.log("undefined hash worked");
    } catch (e) {
        console.log("Error with undefined hash:", e.message);
    }
    try {
        await bcrypt.compare(undefined, "hash");
        console.log("undefined data worked");
    } catch (e) {
        console.log("Error with undefined data:", e.message);
    }
}
test();
