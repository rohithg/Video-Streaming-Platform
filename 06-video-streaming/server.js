const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

const app = express();
const PORT = 3001;

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use('/videos', express.static('videos'));

// Video library
let videoLibrary = [];

// Upload endpoint
app.post('/api/upload', upload.single('video'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const videoInfo = {
        id: Date.now().toString(),
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        uploadDate: new Date().toISOString()
    };

    videoLibrary.push(videoInfo);
    
    // Process video for streaming (optional - requires FFmpeg)
    processVideo(videoInfo);
    
    res.json({ success: true, video: videoInfo });
});

// Get video library
app.get('/api/videos', (req, res) => {
    res.json(videoLibrary);
});

// Stream video with range support
app.get('/api/stream/:id', (req, res) => {
    const video = videoLibrary.find(v => v.id === req.params.id);
    
    if (!video) {
        return res.status(404).json({ error: 'Video not found' });
    }

    const videoPath = video.path;
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };

        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
    }
});

function processVideo(videoInfo) {
    // This would convert video to HLS format for adaptive streaming
    // Requires FFmpeg installation
    console.log('Video processing would happen here:', videoInfo.filename);
}

app.listen(PORT, () => {
    console.log(`Video streaming server running on http://localhost:${PORT}`);
});
