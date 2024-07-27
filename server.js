
// // const express = require('express');
// // const mongoose = require('mongoose');
// // const multer = require('multer');
// // const cors = require('cors');
// // const fs = require('fs');
// // const path = require('path');
// // require('dotenv').config(); // Load environment variables from .env file

// // const Pdf = require('./models/pdf'); // Assuming pdf.js is the file for the schema

// // const app = express();
// // app.use(cors());
// // app.use(express.json());

// // // MongoDB connection
// // mongoose.connect(process.env.MONGO_URI)
// //   .then(() => {
// //     console.log('Connected to MongoDB Atlas');
// //   })
// //   .catch((error) => {
// //     console.error('Error connecting to MongoDB Atlas:', error);
// //   });

// // // Multer setup
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     const { subject, unit } = req.body;
// //     const dir = path.join(__dirname, 'uploads', subject, `Unit_${unit}`);
// //     fs.mkdirSync(dir, { recursive: true });
// //     cb(null, dir);
// //   },
// //   filename: (req, file, cb) => {
// //     cb(null, file.originalname);
// //   },
// // });

// // const upload = multer({ storage });

// // const commonSubjects = {
// //   CP: ['CSM', 'CSD', 'IT'],
// //   CN: ['CSM', 'CSD'],
// //   FEWD: ['CSE', 'IT'],
// //   'NEURAL NETWORKS': ['CSE', 'IT'],
// //   IOT: ['CSE', 'IT'],
// // };

// // // Upload endpoint
// // app.post('/upload', upload.single('pdf'), async (req, res) => {
// //   const { branch, subject, unit } = req.body;
// //   const pdfPath = path.join('uploads', subject, `Unit_${unit}`, req.file.originalname);

// //   const branches = commonSubjects[subject] ? commonSubjects[subject] : [branch];

// //   try {
// //     // Check if the file already exists
// //     if (fs.existsSync(pdfPath)) {
// //       return res.status(409).send('File already exists');
// //     }

// //     // Check if PDF already exists for the subject and branches
// //     let pdf = await Pdf.findOne({ subject, branches: { $in: branches } });

// //     if (pdf) {
// //       // Update existing entry
// //       pdf.units.push(unit);
// //       pdf.units = [...new Set(pdf.units)]; // Remove duplicates
// //       pdf.pdfPath = pdfPath; // Update path in case the file is replaced
// //       await pdf.save();
// //     } else {
// //       // Create a new entry
// //       pdf = new Pdf({
// //         branches,
// //         subject,
// //         units: [unit],
// //         pdfPath,
// //       });
// //       await pdf.save();
// //     }

// //     res.status(200).send('PDF uploaded successfully');
// //   } catch (error) {
// //     console.error('Error uploading PDF:', error);
// //     res.status(500).send('Error uploading PDF');
// //   }
// // });

// // // Fetch PDFs endpoint
// // app.get('/pdfs', async (req, res) => {
// //   try {
// //     const pdfs = await Pdf.find();
// //     res.json(pdfs);
// //   } catch (error) {
// //     console.error('Error fetching PDFs:', error);
// //     res.status(500).send('Error fetching PDFs');
// //   }
// // });

// // // Serve static files
// // app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // app.listen(5000, () => {
// //   console.log('Server running on port 5000');
// // });

// const express = require('express');
// const mongoose = require('mongoose');
// const multer = require('multer');
// const cors = require('cors');
// const fs = require('fs');
// const path = require('path');
// const archiver = require('archiver'); // Add this for zipping files
// require('dotenv').config(); // Load environment variables from .env file

// const Pdf = require('./models/pdf'); // Assuming pdf.js is the file for the schema

// const app = express();
// app.use(cors());
// app.use(express.json());

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('Connected to MongoDB Atlas');
//   })
//   .catch((error) => {
//     console.error('Error connecting to MongoDB Atlas:', error);
//   });

// // Multer setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const { subject, unit } = req.body;
//     const dir = path.join(__dirname, 'uploads', subject, `Unit_${unit}`);
//     fs.mkdirSync(dir, { recursive: true });
//     cb(null, dir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname);
//   },
// });

// const upload = multer({ storage });

// const commonSubjects = {
//   CP: ['CSM', 'CSD', 'IT'],
//   CN: ['CSM', 'CSD'],
//   FEWD: ['CSE', 'IT'],
//   'NEURAL NETWORKS': ['CSE', 'IT'],
//   IOT: ['CSE', 'IT'],
// };

// // Upload endpoint
// app.post('/upload', upload.single('pdf'), async (req, res) => {
//   const { branch, subject, unit } = req.body;
//   const pdfPath = path.join('uploads', subject, `Unit_${unit}`, req.file.originalname);

