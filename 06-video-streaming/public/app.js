let videos = [];

async function loadVideos() {
    try {
        const response = await fetch('/api/videos');
        videos = await response.json();
        displayVideos();
    } catch (error) {
        console.error('Error loading videos:', error);
    }
}

function displayVideos() {
    const grid = document.getElementById('videoGrid');
    
    if (videos.length === 0) {
        grid.innerHTML = '<p class="empty-state">No videos yet. Upload your first video!</p>';
        return;
    }
    
    grid.innerHTML = videos.map(video => `
        <div class="video-card" onclick="playVideo('${video.id}')">
            <div class="video-thumbnail">🎬</div>
            <div class="video-card-info">
                <div class="video-card-title">${video.originalName}</div>
                <div class="video-card-meta">
                    ${formatFileSize(video.size)} • ${formatDate(video.uploadDate)}
                </div>
            </div>
        </div>
    `).join('');
}

function playVideo(videoId) {
    const video = videos.find(v => v.id === videoId);
    if (!video) return;
    
    const player = document.getElementById('videoPlayer');
    const section = document.getElementById('playerSection');
    
    player.src = `/api/stream/${videoId}`;
    document.getElementById('videoTitle').textContent = video.originalName;
    document.getElementById('videoDate').textContent = formatDate(video.uploadDate);
    document.getElementById('videoSize').textContent = formatFileSize(video.size);
    
    section.style.display = 'block';
    section.scrollIntoView({ behavior: 'smooth' });
}

function openUploadModal() {
    document.getElementById('uploadModal').classList.add('active');
}

function closeUploadModal() {
    document.getElementById('uploadModal').classList.remove('active');
    document.getElementById('uploadForm').reset();
    document.getElementById('uploadProgress').style.display = 'none';
}

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fileInput = document.getElementById('videoFile');
    if (!fileInput.files[0]) return;
    
    const formData = new FormData();
    formData.append('video', fileInput.files[0]);
    
    const progressDiv = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    progressDiv.style.display = 'block';
    
    try {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progressFill.style.width = percentComplete + '%';
                progressText.textContent = `Uploading... ${Math.round(percentComplete)}%`;
            }
        });
        
        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                progressText.textContent = 'Upload complete!';
                setTimeout(() => {
                    closeUploadModal();
                    loadVideos();
                }, 1000);
            }
        });
        
        xhr.open('POST', '/api/upload');
        xhr.send(formData);
        
    } catch (error) {
        console.error('Upload error:', error);
        alert('Upload failed');
    }
});

// Upload area drag & drop
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('videoFile');

uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--primary)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = 'var(--text-muted)';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--text-muted)';
    if (e.dataTransfer.files[0]) {
        fileInput.files = e.dataTransfer.files;
    }
});

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

window.onload = loadVideos;
