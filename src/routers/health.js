const express = require('express');
const { HealthCheck, sequelize } = require('../models/model');
const logger = require('../../logger');
const statsD = require('../metrics/statsd'); 
const router = express.Router();

router.head('/', (req, res) => {
  logger.info('HEAD /healthz request received - method not allowed');
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
  logger.info('GET /healthz - Health check initiated');

  try {
    const dbStartTime = Date.now();
    await sequelize.authenticate();
    const dbTime = Date.now() - dbStartTime;
    statsD.timing('webapp.db.auth.duration', dbTime);
    logger.info(`Database connection verified successfully in ${dbTime} ms`);

    if (Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0 ||
        req.headers['content-type'] || req.headers['content-length']) {
      logger.warn('GET /healthz - Unexpected body or headers detected, returning 400');
      return res.status(400).set('Cache-Control', 'no-cache').end();
    }

    const recordStartTime = Date.now();
    await HealthCheck.create({});
    const recordTime = Date.now() - recordStartTime;
    statsD.timing('webapp.db.recordInsert.duration', recordTime);
    logger.info(`Health record inserted into DB in ${recordTime} ms`);

    const totalTime = Date.now() - startTime;
    statsD.timing('webapp.api.healthz.duration', totalTime);
    logger.info(`GET /healthz processed successfully in ${totalTime} ms`);

    return res.status(200)
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('X-Content-Type-Options', 'nosniff')
      .end();
  } catch (error) {
    const errorTime = Date.now() - startTime;
    statsD.timing('webapp.api.healthz.duration', errorTime);
    logger.error(`GET /healthz failed - DB connection error: ${error.message}`);
    return res.status(503)
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('X-Content-Type-Options', 'nosniff')
      .end();
  }
});

router.all('/', (req, res) => {
  logger.warn(`Unsupported method ${req.method} used on /healthz`);
  statsD.increment(`webapp.healthz.${req.method.toLowerCase()}.request`);
  return res.status(405)
    .set("cache-control", 'no-cache, no-store, must-revalidate')
    .set('Pragma', 'no-cache')
    .set('X-Content-Type-Options', 'nosniff')
    .end();
});

router.use((req, res) => {
  logger.warn('Unknown route accessed on /healthz');
  statsD.increment('webapp.healthz.invalid_route');
  return res.status(400).json();
});

module.exports = router;