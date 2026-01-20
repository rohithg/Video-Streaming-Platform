# Video Streaming Platform

Professional video streaming platform with HTTP range requests, chunked delivery, and upload capabilities.

## Features

- **HTTP Range Requests**: Efficient video seeking and buffering
- **Chunked Streaming**: Progressive video download
- **File Upload**: Drag & drop video upload with progress tracking
- **Video Library**: Organized video management
- **Responsive Player**: HTML5 video with full controls
- **Multer Integration**: Robust file handling

## Technologies

- Express.js
- Multer (file uploads)
- HTML5 Video API
- HTTP Range headers
- Stream API (Node.js)

## Installation

```bash
npm install
npm start
```

Visit http://localhost:3001

## Technical Highlights

1. **Range Request Support**: Enables video seeking
2. **Stream Processing**: Memory-efficient file delivery
3. **Upload Progress**: Real-time upload feedback
4. **Video Metadata**: File size, upload date tracking
5. **RESTful API**: Clean endpoint structure

## API Endpoints

- POST /api/upload - Upload video
- GET /api/videos - Get video library
- GET /api/stream/:id - Stream video with range support
