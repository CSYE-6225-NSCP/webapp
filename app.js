const express = require('express');
const bodyParser = require('body-parser');
const healthCheckRouter = require('./src/routers/health');
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', healthCheckRouter);

const PORT = process.env.PORT || process.env.HOST;
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;