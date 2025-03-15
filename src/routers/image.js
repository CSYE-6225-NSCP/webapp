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
    const { user_id } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const actualUserId = user_id || uuidv4();

    const id = uuidv4();
    const key = `${actualUserId}/${id}/${file.originalname}`;

    await s3.upload({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }).promise();

    const uploadedFile = await File.create({
      id,
      file_name: file.originalname,
      url: key,
      user_id: actualUserId,
    });

    res.status(201).json({
      id: uploadedFile.id,
      file_name: uploadedFile.file_name,
      url: uploadedFile.url,
      upload_date: uploadedFile.upload_date.toISOString().split('T')[0],
      user_id: uploadedFile.user_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
});

router.get('/', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "Missing file id" });

    const file = await File.findByPk(id);
    if (!file) return res.status(404).json({ error: "File not found" });

    res.status(200).json({
      file_name: file.file_name,
      id: file.id,
      url: file.url,
      upload_date: file.upload_date.toISOString().split('T')[0],
      user_id: file.user_id
    });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
});

router.delete('/', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "Missing file id" });

    const file = await File.findByPk(id);
    if (!file) return res.status(404).json({ error: "File not found" });

    await s3.deleteObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: file.url,
    }).promise();

    await file.destroy();
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
});

module.exports = router;