const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

function getBucket() {
  if (!mongoose.connection.db) {
    throw new Error('MongoDB not connected');
  }
  return new GridFSBucket(mongoose.connection.db, { bucketName: 'images' });
}

module.exports = { getBucket };
