const express = require('express');
const bodyParser = require('body-parser');
const healthCheckRouter = require('./src/routers/health');
const fileRouter = require('./src/routers/image');
const { sequelize } = require('./src/models/model');
const initDatabase = require('./src/db/initDatabase');
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/healthz', healthCheckRouter); // Changed from '/' to '/healthz'
app.use('/v1/file', fileRouter);


app.use((req, res) => {
  res.status(400)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate')
    .set('Pragma', 'no-cache')
    .set('X-Content-Type-Options', 'nosniff')
    .end();
});

const PORT = process.env.PORT || process.env.SERVER_PORT;

const startServer = async () => {
  try {
    await initDatabase();
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    const server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

    process.on('SIGTERM', async () => {
      await sequelize.close();
      server.close(() => console.log("Server closed."));
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}

module.exports = { app };