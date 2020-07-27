const { library, hordes_init } = require('../index');
const jsonlite = library("jsonlite");
const base = library("base");

(async() => {
    await hordes_init();
    try {
        const a = await jsonlite.toJSON("iris")
        console.log(JSON.parse(a)[0])
    } catch (e) {
        console.log(e)
    }
    try {
        const b = await base.cat("21")
        console.log(parseInt(b) * 2)
    } catch (e) {
        console.log(e)
    }
})();