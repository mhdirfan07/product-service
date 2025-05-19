// server.js
const express = require('express');
const bodyParser = require('body-parser');
const productRoutes = require('./routes/routes'); // Import product routes

const app = express();

app.use(bodyParser.json());

// Use product routes with image upload
app.use('/api', productRoutes); // Pass multer middleware to routes

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
