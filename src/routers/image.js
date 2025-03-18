const express = require('express');
const router = express.Router();
const { File } = require('../models/file');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const upload = multer(); 
const s3 = new AWS.S3();

router.post('/', upload.single('file'), async (req, res) => {
  try {
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
      url: key
    });

    res.status(201).json({
      id: uploadedFile.id,
      file_name: uploadedFile.file_name,
      url: `${process.env.S3_BUCKET_NAME}/${key}`,
      upload_date: uploadedFile.upload_date.toISOString().split('T')[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
});

router.get('/:id', async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).end();
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findByPk(id);
    if (!file) {
      return res.status(404).end();
    }

    await s3.deleteObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: file.url,
    }).promise();

    await file.destroy();

    return res.status(204).end();
  } catch (error) {
    return res.status(500).end();
  }
});

module.exports = router;