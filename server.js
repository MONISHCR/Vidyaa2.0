
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
require('dotenv').config();
const axios = require('axios');


const Pdf = require('./models/pdf');

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 4000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
  });

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { subject, unit } = req.body;
    
    if (!subject || !unit) {
      return cb(new Error('Subject and unit are required fields'));
    }

    const dir = path.join(__dirname, 'uploads', subject, `Unit_${unit}`);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

const keepServerAlive = () => {
  setInterval(async () => {
    try {
      await axios.get('https://vidyaa2-0-1.onrender.com/ping');
      console.log('Pinged the server to keep it alive.');
    } catch (error) {
      console.error('Error pinging the server:', error);
    }
  }, 8 * 60 * 1000); // Ping every 5 minutes
};

keepServerAlive();

const semesterSubjects = {
  '4-1': {
    BEFA: ['CSE', 'CSM', 'CSD', 'IT'],
    'IPR MANDATE': ['CSE', 'CSM', 'CSD', 'IT'],
    DVT: ['CSM', 'CSD','CSE'],
  },
  '3-2': {
    CP: ['CSE', 'CSM', 'CSD', 'IT'],
    CN: ['CSM', 'CSD'],
    FEWD: ['CSE', 'IT'],
    'NEURAL NETWORKS': ['CSE', 'IT'],
    IOT: ['CSE', 'IT'],
    'CS MANDATE': ['CSE', 'CSM', 'CSD', 'IT'],
  },
  '3-1': {
    DAA: ['CSE', 'CSM', 'CSD', 'IT'],
    SE: ['CSE', 'CSM', 'CSD', 'IT'],
    WT: ['CSE','CSM', 'IT'],
    PP: ['CSE', 'CSM', 'CSD', 'IT'],
    DCN:['CSE','IT'],
    'AI MANDATE': ['CSE', 'CSM', 'CSD', 'IT'],
   
  },
  '2-2': {
    SMCS: ['CSE', 'CSM', 'CSD', 'IT'],
    JAVA: ['CSE', 'CSM', 'CSD', 'IT'],
    DBMS: ['CSE', 'CSM', 'CSD', 'IT'],
    OS: ['CSE', 'CSM', 'CSD', 'IT'],
    ACD: ['CSE', 'CSM', 'CSD', 'IT'],   
  },
  '2-1': {
    ADE: ['CSE', 'CSM', 'CSD', 'IT'],
    COA: ['CSE', 'CSM', 'CSD', 'IT'],
    DSCPP: ['CSE', 'CSM', 'CSD', 'IT'],
    IML: ['CSE', 'CSM', 'CSD', 'IT'],
    MFCS: ['CSE', 'CSM', 'CSD', 'IT'],
   
  },
  '1-2': {
    PP: ['CSE', 'CSM', 'CSD', 'IT'],
    LADE: ['CSE', 'CSM', 'CSD', 'IT'],
    BEEE: ['CSM', 'CSD', 'IT'],
    EP: [ 'CSM', 'CSD', 'IT'],
    CE: [ 'CSM', 'CSD', 'IT'],
   
  },
  '1-1': {
    PPS: ['CSE', 'CSM', 'CSD', 'IT'],
    ACT: ['CSE', 'CSM', 'CSD', 'IT'],
    EG: ['CSM', 'CSD', 'IT'],
    'ES MANDATE': ['CSM', 'CSD', 'IT'],
    CHEMISTRY: [ 'CSM', 'CSD', 'IT'],
   
  },
  // Define other semesters similarly
};

// Upload endpoint
app.post('/upload', upload.single('pdf'), async (req, res) => {
  const { branch, subject, unit, sem } = req.body;
  if (!branch || !subject || !unit || !sem) {
    return res.status(400).send('Branch, subject, unit, and semester are required fields');
  }

  const pdfPath = path.join('uploads', subject, `Unit_${unit}`, req.file.originalname);
  const branches = semesterSubjects[sem] && semesterSubjects[sem][subject] ? semesterSubjects[sem][subject] : [branch];

  try {
    let existingPdf = await Pdf.findOne({ subject, units: unit, pdfPaths: pdfPath });

    if (existingPdf) {
      return res.status(409).send('File already exists');
    }

    let pdf = await Pdf.findOne({ subject, branches: { $in: branches }, sem });

    if (pdf) {
      pdf.units.push(unit);
      pdf.units = [...new Set(pdf.units)];
      pdf.pdfPaths.push(pdfPath);
      pdf.pdfPaths = [...new Set(pdf.pdfPaths)];
      await pdf.save();
    } else {
      pdf = new Pdf({
        branches,
        subject,
        units: [unit],
        pdfPaths: [pdfPath],
        sem,
      });
      await pdf.save();
    }

    res.status(200).send('PDF uploaded successfully');
  } catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).send('Error uploading PDF');
  }
});
//server alive
app.get('/ping', (req, res) => {
  res.status(200).send('Server is alive');
});

// Fetch PDFs endpoint
app.get('/pdfs', async (req, res) => {
  try {
    const pdfs = await Pdf.find();
    res.json(pdfs);
  } catch (error) {
    console.error('Error fetching PDFs:', error);
    res.status(500).send('Error fetching PDFs');
  }
});

// Zipping PDFs and downloading them
app.post('/zip-and-download', async (req, res) => {
  const { subject, units } = req.body;

  if (!subject || !units || units.length === 0) {
    return res.status(400).send('Subject and units are required');
  }

  try {
    // Fetch PDFs matching the subject and selected units
    const pdfs = await Pdf.find({ subject, units: { $in: units } });

    if (pdfs.length === 0) {
      return res.status(404).send('No PDFs found for the selected units');
    }

    // Create a zip archive
    const archive = archiver('zip', { zlib: { level: 9 } });
    const zipFileName = `${subject}_Units_${units.join('_')}.zip`;

    // Set headers for zip file download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);

    // Pipe the archive stream to the response
    archive.pipe(res);

    // Add each file to the archive
    for (const pdf of pdfs) {
      for (const filePath of pdf.pdfPaths) {
        const fullFilePath = path.join(__dirname, filePath);
        if (fs.existsSync(fullFilePath)) {
          archive.file(fullFilePath, { name: path.basename(fullFilePath) });
        } else {
          console.error(`File not found: ${fullFilePath}`);
        }
      }
    }

    // Finalize the archive
    await archive.finalize();

  } catch (error) {
    console.error('Error zipping PDFs:', error);
    res.status(500).send('Error zipping PDFs');
  }
});



// Serve static files
// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Download endpoint for single PDF
app.get('/download/:subject/:unit/:filename', (req, res) => {
  const { subject, unit, filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', subject, `Unit_${unit}`, filename);

  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.download(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
