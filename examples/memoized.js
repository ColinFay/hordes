const { mlibrary, library, hordes_init } = require('../index');
const base = library("base");
const mbase = mlibrary("base");

(async() => {
    try {
        const a = await base.sample("1:100, 5")
        console.log("a:", a)
        const b = await base.sample("1:100, 5")
        console.log("b:", b)
    } catch (e) {
        console.log(e)
    }

    try {
        const a = await mbase.sample("1:100, 5")
        console.log("a:", a)
        const b = await mbase.sample("1:100, 5")
        console.log("b:", b)
    } catch (e) {
        console.log(e)
    }
})();