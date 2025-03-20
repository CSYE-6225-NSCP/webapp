const express = require('express');
const router = express.Router();
const { File } = require('../models/file');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const upload = multer(); 
const s3 = new AWS.S3();


router.head('/', (req, res) => {
  return res.status(405).end();
});

router.head('/:id', (req, res) => {
  return res.status(405).end();
});


router.post('/', upload.single('profilePic'), async (req, res) => {
    const file = req.file;
    if (!file) {
      return res.status(400).end();
    }

    const id = uuidv4();
    const key = `${id}/${file.originalname}`;

    await s3.upload({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }).promise();

    const uploadedFile = await File.create({
      id,
      file_name: file.originalname,
      url: `${process.env.S3_BUCKET_NAME}/${key}`,
    });

    res.status(201).json({
      id: uploadedFile.id,
      file_name: uploadedFile.file_name,
      url: `${process.env.S3_BUCKET_NAME}/${key}`,
      upload_date: uploadedFile.upload_date.toISOString().split('T')[0],
    });
  } 
);

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    const file = await File.findByPk(id);

    if (!file) {
      return res.status(404).end();
    }

    res.status(200).json({
      file_name: file.file_name,
      id: file.id,
      url:`${process.env.S3_BUCKET_NAME}/${file.url}`,
      upload_date: file.upload_date.toISOString().split('T')[0],
    });
  } 
);

router.delete('/:id', async (req, res) => {
    const file = await File.findByPk(req.params.id);
    if (!file) {
      return res.status(404).end();
    }

    const key = file.url.split(`${process.env.S3_BUCKET_NAME}/`)[1];

    await s3.deleteObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    }).promise();

    await file.destroy();

    return res.status(204).end(); 
  } 
);

router.all('/', (req, res) => {
  if (req.method === 'GET' || req.method === 'DELETE') {
    return res.status(400).end();
  } else {
    return res.status(405).end();
  }
});

router.all('/:id', (req, res) => {
  if (!['GET', 'DELETE'].includes(req.method)) {
    return res.status(405).end();
  }
});

module.exports = router;