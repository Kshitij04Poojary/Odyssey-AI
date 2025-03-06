const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
require('dotenv').config();

const authRoutes = require('./routes/authRouter');
const courseRoutes = require('./routes/courseRouter');
const assessmentRoutes = require('./routes/assessmentRouter');
const generateCourseRoutes = require('./routes/generateCourseRouter')
const generateChapterContentRoutes = require('./routes/generateChapterContentRouter');
const interviewRoutes=require('./routes/interviewRouter')
//const fileRoutes = require('./routes/fileRouter');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use('/api', generateCourseRoutes);
app.use('/api', generateChapterContentRoutes);
//app.use('/api/files', fileRoutes);

app.use('/api/interview',interviewRoutes)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
