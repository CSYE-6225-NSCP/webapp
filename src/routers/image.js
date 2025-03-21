const express = require('express');
const router = express.Router();
const { File } = require('../models/file');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const upload = multer();
const s3 = new AWS.S3();
const logger = require('../../logger');

router.head('/', (req, res) => {
  logger.info('HEAD /v1/file - 405 Method Not Allowed');
  return res.status(405).end();
});

router.head('/:id', (req, res) => {
  logger.info(`HEAD /v1/file/${req.params.id} - 405 Method Not Allowed`);
  return res.status(405).end();
});

router.post('/', upload.single('profilePic'), async (req, res) => {
  const file = req.file;
  if (!file) {
    logger.warn('POST /v1/file - No file provided');
    return res.status(400).end();
  }

  try {
    const id = uuidv4();
    const key = `${id}/${file.originalname}`;

    const startTime = Date.now();
    await s3.upload({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }).promise();
    const s3Duration = Date.now() - startTime;
    logger.info(`S3 upload complete in ${s3Duration} ms`);

    const uploadedFile = await File.create({
      id,
      file_name: file.originalname,
      url: `${process.env.S3_BUCKET_NAME}/${key}`,
    });

    logger.info(`File uploaded: ID=${uploadedFile.id}, Name=${uploadedFile.file_name}`);
    res.status(201).json({
      id: uploadedFile.id,
      file_name: uploadedFile.file_name,
      url: `${process.env.S3_BUCKET_NAME}/${key}`,
      upload_date: uploadedFile.upload_date.toISOString().split('T')[0],
    });

  } catch (error) {
    logger.error(`Error in POST /v1/file: ${error.stack}`);
    res.status(500).end();
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const file = await File.findByPk(id);

    if (!file) {
      logger.warn(`GET /v1/file/${id} - File not found`);
      return res.status(404).end();
    }

    logger.info(`GET /v1/file/${id} - File fetched successfully`);
    res.status(200).json({
      file_name: file.file_name,
      id: file.id,
      url: `${process.env.S3_BUCKET_NAME}/${file.url}`,
      upload_date: file.upload_date.toISOString().split('T')[0],
    });
  } catch (error) {
    logger.error(`Error in GET /v1/file/${id}: ${error.stack}`);
    res.status(500).end();
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);
    if (!file) {
      logger.warn(`DELETE /v1/file/${req.params.id} - File not found`);
      return res.status(404).end();
    }

    const key = file.url.split(`${process.env.S3_BUCKET_NAME}/`)[1];

    await s3.deleteObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    }).promise();

    await file.destroy();

    logger.info(`DELETE /v1/file/${req.params.id} - File deleted`);
    return res.status(204).end();
  } catch (error) {
    logger.error(`Error in DELETE /v1/file/${req.params.id}: ${error.stack}`);
    res.status(500).end();
  }
});

router.all('/', (req, res) => {
  if (req.method === 'GET' || req.method === 'DELETE') {
    logger.warn(`ALL /v1/file - Invalid method ${req.method}`);
    return res.status(400).end();
  } else {
    logger.warn(`ALL /v1/file - 405 Method Not Allowed`);
    return res.status(405).end();
  }
});

router.all('/:id', (req, res) => {
  if (!['GET', 'DELETE'].includes(req.method)) {
    logger.warn(`ALL /v1/file/${req.params.id} - 405 Method Not Allowed`);
    return res.status(405).end();
  }
});

module.exports = router;