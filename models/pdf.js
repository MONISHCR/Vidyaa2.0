const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
  branches: [String],
  subject: String,
  units: [String],
  pdfPath: String,
});

const Pdf = mongoose.model('Pdf', pdfSchema);

module.exports = Pdf;
