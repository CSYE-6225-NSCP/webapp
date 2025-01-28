const express = require('express');
const bodyParser = require('body-parser');
const healthCheckRouter = require('./src/routers/health');
const { initializeDatabase } = require('./src/models');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', healthCheckRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await initializeDatabase(); 
});

module.exports = app;