//   const branches = commonSubjects[subject] ? commonSubjects[subject] : [branch];

//   try {
//     // Check if the file already exists
//     if (fs.existsSync(pdfPath)) {
//       return res.status(409).send('File already exists');
//     }

//     // Check if PDF already exists for the subject and branches
//     let pdf = await Pdf.findOne({ subject, branches: { $in: branches } });

//     if (pdf) {
//       // Update existing entry
//       pdf.units.push(unit);
//       pdf.units = [...new Set(pdf.units)]; // Remove duplicates
//       pdf.pdfPath = pdfPath; // Update path in case the file is replaced
//       await pdf.save();
//     } else {
//       // Create a new entry
//       pdf = new Pdf({
//         branches,
//         subject,
//         units: [unit],
//         pdfPath,
//       });
//       await pdf.save();
//     }

//     res.status(200).send('PDF uploaded successfully');
//   } catch (error) {
//     console.error('Error uploading PDF:', error);
//     res.status(500).send('Error uploading PDF');
//   }
// });

// // Fetch PDFs endpoint
// app.get('/pdfs', async (req, res) => {
//   try {
//     const pdfs = await Pdf.find();
//     res.json(pdfs);
//   } catch (error) {
//     console.error('Error fetching PDFs:', error);
//     res.status(500).send('Error fetching PDFs');
//   }
// });

// // Zipping PDFs and downloading them
// app.post('/zip-and-download', async (req, res) => {
//   const { subject, units } = req.body;

//   if (!subject || !units || units.length === 0) {
//     return res.status(400).send('Subject and units are required');
//   }

//   try {
//     // Find PDFs by subject and units
//     const pdfs = await Pdf.find({ subject, units: { $in: units } });

//     if (pdfs.length === 0) {
//       return res.status(404).send('No PDFs found for the selected units');
//     }

//     // Create a zip archive
//     const archive = archiver('zip', { zlib: { level: 9 } });

//     // Set the zip file name
//     const zipFileName = `${subject}_Units_${units.join('_')}.zip`;
//     res.attachment(zipFileName);

//     // Pipe the archive to the response
//     archive.pipe(res);

//     // Append files to the archive
//     pdfs.forEach((pdf) => {
//       const filePath = path.join(__dirname, pdf.pdfPath);
//       if (fs.existsSync(filePath)) {
//         archive.file(filePath, { name: path.basename(filePath) });
//       }
//     });

//     // Finalize the archive
//     archive.finalize();
//   } catch (error) {
//     console.error('Error zipping PDFs:', error);
//     res.status(500).send('Error zipping PDFs');
//   }
// });

// // Serve static files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.listen(5000, () => {
//   console.log('Server running on port 5000');
// });


// const express = require('express');
// const mongoose = require('mongoose');
// const multer = require('multer');
// const cors = require('cors');
// const fs = require('fs');
// const path = require('path');
// const archiver = require('archiver'); // Add this for zipping files
// require('dotenv').config(); // Load environment variables from .env file

// const Pdf = require('./models/pdf'); // Assuming pdf.js is the file for the schema

// const app = express();
// app.use(cors());
// app.use(express.json());

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('Connected to MongoDB Atlas');
//   })
//   .catch((error) => {
//     console.error('Error connecting to MongoDB Atlas:', error);
//   });

// // Multer setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const { subject, unit } = req.body;
//     const dir = path.join(__dirname, 'uploads', subject, `Unit_${unit}`);
//     fs.mkdirSync(dir, { recursive: true });
//     cb(null, dir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname);
//   },
// });

// const upload = multer({ storage });

// const commonSubjects = {
//   CP: ['CSM', 'CSD', 'IT'],
//   CN: ['CSM', 'CSD'],
//   FEWD: ['CSE', 'IT'],
//   'NEURAL NETWORKS': ['CSE', 'IT'],
//   IOT: ['CSE', 'IT'],
// };

// // Upload endpoint
// app.post('/upload', upload.single('pdf'), async (req, res) => {
//   const { branch, subject, unit } = req.body;
//   const pdfPath = path.join('uploads', subject, `Unit_${unit}`, req.file.originalname);

//   const branches = commonSubjects[subject] ? commonSubjects[subject] : [branch];

//   try {
//     // Check if the file already exists for the given subject and unit
//     let existingPdf = await Pdf.findOne({ subject, units: unit, pdfPath });

//     if (existingPdf) {
//       return res.status(409).send('File already exists');
//     }

//     // Check if PDF already exists for the subject and branches
//     let pdf = await Pdf.findOne({ subject, branches: { $in: branches } });

