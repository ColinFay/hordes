# hordes

R from NodeJS, the right way.

Jump straight to examples: 

+ [Simple Example](#simple-example)
+ [API using Express](#api-using-express)
+ [Serving shiny apps](#serving-shiny-apps)

## About

`hordes` makes R available from NodeJS, the right way.

The general philosophy for using `hordes` is that every R function call should be stateless. 
With this idea in mind, you can build a package where functions are to be considered as 'endpoints' which are then called from NodeJS. 
In other words, there is no "shared-state" between two calls to R. 
If you want this to happen, you should either register the values inside Node or save it on disk.

Examples below will probably make this idea clearer.

### How to 

The `hordes` module contains the following functions:

#### `library`

`library` behaves as R `library()` function, except that the output is a JavaScript object with all the functions from the package. 

For example, `library("stats")` will return an object with all the functions from `{stats}`. 
By doing `const stats = library("stats");`, you will have access to all the functions from `{stats}`, for example as `stats.lm()`. 

Calling `stats.lm("code")` will launch R, run `stats::lm("code")` and return the output to Node. 

**Note that every function returns a promise, where R `stderr` reject the promise  and `stdout` resolve it.**

``` javascript 
const {library} = require('./src/library.js');
const stats = library(pak = "stats");
stats
    .lm("Sepal.Length ~ Sepal.Width, data = iris")
    .then((e) => console.log(e))
    .catch((err) => console.error(err))
```

As they are promises, you can use them in an async/await pattern or with `then/catch`

``` javascript
const library = require('./src/library.js');
const stats = library("stats");

(async () => {
    try {
            const a = await stats.lm("Sepal.Length ~ Sepal.Width, data = iris")
            console.log(a)
        } catch(e){
            console.log(e)
        }
    
    try {
            const a = stats.lm("Sepal.Length ~ Sepal.Width, data = iris")
            const b = stats.lm("Sepal.Length ~ Petal.Width, data = iris")
            const ab = await Promise.all([a, b])
            console.log(ab[0])
            console.log(ab[1])
        } catch(e){
            console.log(e)
        }
}
)();
```

Values returned by the `hordes` functions, once in NodeJS, are string values matching the `stdout` of `Rscript`.
If you want to exchange data between R and NodeJS, use an interchangeable format (JSON, arrow, or raw string):

``` javascript
const {library} = require('./src/library.js');
const jsonlite = library("jsonlite");
const base = library("base");

(async () => {
    try {
            const a = await jsonlite.toJSON("iris")
            console.log(JSON.parse(a)[0])
        } catch(e){
            console.log(e)
        }
    try {
            const b = await base.cat("21")
            console.log(parseInt(b) * 2)
        } catch(e){
            console.log(e)
        }
}
)();
```

#### `mlibrary`

`mlibrary` does the same job as `library` except the functions are natively memoized. 

``` javascript
const library = require('./src/library.js').library;
const mlibrary = require('./src/library.js').mlibrary;
const base = library("base");
const mbase = mlibrary("base");

(async () => {
    try {
            const a = await base.sample("1:100, 5")
            console.log("a:", a)
            const b = await base.sample("1:100, 5")
            console.log("b:", b)
        } catch(e){
            console.log(e)
        }

    try {
            const a = await mbase.sample("1:100, 5")
            console.log("a:", a)
            const b = await mbase.sample("1:100, 5")
            console.log("b:", b)
        } catch(e){
            console.log(e)
        }
}
)();
```

#### Shiny and Markdown waiters

You can launch a shiny app from node and wait for it to be ready (The function wait for the `Listening on` message from Shiny). 

The promise resolves with `{shiny_proc, rawoutput, url}`: `shiny_proc` is the processs object from Node, `rawoutput` is the output buffer, and `url` is the url where the app runs.

In the example below, each user connecting to `http://host:2811/hexmake` will have access to an instance of the Shiny app. 

```javascript
const {shiny_waiter} = require("./src/waiters.js")
const express = require('express');
const app = express();

app.get('/hexmake', async (req, res) => {
    try {
        let shinyproc = await shiny_waiter("hexmake::run_app()");
        res.send(`<iframe src = '${shinyproc.url}' frameborder="0" style="overflow:hidden;" height="100%" width="100%"></iframe>`);
    } catch(e){
        res.status(500).send("Error launching the Shiny App")
    }
})

app.listen(2811, function () {
  console.log('Example app listening on port 2811!')
})
```

You can also do it with Markdown files (here, we have an example of running the app from the Node terminl (hence `${process.cwd()}`, which should be switched to `__dirname` in scripting mode).

```javascript
const {markdown_waiter} = require("./src/waiters.js")
const app = require('express')();

app.get('/untitled', async (req, res) => {
    try {
        let markdown = await markdown_waiter(`rmarkdown::render('${process.cwd()}/Untitled.Rmd', output_file = 'pouet/Untitled.html')`);
        res.sendFile(`${process.cwd()}/pouet/Untitled.html`);
    } catch(e){
        console.log(e)
        res.status(500).send("Error Rendering the Markdown")
    }
})

app.listen(2811, function () {
  console.log('Example app listening on port 2811!')
})
```

#### `install`

`install` creates and install in a local library from a folder (wrapper around `remotes::install_local()`)

``` javascript
const install = require("./src/install.js")
install.install_local("./attempt")
```

#### Changing the process that runs R

By default, the R code is launched by `RScript`, but you can specify another (for example if you need another version of R):

``` javascript
const {library} = require('./src/library.js');
const base = library("base", process = '/usr/local/bin/RScript');

(async () => {
    try {
            const a = await base.sample("1:100, 5")
            console.log("a:", a)
        } catch(e){
            console.log(e)
        }
}
)();
```

### Example

#### Simple example 

``` javascript 
const {library} = require('./src/library.js');
const dplyr = library("dplyr");
const stats = library("stats");

(async () => {
    try {
        const sample = await dplyr.sample_n("iris, 5")
        console.log(sample)
    } catch(e){
        console.log(e)
    }

    try {
        const pull = await dplyr.pull("airquality, Month")
        console.log(pull)
    } catch(e){
        console.log(e)
    }

    try {
        const lm = await stats.lm("Sepal.Length ~ Sepal.Width, data = iris")
        console.log(lm)
    } catch(e){
        console.log(e)
    }
}

)();
```

#### API using express

``` javascript
const express = require('express');
const {library} = require('./src/library.js');
const app = express();
const stats = library("stats");

app.get('/lm', async (req, res) => {
    try {
        const output = await stats.lm(`${req.query.left} ~ ${req.query.right}`)
        res.send( '<pre>' + output + '</pre>' )
    } catch(e){
        res.status(500).send(e)
    }
})

app.get('/rnorm', async (req, res) => {
    try {
        const output = await stats.rnorm(req.query.left)
        res.send( '<pre>' + output + '</pre>' )
    } catch(e) {
        res.status(500).send(e)
    }
})

app.listen(2811, function () {
  console.log('Example app listening on port 2811!')
})
```

-> http://localhost:2811/lm?left=iris$Sepal.Length&right=iris$Petal.Length

-> http://localhost:2811/rnorm?left=10

#### Serving Shiny Apps 

Note that these methods won't close the Shiny sessions after the node app is closed / when the user close the tab. 
These are examples that have been trimmed down for the sake of clarity.

+ One per user

```javascript
const {shiny_waiter} = require("./src/waiters.js")
const express = require('express');
const app = express();

const enframe = (url) => {
    return `<iframe src = '${url}' frameborder="0" style="overflow:hidden;" height="100%" width="100%"></iframe>`
}

app.get('/hexmake', async (req, res) => {
    try {
        let shinyproc = await shiny_waiter("hexmake::run_app()");
        res.send(enframe(shinyproc.url));
    } catch(e){
        res.status(500).send("Error launching the Shiny App")
    }
})


app.get('/punkapi', async (req, res) => {
    try {
        let shinyproc = await shiny_waiter("punkapi::run_app()");
       res.send(enframe(shinyproc.url));
    } catch(e){
        res.status(500).send("Error launching the Shiny App")
    }
})

app.listen(2811, function () {
  console.log('Example app listening on port 2811!')
})
```

-> http://localhost:2811/hexmake

-> http://localhost:2811/punkapi

+ Same for all users

```javascript
const {shiny_waiter} = require("./src/waiters.js")
const express = require('express');
const app = express();

const enframe = (url) => {
    return `<iframe src = '${url}' frameborder="0" style="overflow:hidden;" height="100%" width="100%"></iframe>`
}

(async () => {
    const a = shiny_waiter("hexmake::run_app()");
    const b = shiny_waiter("punkapi::run_app()");
    const ab = await Promise.all([a, b]);
    
    app.get('/hexmake', (req, res) => {
        res.send(enframe(ab[0].url));
    })

    app.get('/punkapi', (req, res) => {
        res.send(enframe(ab[1].url));
    })
})()

app.listen(2811, function () {
    console.log('Example app listening on port 2811!')
})

```

-> http://localhost:2811/hexmake

-> http://localhost:2811/punkapi