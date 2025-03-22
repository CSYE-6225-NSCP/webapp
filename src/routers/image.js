const express = require('express');
const router = express.Router();
const { File } = require('../models/file');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const upload = multer();
const s3 = new AWS.S3();
const logger = require('../../logger');
const statsD = require('../metrics/statsd'); // StatsD client

router.head('/', (req, res) => {
  logger.info('HEAD /v1/file - Method not allowed');
  statsD.increment('webapp.api.file.head.request');
  return res.status(405).end();
});

router.head('/:id', (req, res) => {
  logger.info(`HEAD /v1/file/${req.params.id} - Method not allowed`);
  statsD.increment('webapp.api.file.head.request');
  return res.status(405).end();
});

router.post('/', upload.single('profilePic'), async (req, res) => {
  const totalStart = Date.now();
  statsD.increment('webapp.api.file.post.request');
  logger.info('POST /v1/file - File upload initiated');

  const file = req.file;
  if (!file) {
    logger.warn('POST /v1/file - No file received in request');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const id = uuidv4();
    const key = `${id}/${file.originalname}`;

    const s3Start = Date.now();
    await s3.upload({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }).promise();
    const s3Duration = Date.now() - s3Start;
    statsD.timing('webapp.s3.upload.duration', s3Duration);
    logger.info(`S3 upload successful for ${file.originalname} (Duration: ${s3Duration} ms)`);

    const dbStart = Date.now();
    const uploadedFile = await File.create({
      id,
      file_name: file.originalname,
      url: `${process.env.S3_BUCKET_NAME}/${key}`,
    });
    const dbDuration = Date.now() - dbStart;
    statsD.timing('webapp.db.file.insert.duration', dbDuration);
    logger.info(`File metadata inserted into DB (Duration: ${dbDuration} ms)`);

    const totalDuration = Date.now() - totalStart;
    statsD.timing('webapp.api.file.post.duration', totalDuration);
    logger.info(`POST /v1/file completed in ${totalDuration} ms`);

    res.status(201).json({
      id: uploadedFile.id,
      file_name: uploadedFile.file_name,
      url: `${process.env.S3_BUCKET_NAME}/${key}`,
      upload_date: uploadedFile.upload_date.toISOString().split('T')[0],
    });
  } catch (error) {
    logger.error(`POST /v1/file - Upload failed: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  const totalStart = Date.now();
  statsD.increment('webapp.api.file.get.request');
  const { id } = req.params;
  logger.info(`GET /v1/file/${id} - File fetch initiated`);

  try {
    const file = await File.findByPk(id);

    if (!file) {
      logger.warn(`GET /v1/file/${id} - File not found`);
      return res.status(404).json({ error: 'File not found' });
    }

    const duration = Date.now() - totalStart;
    statsD.timing('webapp.api.file.get.duration', duration);
    logger.info(`GET /v1/file/${id} - File retrieved in ${duration} ms`);

    res.status(200).json({
      id: file.id,
      file_name: file.file_name,
      url: `${process.env.S3_BUCKET_NAME}/${file.url}`,
      upload_date: file.upload_date.toISOString().split('T')[0],
    });
  } catch (error) {
    logger.error(`GET /v1/file/${id} - Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/:id', async (req, res) => {
  const totalStart = Date.now();
  statsD.increment('webapp.api.file.delete.request');
  const { id } = req.params;
  logger.info(`DELETE /v1/file/${id} - Deletion initiated`);

  try {
    const file = await File.findByPk(id);
    if (!file) {
      logger.warn(`DELETE /v1/file/${id} - File not found`);
      return res.status(404).json({ error: 'File not found' });
    }

    const key = file.url.split(`${process.env.S3_BUCKET_NAME}/`)[1];

    const s3Start = Date.now();
    await s3.deleteObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    }).promise();
    const s3Duration = Date.now() - s3Start;
    statsD.timing('webapp.s3.delete.duration', s3Duration);
    logger.info(`S3 deletion successful (Duration: ${s3Duration} ms)`);

    const dbStart = Date.now();
    await file.destroy();
    const dbDuration = Date.now() - dbStart;
    statsD.timing('webapp.db.file.delete.duration', dbDuration);
    logger.info(`File record deleted from DB (Duration: ${dbDuration} ms)`);

    const totalDuration = Date.now() - totalStart;
    statsD.timing('webapp.api.file.delete.duration', totalDuration);
    logger.info(`DELETE /v1/file/${id} - Completed in ${totalDuration} ms`);

    return res.status(204).end();
  } catch (error) {
    logger.error(`DELETE /v1/file/${id} - Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.all('/', (req, res) => {
  statsD.increment(`webapp.api.file.invalid_method.${req.method.toLowerCase()}`);
  logger.warn(`ALL /v1/file - Invalid method ${req.method}`);
  const status = ['GET', 'DELETE'].includes(req.method) ? 400 : 405;
  return res.status(status).end();
});

router.all('/:id', (req, res) => {
  if (!['GET', 'DELETE'].includes(req.method)) {
    statsD.increment(`webapp.api.file.invalid_method.${req.method.toLowerCase()}`);
    logger.warn(`ALL /v1/file/${req.params.id} - Invalid method ${req.method}`);
    return res.status(405).end();
  }
});

module.exports = router;