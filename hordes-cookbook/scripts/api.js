const express = require('express');
const {mlibrary, library} = require('hordes');
const app = express();
const hordesx = library("hordesx");
const chordesx = mlibrary("hordesx");

app.get('/iris', async (req, res) => {
    try {
        const output = await hordesx.ggpoint(req.query.n)
        res.send( output )
    } catch(e){
      res.status(500).send("e")
    }
})

app.get('/cachediris', async (req, res) => {
    try {
        const output = await chordesx.ggpoint(req.query.n)
        res.send( output )
    } catch(e){
      res.status(500).send("e")
    }
})

app.listen(2811, function () {
  console.log('Example app listening on port 2811!')
})