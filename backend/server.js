require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

const PORT = process.env.PORT || 4000;

async function start() {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: 'whatsapp'
  });
  console.log('MongoDB connected');

  // routes
  app.use('/webhook', require('./routes/webhook')(io));
  app.use('/conversations', require('./routes/conversations')(io));

  //Testing Api
  app.get('/', (req, res) => res.send('WhatsApp-backend running'));

  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);
    socket.on('disconnect', () => console.log('socket disconnected', socket.id));
  });

  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start().catch(err => {
  console.error(err);
  process.exit(1);
});
