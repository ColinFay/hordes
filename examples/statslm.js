const { library, hordes_init } = require('../index');
const stats = library(pak = "stats");

(async() => {
    await hordes_init(9999);
    stats.lm("Sepal.Length ~ Sepal.Width, data = iris", port = 9999)
        .then((e) => console.log(e.join("\n")))
        .catch((err) => console.error(err))
})()