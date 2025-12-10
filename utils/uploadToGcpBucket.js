const { Storage } = require('@google-cloud/storage');
require('dotenv').config();
const path = require('path');
// const storage = new Storage({
//   keyFilename: path.join(__dirname, '../serviceAccount.json'),
// });

const storage = new Storage();
// const storage = new Storage();
const bucketName = process.env.GCP_BUCKET_NAME;  // Set di .env

async function uploadImageToGcp(imageBuffer, imageName) {
  if (!bucketName) {
    throw new Error('GCP_BUCKET_NAME environment variable is missing' + bucketName);
  }
  const bucket = storage.bucket(bucketName);

  // Tambah timestamp/random supaya nama unik
  const gcpFileName = `products/img/${Date.now()}-${imageName}`;
  const file = bucket.file(gcpFileName);

  await file.save(imageBuffer, {
    metadata: { contentType: 'image/jpeg' },  // sesuaikan jika perlu
    // public: true,
  });

  // Buat URL publik (format)
  const publicUrl = `https://storage.googleapis.com/${bucketName}/${gcpFileName}`;
  return publicUrl;
}

// Fungsi hapus gambar dari bucket GCP
async function deleteImageFromGcp(imageUrl) {
  if (!bucketName) {
    throw new Error('GCP_BUCKET_NAME environment variable is missing' + bucketName);
  }
  const bucket = storage.bucket(bucketName);

  // imageUrl contoh: https://storage.googleapis.com/bucketName/products/img/12345-img.jpg
  // Jadi kita perlu ekstrak path setelah bucketName
  const url = new URL(imageUrl);
  const pathname = url.pathname; // /bucketName/products/img/12345-img.jpg
  // Hapus leading slash dan bucketName
  const filePath = pathname.replace(`/${bucketName}/`, '');

  const file = bucket.file(filePath);
  await file.delete();
}

module.exports = { uploadImageToGcp, deleteImageFromGcp };
