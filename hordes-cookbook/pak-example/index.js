const express = require('express');
const {library} = require('hordes');
const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http);

const hordesx = library("hordesx");

app.get('/test', function(req, res) {
    res.sendFile('test.html', {root: __dirname })
});

io.on('connection', async (socket) => {
  
  // Render the first image
  const image = await hordesx.ggpoint('n = 50');
  io.emit('plotbck', image);
  
  // Render plot on change
  socket.on('plot', async(value) => {
    const image = await hordesx.ggpoint(`n = ${value}`);
    io.emit('plotbck', image);
  });
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  
});

http.listen(2811, function () {
  console.log('Example app listening on port 2811!')
})