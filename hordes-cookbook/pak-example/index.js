const express = require('express');
const {library} = require('hordes');
const app = express();
const hordesx = library("hordesx")

app.get('/ggplot', async (req, res) => {
    try {
        const im = await hordesx.ggpoint(`n = ${req.query.n}`);
        const img = Buffer.from(im, 'base64');
        res.writeHead(200, {
          'Content-Type': 'image/png',
          'Content-Length': img.length
        });
      res.end(img); 
    } catch(e){
        res.status(500).send(e)
    }
})

app.get('/test', function(req, res) {
    res.sendFile('test.html', {root: __dirname })
});

app.listen(2811, function () {
  console.log('Example app listening on port 2811!')
})