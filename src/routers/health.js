const express = require('express');
const { HealthCheck, sequelize } = require('../models/model');
const logger = require('../../logger');
const statsD = require('../metrics/statsd'); 
const router = express.Router();

router.head('/', (req, res) => {
  logger.info('Received a HEAD request on /healthz. This method is not allowed.');
  statsD.increment('webapp.healthz.head.request');
  return res.status(405)
    .set("cache-control", 'no-cache, no-store, must-revalidate')
    .set('Pragma', 'no-cache')
    .set('X-Content-Type-Options', 'nosniff')
    .end();
});

router.get('/', async (req, res) => {
  const startTime = Date.now();
  statsD.increment('webapp.healthz.get.request');
  logger.info('Received a GET request on /healthz. Starting health check.');

  try {
    const dbStartTime = Date.now();
    await sequelize.authenticate();
    const dbTime = Date.now() - dbStartTime;
    statsD.timing('webapp.db.auth.duration', dbTime);
    logger.info(`Successfully connected to the database in ${dbTime} ms.`);

    if (Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0 ||
        req.headers['content-type'] || req.headers['content-length']) {
      logger.warn('GET request on /healthz contains unexpected body or headers. Returning 400 Bad Request.');
      return res.status(400).set('Cache-Control', 'no-cache').end();
    }

    const recordStartTime = Date.now();
    await HealthCheck.create({});
    const recordTime = Date.now() - recordStartTime;
    statsD.timing('webapp.db.recordInsert.duration', recordTime);
    logger.info(`A health record was successfully added to the database in ${recordTime} ms.`);

    const totalTime = Date.now() - startTime;
    statsD.timing('webapp.api.healthz.duration', totalTime);
    logger.info(`GET /healthz completed successfully in ${totalTime} ms.`);

    return res.status(200)
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('X-Content-Type-Options', 'nosniff')
      .end();
  } catch (error) {
    const errorTime = Date.now() - startTime;
    statsD.timing('webapp.api.healthz.duration', errorTime);
    logger.error(`Health check failed. Unable to connect to the database. Error: ${error.message}`);
    return res.status(503)
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('X-Content-Type-Options', 'nosniff')
      .end();
  }
});

router.all('/', (req, res) => {
  logger.warn(`Received a ${req.method} request on /healthz, but this method is not supported.`);
  statsD.increment(`webapp.healthz.${req.method.toLowerCase()}.request`);
  return res.status(405)
    .set("cache-control", 'no-cache, no-store, must-revalidate')
    .set('Pragma', 'no-cache')
    .set('X-Content-Type-Options', 'nosniff')
    .end();
});

router.use((req, res) => {
  logger.warn('Request made to an unknown or invalid route under /healthz.');
  statsD.increment('webapp.healthz.invalid_route');
  return res.status(400).json();
});

module.exports = router;