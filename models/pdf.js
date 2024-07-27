const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
  branches: [String],
  subject: String,
  units: [String],
  pdfPaths: [String], // Updated to store multiple file paths
});

module.exports = mongoose.model('Pdf', pdfSchema);
