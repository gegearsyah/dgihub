/**
 * S3 Service
 * Handles file uploads to AWS S3
 */

const AWS = require('aws-sdk');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-southeast-5'
});

class S3Service {
  /**
   * Upload file to S3
   * @param {Buffer|Stream} file - File data
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async upload(file, options = {}) {
    const {
      bucket = process.env.S3_BUCKET || 'dgihub-prod',
      key,
      contentType,
      metadata = {}
    } = options;

    const uploadParams = {
      Bucket: bucket,
      Key: key || `uploads/${uuidv4()}`,
      Body: file,
      ContentType: contentType || 'application/octet-stream',
      ServerSideEncryption: 'AES256',
      Metadata: {
        ...metadata,
        uploadedAt: new Date().toISOString()
      }
    };

    try {
      const result = await s3.upload(uploadParams).promise();
      
      return {
        success: true,
        url: result.Location,
        key: result.Key,
        bucket: result.Bucket,
        etag: result.ETag
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  /**
   * Delete file from S3
   */
  async delete(bucket, key) {
    try {
      await s3.deleteObject({
        Bucket: bucket,
        Key: key
      }).promise();
      
      return { success: true };
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  /**
   * Get signed URL for file access
   */
  async getSignedUrl(bucket, key, expiresIn = 3600) {
    try {
      const url = s3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: key,
        Expires: expiresIn
      });
      
      return { url };
    } catch (error) {
      console.error('S3 signed URL error:', error);
      throw new Error('Failed to generate signed URL');
    }
  }
}

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'video/mp4',
      'video/webm',
      'image/jpeg',
      'image/png',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

module.exports = {
  s3Service: new S3Service(),
  upload
};


