const { library, hordes_init } = require('../index');
const stats = library(pak = "stats");

(async() => {
    hordes_init();
    try {
        const a = await stats.lm("Sepal.Length ~ Sepal.Width, data = iris")
        console.log(a.join("\n"))
    } catch (e) {
        console.log(e)
    }

    try {
        const a = stats.lm("Sepal.Length ~ Sepal.Width, data = iris")
        const b = stats.lm("Sepal.Length ~ Petal.Width, data = iris")
        const ab = await Promise.all([a, b])
        console.log(ab[0].join("\n"))
        console.log(ab[1].join("\n"))
    } catch (e) {
        console.log(e)
    }
})();