const express = require('express');
const { HealthCheck, sequelize } = require('../models/model');
const logger = require('../../logger');
const router = express.Router();

router.head('/', (req, res) => {
  logger.info('HEAD /healthz - 405 Method Not Allowed');
  return res.status(405)
    .set("cache-control", 'no-cache, no-store, must-revalidate')
    .set('Pragma', 'no-cache')
    .set('X-Content-Type-Options', 'nosniff')
    .end();
});

router.get('/', async (req, res) => {
  try {
    await sequelize.authenticate();
    if (Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0 ||
        req.headers['content-type'] || req.headers['content-length']) {
      logger.warn('GET /healthz - Invalid headers or body');
      return res.status(400).set('Cache-Control', 'no-cache').end();
    }

    await HealthCheck.create({});
    logger.info('GET /healthz - DB healthy');
    res.status(200)
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('X-Content-Type-Options', 'nosniff')
      .end();
  } catch (error) {
    logger.error(`GET /healthz - DB error: ${error.stack}`);
    res.status(503)
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('X-Content-Type-Options', 'nosniff')
      .end();
  }
});

router.all('/', (req, res) => {
  logger.warn(`ALL /healthz - Method ${req.method} not allowed`);
  res.status(405)
    .set("cache-control", 'no-cache, no-store, must-revalidate')
    .set('Pragma', 'no-cache')
    .set('X-Content-Type-Options', 'nosniff')
    .end();
});

router.use((req, res) => {
  logger.warn(`Invalid route on healthz`);
  res.status(400).json();
});

module.exports = router;