//     if (pdf) {
//       // Update existing entry
//       pdf.units.push(unit);
//       pdf.units = [...new Set(pdf.units)]; // Remove duplicates
//       pdf.pdfPath = pdfPath; // Update path in case the file is replaced
//       await pdf.save();
//     } else {
//       // Create a new entry
//       pdf = new Pdf({
//         branches,
//         subject,
//         units: [unit],
//         pdfPath,
//       });
//       await pdf.save();
//     }

//     res.status(200).send('PDF uploaded successfully');
//   } catch (error) {
//     console.error('Error uploading PDF:', error);
//     res.status(500).send('Error uploading PDF');
//   }
// });

// // Fetch PDFs endpoint
// app.get('/pdfs', async (req, res) => {
//   try {
//     const pdfs = await Pdf.find();
//     res.json(pdfs);
//   } catch (error) {
//     console.error('Error fetching PDFs:', error);
//     res.status(500).send('Error fetching PDFs');
//   }
// });

// // Zipping PDFs and downloading them
// app.post('/zip-and-download', async (req, res) => {
//   const { subject, units } = req.body;

//   if (!subject || !units || units.length === 0) {
//     return res.status(400).send('Subject and units are required');
//   }

//   try {
//     // Find PDFs by subject and units
//     const pdfs = await Pdf.find({ subject, units: { $in: units } });

//     if (pdfs.length === 0) {
//       return res.status(404).send('No PDFs found for the selected units');
//     }

//     // Create a zip archive
//     const archive = archiver('zip', { zlib: { level: 9 } });

//     // Set the zip file name
//     const zipFileName = `${subject}_Units_${units.join('_')}.zip`;
//     res.attachment(zipFileName);

//     // Pipe the archive to the response
//     archive.pipe(res);

//     // Append files to the archive
//     pdfs.forEach((pdf) => {
//       const filePath = path.join(__dirname, pdf.pdfPath);
//       if (fs.existsSync(filePath)) {
//         archive.file(filePath, { name: path.basename(filePath) });
//       }
//     });

//     // Finalize the archive
//     archive.finalize();
//   } catch (error) {
//     console.error('Error zipping PDFs:', error);
//     res.status(500).send('Error zipping PDFs');
//   }
// });

// // Serve static files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.listen(5000, () => {
//   console.log('Server running on port 5000');
// });
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
require('dotenv').config();

const Pdf = require('./models/pdf');

const app = express();
app.use(cors());
app.use(express.json());

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
    const dir = path.join(__dirname, 'uploads', subject, `Unit_${unit}`);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

const commonSubjects = {
  CP: ['CSE','CSM', 'CSD', 'IT'],
  CN: ['CSM', 'CSD'],
  FEWD: ['CSE', 'IT'],
  'NEURAL NETWORKS': ['CSE', 'IT'],
  IOT: ['CSE', 'IT'],
};

// Upload endpoint
app.post('/upload', upload.single('pdf'), async (req, res) => {
  const { branch, subject, unit } = req.body;
  const pdfPath = path.join('uploads', subject, `Unit_${unit}`, req.file.originalname);

  const branches = commonSubjects[subject] ? commonSubjects[subject] : [branch];

  try {
    let existingPdf = await Pdf.findOne({ subject, units: unit, pdfPath });

    if (existingPdf) {
      return res.status(409).send('File already exists');
    }

    let pdf = await Pdf.findOne({ subject, branches: { $in: branches } });

    if (pdf) {
      pdf.units.push(unit);
      pdf.units = [...new Set(pdf.units)];
      pdf.pdfPath = pdfPath;
      await pdf.save();
    } else {
      pdf = new Pdf({
        branches,
        subject,
        units: [unit],
        pdfPath,
      });
      await pdf.save();
    }

    res.status(200).send('PDF uploaded successfully');
  } catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).send('Error uploading PDF');
  }
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
    const pdfs = await Pdf.find({ subject, units: { $in: units } });

    if (pdfs.length === 0) {
      return res.status(404).send('No PDFs found for the selected units');
    }

    // Create a zip archive
    const archive = archiver('zip', { zlib: { level: 9 } });
    const zipFileName = `${subject}_Units_${units.join('_')}.zip`;

    // Set headers to force download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);

    // Pipe the archive to the response
    archive.pipe(res);

    pdfs.forEach((pdf) => {
      const filePath = path.join(__dirname, pdf.pdfPath);
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: path.basename(filePath) });
      }
    });

    archive.finalize();
  } catch (error) {
    console.error('Error zipping PDFs:', error);
    res.status(500).send('Error zipping PDFs');
  }
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Download endpoint
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

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
