const express = require('express');
const { HealthCheck, sequelize } = require('../models');
const router = express.Router();

router.head('/healthz', (req, res) => {
  return res.status(405).end(); 
});


router.get('/healthz', async (req, res) => {
  try {
    await sequelize.authenticate(); 

    console.log('Health check initiated'); 
    if (Object.keys(req.body).length !== 0) {
      return res.status(400).set('Cache-Control', 'no-cache').end();
    }

    await HealthCheck.create({}); 
    res
      .status(200)
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('X-Content-Type-Options', 'nosniff')
      .end();
  } catch (error) {
    console.error('Database unavailable, returning 503:', error.message);
    res
      .status(503)
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('X-Content-Type-Options', 'nosniff')
      .end();
  }
});

router.all('/healthz', (req, res) => {
  res.status(405).end(); 
});

module.exports = router;