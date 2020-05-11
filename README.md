# library

R from NodeJS, the right way.

## About

`hordes` will load and call R functions from inside NodeJS.

### How to 

The `hordes` module contains the following functions:

#### `library`

`library` behaves as R `library()` function, except that the output is a JavaScript object with all the functions from the package. 

For example, `library("stats")` will return an object with all the functions from `{stats}`. 
By doing `const stats = library("stats");`, you will have access to all the functions from `{stats}`, for example as `stats.lm()`. 
Calling `stats.lm("code")` will launch R, run `stats::lm("code")` and return the output to Node. 
Note that `stats.lm("code")` returns a promise, where `stderr` and `stdout` reject the promise.  

``` javascript 
const library = require('./src/library.js');
const stats = library("stats");
stats.lm("Sepal.Length ~ Sepal.Width, data = iris").then((e) => console.log(e))
```

As they are promises, you can use them in an async/await pattern

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

Values returned by the `hordes` functions, once in NodeJS, are string values matchine the `stdout` of `Rscript`.
If you want to exchange data between R and NodeJS, use an interchangeable format (JSON, or raw string):

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

Of course, the general philosophy is to build an R package, where each function is to be considered as an "endpoint", so that you can set the exact format to output, from R, for NodeJS. 


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

#### Changing the process that runs R

By default, the R code is launched by `RScript`, but you can specify another (for example if you need another version of R):

``` javascript
const library = require('./src/library.js').library;
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
const library = require('./src/library.js');
const app = express();
const stats = library("stats");

app.get('/lm', function (req, res) {
    stats.lm(`${req.query.left} ~ ${req.query.right}`)
    .then((output) => {
        res.send( '<pre>' + output + '</pre>' )
    })
    .catch((output) => {
        res.send(output)
    })
})

app.listen(2811, function () {
  console.log('Example app listening on port 2811!')
})
```

> http://localhost:2811/lm?left=iris$Sepal.Length&right=iris$Petal.Length