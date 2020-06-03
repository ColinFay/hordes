# hordes

R from NodeJS, the right way.

## Install

`hordes` is not on npm (yet), so for now you'll need to clone this repo and `require()` the `index.js` file. 
(But I suppose that if you're reading these lines right now you're probably just here to see what this thing is about, so that's ok)

## Jump to Examples

Maybe you don't have time to read the background and you just want to jump straight to the examples: 

+ [Simple Example](#simple-example)
+ [API using Express](#api-using-express)
+ [Serving shiny apps](#serving-shiny-apps)
+ [Serving Shiny App with Load Balancing](#load-balancing-shiny-apps)

## About

`hordes` makes R available from NodeJS.

The general idea of `hordes` is that NodeJS is the perfect tool when it comes to HTTP i/o, hence we should leverage the strength of this ecosystem to build Web Services that can serve R results. 
For example, if you have a web service that needs authentification, using `hordes` allows to reuse existing NodeJS modules, which are widely used and tested inside the NodeJS ecosystem, instead of trying to reinvent the wheel.
Another good example is NodeJS native cluster mode, and external modules like `pm2` which are designed to launch your app in a multicore mode, and also that watches that your app is still running continuously, and relaunches it if one of the process stop (kind of handy for a production application that handle a lot of load). 
And don't get me started on scaling NodeJS applications.

The philosophy for using `hordes` is that every R function call should be stateless. 
With this idea in mind, you can build a package where functions are to be considered as 'endpoints' which are then called from NodeJS. 
In other words, there is no "shared-state" between two calls to R—if you want this to happen, you should either register the values inside Node, save it on disk, or use a database as a backend. 

Examples below will probably make this idea clearer.

### Wait...

> "Wait... but I need to learn a new language?"

Yes. And no. 
NodeJS has a ton of tutorials online and even if, ther



### How to 

The `hordes` module contains the following functions:

#### `library`

`library` behaves as R `library()` function, except that the output is a JavaScript object with all the functions from the package. 

For example, `library("stats")` will return an object with all the functions from `{stats}`. 
By doing `const stats = library("stats");`, you will have access to all the functions from `{stats}`, for example `stats.lm()`. 

> Note that if you want to call functions with dot (for example `as.numeric()`), you should do it using the `[` notation, not the dot one (i.e `base['as.numeric']`, not `base.as.numeric`).

Calling `stats.lm("code")` will launch R, run `stats::lm("code")` and return the output to Node. 

**Note that every function returns a promise, where R `stderr` reject the promise  and `stdout` resolve it.**
This point is kind of important if you're building your own package that will be then called through `hordes`.

``` javascript 
const {library} = require('./index.js');
const stats = library(pak = "stats");
stats.lm("Sepal.Length ~ Sepal.Width, data = iris").
    then((e) => console.log(e)).
    catch((err) => console.error(err))
```

```
Promise { <pending> }

Call:
stats::lm(formula = Sepal.Length ~ Sepal.Width, data = iris)

Coefficients:
(Intercept)  Sepal.Width  
     6.5262      -0.2234  
```

As they are promises, you can use them in an async/await pattern or with `then/catch`

``` javascript
const {library} = require('./index.js');
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

```
Promise { <pending> }

Call:
stats::lm(formula = Sepal.Length ~ Sepal.Width, data = iris)

Coefficients:
(Intercept)  Sepal.Width  
     6.5262      -0.2234  



Call:
stats::lm(formula = Sepal.Length ~ Sepal.Width, data = iris)

Coefficients:
(Intercept)  Sepal.Width  
     6.5262      -0.2234  



Call:
stats::lm(formula = Sepal.Length ~ Petal.Width, data = iris)

Coefficients:
(Intercept)  Petal.Width  
     4.7776       0.8886  
```

Values returned by the `hordes` functions, once in NodeJS, are string values matching the `stdout` of `Rscript`.

If you want to exchange data between R and NodeJS, use an interchangeable format (JSON, arrow, base64 for images, raw strings...):

``` javascript
const {library} = require('./index.js');
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

```
Promise { <pending> }
{
  'Sepal.Length': 5.1,
  'Sepal.Width': 3.5,
  'Petal.Length': 1.4,
  'Petal.Width': 0.2,
  Species: 'setosa'
}
42
```

#### `mlibrary`

`mlibrary` does the same job as `library` except the functions are natively memoized. 

``` javascript
const {library, mlibrary} = require('./index.js');
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

```
Promise { <pending> }
> a: [1] 99 97 33 73 93

b: [1] 76 50 27 75 56

a: [1] 56 81 72 36 45

b: [1] 56 81 72 36 45
```


### `get_hash`

When calling `library()` or `mlibrary()`, you can specify a hash, which can be compiled with `get_hash`. 
This hash is computed from the `DESCRIPTION` of the package called. 
That way, if ever the `DESCRIPTION` file changes (version update, or stuff like that...), you can get alerted (app won't launch). 
Just ignore this param if you don't care about that (but you should). 

``` javascript
const {library, get_hash} = require('./index.js');
get_hash("golem")
```

```
'e2167f289a708b2cd3b774dd9d041b9e4b6d75584b9421185eb8d80ca8af4d8a'
```

Then if you call `library()` with another hash, the app will fail.
Again, ignore this param if you don't need it. 

```javascript
var golem = library("golem", hash = "blabla")
```

```
Uncaught Error: Hash from DESCRIPTION doesn't match specified hash.
```

```javascript
var golem = library("golem", hash = 'e2167f289a708b2cd3b774dd9d041b9e4b6d75584b9421185eb8d80ca8af4d8a')
Object.keys(golem).length
```

```
106
```

#### Shiny and Markdown waiters

You can launch a shiny app from node and wait for it to be ready (The function wait for the `Listening on` message from Shiny). 

The promise resolves with `{proc, rawoutput, url}`: `proc` is the processs object from Node, `rawoutput` is the output buffer, and `url` is the url where the app runs.

In the example below, each user connecting to `http://host:2811/hexmake` will have access to an instance of the Shiny app. 

```javascript
const {shiny_waiter} = require("./index.js")
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

You can also do it with Markdown files (here, we have an example of running the app from the Node terminal (hence `${process.cwd()}`, which should be switched to `__dirname` in scripting mode).

```javascript
const {markdown_waiter} = require("./index.js")
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

`install` installs from a folder (wrapper around `remotes::install_local()`)

``` javascript
const install = require("./index.js")
install.install_local("./attempt")
```

#### Changing the process that runs R

By default, the R code is launched by `RScript`, but you can specify another (for example if you need another version of R):

``` javascript
const {library} = require('./index.js');
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

### Examples

#### Simple example 

``` javascript 
const {library} = require('./index.js');
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

```
Promise { <pending> }
>   Sepal.Length Sepal.Width Petal.Length Petal.Width    Species
1          6.3         2.5          5.0         1.9  virginica
2          5.1         3.8          1.6         0.2     setosa
3          6.2         3.4          5.4         2.3  virginica
4          6.0         2.2          5.0         1.5  virginica
5          6.0         2.7          5.1         1.6 versicolor

  [1] 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 6 6 6 6 6 6
 [38] 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 7 7 7 7 7 7 7 7 7 7 7 7 7
 [75] 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8
[112] 8 8 8 8 8 8 8 8 8 8 8 8 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
[149] 9 9 9 9 9


Call:
stats::lm(formula = Sepal.Length ~ Sepal.Width, data = iris)

Coefficients:
(Intercept)  Sepal.Width  
     6.5262      -0.2234 
```

#### API using express

``` javascript
const express = require('express');
const {library} = require('./index.js');
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

When called, the waiters return an object of class [ChildProcess](https://nodejs.org/api/child_process.html#child_process_class_childprocess) as `.proc`, that can be manipulated as such.

+ One per user

```javascript
const {shiny_waiter} = require('./index.js');
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

+ Same app for all users

```javascript
const {shiny_waiter} = require('./index.js');
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

#### Load Balancing Shiny Apps 

Here's a small example of a round-robin load balancing technic, where we launch 5 shiny apps and serve them in turn to the users. 

```javascript
const {shiny_waiter} = require('./index.js');
const express = require('express');
const app = express();

const enframe = (port) => {
    return `<iframe src = 'http://127.0.0.1:${port}' frameborder="0" style="overflow:hidden;" height="100%" width="100%"></iframe>`
}

(async () => {
    var port = [2811, 2812, 2813, 2814, 2815]
    const proms = port.map((x) => {
        shiny_waiter(`options(shiny.port=${x});hexmake::run_app()`)
    })
    await Promise.all(proms);
    
    app.get('/hexmake', (req, res) => {
        var locport = port.shift()
        console.log(locport)
        res.send(enframe(locport));
        port.push(locport)
    })
})()

app.listen(2811, function () {
    console.log('Example app listening on port 2811!')
})
```

Now if you open 10 tabs in a browser on `http://localhost:2811/hexmake`, each of the five apps will be served two times, helping to quickly load balance Shiny applications. 