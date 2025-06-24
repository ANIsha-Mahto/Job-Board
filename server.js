const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialize
const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB error:', err));

// Resume upload setup
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Create uploads folder if it doesn't exist
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Job Model
const Job = mongoose.model('Job', new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  postedAt: { type: Date, default: Date.now }
}));

// GET all jobs
app.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postedAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// POST a new job
app.post('/jobs', async (req, res) => {
  try {
    const { title, company, location } = req.body;
    const newJob = new Job({ title, company, location });
    await newJob.save();
    res.json({ message: 'Job posted and saved to DB!' });
  } catch (err) {
    console.error('Error saving job:', err);
    res.status(500).json({ error: 'Failed to post job' });
  }
});

// Handle resume upload (job applications)
app.post('/apply', upload.single('resume'), (req, res) => {
  const { name, email } = req.body;
  const resume = req.file;

  console.log("📨 Application received:");
  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Resume:", resume?.filename);

  res.json({ message: 'Application submitted successfully!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
