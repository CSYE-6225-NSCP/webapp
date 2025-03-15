const express = require('express');
const { HealthCheck, sequelize } = require('../models/model');
const router = express.Router();

router.head('/', (req, res) => { return res.status(405)
  .set("cache-control", 'no-cache, no-store, must-revalidate')
  .set('Pragma', 'no-cache')
  .set('X-Content-Type-Options', 'nosniff')
  .end(); 
});


router.get('/', async (req, res) => {
  try {
    await sequelize.authenticate(); 

    // console.log('auth tested'); 
    
    if (Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0 || 
        req.headers['content-type'] || req.headers['content-length']){
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
    res
      .status(503)
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('X-Content-Type-Options', 'nosniff')
      .end();
  }
});

router.all('/', (req, res) => {
  res.status(405)
  .set("cache-control", 'no-cache, no-store, must-revalidate')
  .set('Pragma', 'no-cache')
  .set('X-Content-Type-Options', 'nosniff')
  .end(); 
});

router.use((req, res) =>{
  res.status(400). json();
});

module.exports = router;