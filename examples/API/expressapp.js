const express = require('express');
const library = require('../../src/library.js').library;

const app = express();
const dplyr = library("dplyr");
const stats = library("stats");
const profvis = library("profvis");

app.get('/lm', function (req, res) {
    stats.lm(`${req.query.left} ~ ${req.query.right}`)
    .then((output) => {
        res.send('<pre>' + output + '</pre>')
    })
    .catch((output) => { res.send(output) })
})

app.get('/dplyr', function (req, res) {
    dplyr.pull("dplyr::band_instruments, plays")
    .then((output) => { res.send(output)})
    .catch((output) => {res.send('Error')})
})

app.get('/jsonlite', function (req, res) {
    profvis.pause(0.5)
    .then((output) => { console.log(output); res.send(output)})
    .catch((output) => {console.log(output); res.send('Error')})
})

app.listen(3000, function () {
  console.log('http://localhost:3000')
})