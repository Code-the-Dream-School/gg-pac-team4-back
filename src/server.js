const { PORT = 8000 } = process.env;
const server = require('./app');

server.listen(PORT, () => {
  console.log('Server is runnung on', PORT);
});
