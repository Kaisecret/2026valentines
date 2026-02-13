// --- Constants & Config ---
const APP_CONFIG = {
    recipientName: "Venus",
    messageTitle: "For my Love Venus",
    messageBody: `Happy 14th monthsary to us! Every day with you feels like a love story I never want to end, and I’m so grateful that I get to live it with you. Thank you for being my safe place, my happiness, and my favorite person your presence makes everything feel lighter, warmer, and more meaningful.

I just want you to know that even on days when we don’t agree, even when we’re fighting or our moods get heavy, my love for you doesn’t change. We may get upset, we may say things we don’t mean, and we may need time to cool down but I will always choose you. I’ll always choose us. Because what we have is worth protecting, worth fixing, and worth growing through. I don’t want a “perfect” love; I want a real one one that learns, heals, and becomes stronger after every storm.

You mean so much to me. I love the little things about you your smile, the way you talk, the way you make me feel understood, the way you try even when you’re tired. I love how you’ve become part of my everyday life, and how even the simplest moments feel special when it’s you. You inspire me to be better, to be softer, and to love more patiently.

So today, I just want to remind you: I’m here. I’m not going anywhere. I’m proud of us, proud of how far we’ve come, and excited for everything ahead. Let’s keep choosing each other, communicating, forgiving, and holding on especially when it’s hard. Because at the end of the day, it’s still you. It will always be you.

I love you more than words can say—today and always. 💞`,
    puzzleImage: "picimage.png", 
};

// Supabase Configuration
// NOTE: Ensure your Supabase project has a public bucket named 'imagestips' (or change below).
const SUPABASE_URL = 'https://frndrcpinhenquqfhpzg.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZybmRyY3BpbmhlbnF1cWZocHpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5ODMyNzIsImV4cCI6MjA4NjU1OTI3Mn0.NeRRDVZolft32t8eV0MSsuU5EY1aS-X8WbQ4Vz3biic';
const BUCKET_NAME = 'imagestips';
const TABLE_NAME = 'imagestips';

const LOCAL_STORAGE_KEY = 'snapbooth_gallery_local';

// --- Shared Logic: Floating Hearts ---
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('hearts-container');
    if (container) {
        for (let i = 0; i < 15; i++) {
            const heart = document.createElement('div');
            heart.innerText = '❤';
            heart.className = 'absolute text-rose-300 pointer-events-none z-0 floating-heart';
            heart.style.left = `${Math.random() * 100}%`;
            heart.style.fontSize = `${Math.random() * 20 + 10}px`;
            heart.style.animationDelay = `${Math.random() * 5}s`;
            heart.style.animationDuration = `${Math.random() * 10 + 10}s`;
            container.appendChild(heart);
        }
    }
});

// --- Puzzle Game Logic (playgames.html) ---
function initGame() {
    const SIZE = 3;
    const maxWidth = 300;
    const padding = 40; 
    const availableWidth = window.innerWidth - padding;
    const BOARD_WIDTH = Math.min(maxWidth, availableWidth);
    const BOARD_HEIGHT = (BOARD_WIDTH / 2) * 3;
    const TILE_WIDTH = BOARD_WIDTH / SIZE;
    const TILE_HEIGHT = BOARD_HEIGHT / SIZE;
    
    const puzzleGrid = document.getElementById('puzzle-grid');
    if (puzzleGrid) {
        puzzleGrid.style.width = `${BOARD_WIDTH}px`;
        puzzleGrid.style.height = `${BOARD_HEIGHT}px`;
    }

    let tiles = [];
    let isWon = false;
    let moves = 0;
    
    const gridEl = document.getElementById('puzzle-grid');
    const moveCountEl = document.getElementById('move-count');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const winOverlay = document.getElementById('win-overlay');
    const playAgainBtn = document.getElementById('play-again-btn');
    const winImage = document.getElementById('win-image');
    
    if(winImage) winImage.src = APP_CONFIG.puzzleImage;
    
    function shuffleBoard() {
        isWon = false;
        moves = 0;
        updateUI();
        winOverlay.classList.add('hidden');
        let newTiles = Array.from({ length: SIZE * SIZE }, (_, i) => i);
        let currentEmpty = newTiles.length - 1;
        for (let i = 0; i < 100; i++) {
            const neighbors = getNeighbors(currentEmpty);
            const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            [newTiles[currentEmpty], newTiles[randomNeighbor]] = [newTiles[randomNeighbor], newTiles[currentEmpty]];
            currentEmpty = randomNeighbor;
        }
        tiles = newTiles;
        renderGrid();
    }
    
    function getNeighbors(index) {
        const row = Math.floor(index / SIZE);
        const col = index % SIZE;
        const neighbors = [];
        if (row > 0) neighbors.push(index - SIZE); 
        if (row < SIZE - 1) neighbors.push(index + SIZE); 
        if (col > 0) neighbors.push(index - 1); 
        if (col < SIZE - 1) neighbors.push(index + 1); 
        return neighbors;
    }
    
    function handleTileClick(index) {
        if (isWon) return;
        const tileVal = tiles[index];
        if (tileVal === SIZE * SIZE - 1) return; 
        
        const emptyIndex = tiles.indexOf(SIZE * SIZE - 1);
        const row = Math.floor(index / SIZE);
        const col = index % SIZE;
        const emptyRow = Math.floor(emptyIndex / SIZE);
        const emptyCol = emptyIndex % SIZE;
        
        const isAdjacent = Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;
        
        if (isAdjacent) {
            [tiles[index], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[index]];
            moves++;
            renderGrid();
            checkWin();
        }
    }
    
    function checkWin() {
        const won = tiles.every((val, index) => val === index);
        if (won) {
            isWon = true;
            winOverlay.classList.remove('hidden');
        }
        updateUI();
    }
    
    function updateUI() {
        if(moveCountEl) moveCountEl.innerText = moves;
    }
    
    function renderGrid() {
        if(!gridEl) return;
        gridEl.innerHTML = '';
        tiles.forEach((tileNumber, index) => {
            const isEmpty = tileNumber === SIZE * SIZE - 1;
            const tile = document.createElement('div');
            tile.className = `absolute overflow-hidden rounded-sm cursor-pointer transition-all duration-300 ${isEmpty ? 'invisible' : ''}`;
            tile.style.width = `${TILE_WIDTH}px`;
            tile.style.height = `${TILE_HEIGHT}px`;
            
            const row = Math.floor(index / SIZE);
            const col = index % SIZE;
            tile.style.transform = `translate(${col * TILE_WIDTH}px, ${row * TILE_HEIGHT}px)`;
            
            if (!isEmpty) {
                const imgDiv = document.createElement('div');
                imgDiv.className = 'absolute inset-0';
                imgDiv.style.width = `${BOARD_WIDTH}px`;
                imgDiv.style.height = `${BOARD_HEIGHT}px`;
                imgDiv.style.backgroundImage = `url(${APP_CONFIG.puzzleImage})`;
                imgDiv.style.backgroundSize = `${BOARD_WIDTH}px ${BOARD_HEIGHT}px`;
                const origRow = Math.floor(tileNumber / SIZE);
                const origCol = tileNumber % SIZE;
                imgDiv.style.transform = `translate(-${origCol * TILE_WIDTH}px, -${origRow * TILE_HEIGHT}px)`;
                tile.appendChild(imgDiv);
                
                const num = document.createElement('div');
                num.className = 'absolute bottom-0.5 right-0.5 text-[8px] text-white/50 px-1';
                num.innerText = tileNumber + 1;
                tile.appendChild(num);
                
                tile.onclick = () => handleTileClick(index);
            }
            gridEl.appendChild(tile);
        });
    }
    
    if(shuffleBtn) shuffleBtn.onclick = shuffleBoard;
    if(playAgainBtn) playAgainBtn.onclick = shuffleBoard;
    shuffleBoard();
}

// --- Message Logic (readmessage.html) ---
function initMessage() {
    const envelope = document.getElementById('envelope-wrapper');
    const openedLetter = document.getElementById('opened-letter');
    const msgTitle = document.getElementById('msg-title');
    const msgBody = document.getElementById('msg-body');
    const closeBtns = [document.getElementById('close-letter-btn'), document.getElementById('close-letter-btn-2')];
    
    if (msgTitle) msgTitle.innerText = APP_CONFIG.messageTitle;
    if (msgBody) {
        msgBody.innerHTML = APP_CONFIG.messageBody.split('\n').map(line => 
            `<p class="mb-4 ${line.trim() === '' ? 'h-4' : ''}">${line}</p>`
        ).join('');
    }
    
    if(envelope) {
        envelope.onclick = () => {
            envelope.style.opacity = '0';
            envelope.style.transform = 'scale(1.5) translateY(100px)';
            setTimeout(() => {
                envelope.classList.add('hidden');
                openedLetter.classList.remove('hidden');
                openedLetter.style.display = 'flex'; 
            }, 500);
        };
    }
    
    closeBtns.forEach(btn => {
        if(btn) {
            btn.onclick = () => { window.location.href = 'index.html'; };
        }
    });
}

// --- Photos Logic (viewpic.html) ---
function initPhotos() {
    let supabase;
    if (window.supabase && window.supabase.createClient) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
        console.warn("Supabase client not found. Ensure script is loaded.");
    }

    const FRAMES = [
        { id: 'strip', name: 'Classic Strip', count: 3, description: 'Vertical pink strip', icon: 'I' },
        { id: 'grid', name: 'Retro Grid', count: 4, description: '2x2 Polaroid style', icon: '::' },
        { id: 'val2026', name: 'Red Love', count: 3, description: 'Red card with hearts', icon: '♥' },
        { id: 'vday2026_strip', name: 'V-Day 2026 Strip', count: 3, description: 'White confetti strip', icon: 'I' },
        { id: 'vday2026_grid', name: 'V-Day 2026 Grid', count: 3, description: 'Modern confetti grid', icon: '田' },
    ];
    
    const FILTERS = [
        { id: 'normal', name: 'Normal', css: 'none' },
        { id: 'glow', name: 'Glow', css: 'brightness(1.15) contrast(1.05) saturate(1.1)' },
        { id: 'soft', name: 'Soft', css: 'contrast(0.9) brightness(1.1) saturate(0.9)' },
        { id: 'vintage', name: 'Vintage', css: 'sepia(0.4) contrast(1.1) brightness(0.9)' },
        { id: 'bw', name: 'B&W', css: 'grayscale(1) contrast(1.1)' },
        { id: 'warm', name: 'Love', css: 'sepia(0.2) hue-rotate(-10deg) saturate(1.2)' },
        { id: 'cool', name: 'Cool', css: 'hue-rotate(10deg) saturate(0.9) brightness(1.1)' },
    ];

    let state = {
        step: 'step-start',
        frameId: 'strip',
        filterId: 'normal',
        stream: null,
        capturedImages: [],
        photos: [] 
    };
    
    const pages = document.querySelectorAll('.wizard-step');
    const startBtn = document.getElementById('btn-start');
    const galleryLink = document.getElementById('btn-gallery-link');
    const frameList = document.getElementById('frame-list');
    const filterList = document.getElementById('filter-list');
    const previewVideo = document.getElementById('preview-video');
    const captureVideo = document.getElementById('capture-video');
    const toFilterBtn = document.getElementById('btn-to-filter');
    const captureStartBtn = document.getElementById('btn-capture-start');
    const captureCountEl = document.getElementById('capture-count');
    const captureTotalEl = document.getElementById('capture-total');
    const countdownEl = document.getElementById('countdown-display');
    const flashOverlay = document.getElementById('flash-overlay');
    const finalImage = document.getElementById('final-image');
    const loader = document.getElementById('developing-loader');
    const uploadStatus = document.getElementById('upload-status');
    const retakeBtn = document.getElementById('btn-retake');
    const downloadBtn = document.getElementById('btn-download');
    const galleryGrid = document.getElementById('gallery-grid');
    const galleryLoading = document.getElementById('gallery-loading');
    
    const photoModal = document.getElementById('photo-modal');
    const modalImg = document.getElementById('modal-img');
    const modalClose = document.getElementById('modal-close');
    const modalDownload = document.getElementById('modal-download');
    const modalDelete = document.getElementById('modal-delete');
    let currentModalPhoto = null;

    function setStep(stepId) {
        pages.forEach(p => p.classList.add('hidden'));
        document.getElementById(stepId).classList.remove('hidden');
        state.step = stepId;
        
        if (stepId === 'step-filter' || stepId === 'step-capture') {
            startCamera();
        } else {
            stopCamera();
        }
        
        if (stepId === 'step-frame') renderFrames();
        if (stepId === 'step-filter') renderFilters();
        if (stepId === 'step-gallery') fetchAndRenderGallery();
    }
    
    document.querySelectorAll('.nav-back').forEach(btn => {
        btn.onclick = () => setStep(btn.dataset.target);
    });
    
    if(startBtn) startBtn.onclick = () => {
        startCamera().then(() => {
            stopCamera();
            setStep('step-frame');
        }).catch(() => {
             document.getElementById('camera-error').classList.remove('hidden');
        });
    };
    
    if(galleryLink) galleryLink.onclick = () => setStep('step-gallery');
    
    function renderFrames() {
        frameList.innerHTML = '';
        FRAMES.forEach(f => {
            const div = document.createElement('div');
            div.className = `p-4 rounded-3xl border-4 cursor-pointer flex items-center gap-4 bg-white shadow-sm transition-all ${state.frameId === f.id ? 'border-rose-400 ring-4 ring-rose-100' : 'border-transparent'}`;
            div.innerHTML = `
                <div class="w-16 h-16 bg-rose-100 rounded-xl flex items-center justify-center text-rose-400 font-bold text-xl">${f.icon}</div>
                <div><h3 class="font-bold text-gray-800">${f.name}</h3><p class="text-xs text-gray-400">${f.description}</p></div>
                ${state.frameId === f.id ? '<i data-lucide="check" class="ml-auto text-rose-500"></i>' : ''}
            `;
            div.onclick = () => { state.frameId = f.id; renderFrames(); };
            frameList.appendChild(div);
        });
        lucide.createIcons();
    }
    
    if(toFilterBtn) toFilterBtn.onclick = () => setStep('step-filter');
    
    async function startCamera() {
        if (!state.stream) {
            try {
                const isPortrait = window.innerHeight > window.innerWidth;
                const constraints = {
                    video: { facingMode: 'user', width: { ideal: isPortrait ? 1080 : 1920 }, height: { ideal: isPortrait ? 1920 : 1080 } }, 
                    audio: false
                };
                state.stream = await navigator.mediaDevices.getUserMedia(constraints);
            } catch(e) { console.error("Camera error:", e); throw e; }
        }
        const videoEl = state.step === 'step-filter' ? previewVideo : captureVideo;
        if(videoEl && state.stream && videoEl.srcObject !== state.stream) {
            videoEl.srcObject = state.stream;
            try { await videoEl.play(); } catch (e) {}
        }
    }
    
    function stopCamera() {
        if(state.stream) {
            state.stream.getTracks().forEach(t => t.stop());
            state.stream = null;
        }
    }
    
    function renderFilters() {
        filterList.innerHTML = '';
        FILTERS.forEach(f => {
            const btn = document.createElement('button');
            btn.className = `flex flex-col items-center gap-2 min-w-[80px] transition-opacity ${state.filterId === f.id ? 'opacity-100' : 'opacity-60'}`;
            btn.innerHTML = `
                <div class="w-16 h-16 rounded-2xl bg-gray-800 border-2 overflow-hidden ${state.filterId === f.id ? 'border-teal-400' : 'border-transparent'}">
                    <div class="w-full h-full bg-gray-700 flex items-center justify-center" style="filter: ${f.css}">
                        <div class="w-8 h-8 rounded-full bg-white/20"></div>
                    </div>
                </div>
                <span class="text-xs font-medium">${f.name}</span>
            `;
            btn.onclick = () => {
                state.filterId = f.id;
                if(previewVideo) previewVideo.style.filter = f.css;
                renderFilters();
            };
            filterList.appendChild(btn);
        });
    }
    
    if(captureStartBtn) captureStartBtn.onclick = async () => {
        setStep('step-capture');
        state.capturedImages = [];
        const frame = FRAMES.find(f => f.id === state.frameId);
        if(captureVideo) captureVideo.style.filter = FILTERS.find(f => f.id === state.filterId).css;
        captureTotalEl.innerText = frame.count;
        await new Promise(r => setTimeout(r, 1000));
        
        for (let i = 0; i < frame.count; i++) {
            captureCountEl.innerText = i;
            for (let c = 3; c > 0; c--) {
                countdownEl.innerText = c;
                countdownEl.classList.remove('hidden');
                await new Promise(r => setTimeout(r, 1000));
            }
            countdownEl.classList.add('hidden');
            
            const canvas = document.createElement('canvas');
            canvas.width = captureVideo.videoWidth || 1920;
            canvas.height = captureVideo.videoHeight || 1080;
            const ctx = canvas.getContext('2d');
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            if(state.filterId !== 'normal') ctx.filter = FILTERS.find(f => f.id === state.filterId).css;
            ctx.drawImage(captureVideo, 0, 0, canvas.width, canvas.height);
            state.capturedImages.push(canvas.toDataURL('image/jpeg', 0.95));
            captureCountEl.innerText = i + 1;
            
            flashOverlay.classList.remove('hidden');
            await new Promise(r => setTimeout(r, 100));
            flashOverlay.classList.add('hidden');
            await new Promise(r => setTimeout(r, 800));
        }
        
        stopCamera();
        setStep('step-result');
        processResult();
    };
    
    function processResult() {
        finalImage.classList.add('hidden');
        loader.classList.remove('hidden');
        if(uploadStatus) uploadStatus.innerText = "Developing photo...";
        
        setTimeout(async () => {
            const resultDataUrl = await createFinalImage(state.capturedImages, state.frameId, state.filterId);
            finalImage.src = resultDataUrl;
            finalImage.classList.remove('hidden');
            fireScreenConfetti();

            let cloudSuccess = false;

            // 1. TRY CLOUD UPLOAD (If configured)
            if (supabase) {
                if(uploadStatus) uploadStatus.innerText = "Syncing to cloud...";
                try {
                    const blob = await (await fetch(resultDataUrl)).blob();
                    // Using a timestamp + random string for uniqueness
                    const fileName = `snapbooth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
                    
                    // Upload to Bucket
                    const { error: uploadError } = await supabase.storage
                        .from(BUCKET_NAME)
                        .upload(fileName, blob, { 
                            cacheControl: '3600', 
                            upsert: true,
                            contentType: 'image/jpeg' 
                        });

                    if (uploadError) {
                        // Check for common error: Bucket not found
                        if (uploadError.message.includes('bucket') || uploadError.message.includes('not found')) {
                            throw new Error(`Bucket '${BUCKET_NAME}' not found.`);
                        }
                        throw uploadError;
                    }

                    // Get URL
                    const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
                    
                    // Insert Metadata to Table (Optional but good for gallery)
                    const { error: dbError } = await supabase
                        .from(TABLE_NAME)
                        .insert([{ file_path: fileName, public_url: publicUrl }]);

                    if (dbError) {
                         // We don't throw here to avoid failing the whole process if just the DB insert fails but storage worked
                         console.warn("DB Insert failed:", dbError.message);
                         // But we treat it as partial success for user
                    }

                    if(uploadStatus) uploadStatus.innerText = "Synced to cloud!";
                    cloudSuccess = true;

                } catch (err) {
                    console.error("Upload failed:", err);
                    // Display meaningful error to user (shortened)
                    let msg = err.message || "Unknown error";
                    if (msg.length > 30) msg = msg.substring(0, 30) + "...";
                    if(uploadStatus) {
                        uploadStatus.innerText = "Cloud Error: " + msg;
                        uploadStatus.style.color = "#f87171"; // Red text
                    }
                }
            } else {
                 if(uploadStatus) uploadStatus.innerText = "Saved locally.";
            }

            // 2. SAVE TO LOCAL STORAGE (Always as fallback/cache)
            try {
                saveToLocalGallery(resultDataUrl);
                if (!cloudSuccess && uploadStatus && !uploadStatus.innerText.includes("Error")) {
                    uploadStatus.innerText = "Saved to local gallery";
                }
            } catch(e) { console.warn("Local save error:", e); }

            // Hide loader after a delay
            setTimeout(() => {
                loader.classList.add('hidden');
                if(uploadStatus) {
                    uploadStatus.innerText = "";
                    uploadStatus.style.color = ""; // Reset color
                }
            }, 3000); // Give user time to read error if any
        }, 1500);
    }
    
    function saveToLocalGallery(dataUrl) {
        let photos = [];
        try { photos = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]'); } catch(e) {}
        photos.unshift({ id: Date.now(), public_url: dataUrl, created_at: new Date().toISOString(), local: true });
        if (photos.length > 20) photos = photos.slice(0, 20); // increased limit
        try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(photos)); } catch(e) {}
    }

    if(retakeBtn) retakeBtn.onclick = () => setStep('step-start');
    
    if(downloadBtn) downloadBtn.onclick = () => {
        const link = document.createElement('a');
        link.download = `snapbooth-${Date.now()}.jpg`;
        link.href = finalImage.src;
        link.click();
    };
    
    async function fetchAndRenderGallery() {
        galleryGrid.innerHTML = '';
        galleryLoading.classList.remove('hidden');

        let allPhotos = [];

        // 1. Local Photos
        try {
            const localPhotos = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
            allPhotos = [...localPhotos];
        } catch(e) {}

        // 2. Cloud Photos
        if (supabase) {
            try {
                const { data, error } = await supabase
                    .from(TABLE_NAME)
                    .select('*')
                    .order('created_at', { ascending: false });
                    
                if (!error && data) {
                    allPhotos = [...allPhotos, ...data]; 
                } else if (error) {
                    console.warn("Gallery fetch error:", error.message);
                }
            } catch (err) { console.warn("Cloud fetch failed", err); }
        }

        // Sort by date desc
        allPhotos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        // Remove duplicate URLs
        const unique = [];
        const urls = new Set();
        for(const p of allPhotos) {
            if(!urls.has(p.public_url)) {
                urls.add(p.public_url);
                unique.push(p);
            }
        }
        
        galleryLoading.classList.add('hidden');
        if (unique.length === 0) {
            galleryGrid.innerHTML = '<div class="col-span-2 text-center text-gray-400 mt-20">No photos yet!</div>';
            return;
        }

        unique.forEach(p => {
            const div = document.createElement('div');
            div.className = 'bg-white p-2 rounded-lg shadow-sm cursor-pointer transform transition-transform hover:scale-[1.02] active:scale-95';
            div.innerHTML = `
                <div class="relative w-full aspect-[2/3] bg-gray-100 rounded-sm overflow-hidden">
                    <img src="${p.public_url}" class="w-full h-full object-cover pointer-events-none" loading="lazy">
                    ${p.local ? '<div class="absolute bottom-1 right-1 w-2 h-2 bg-rose-300 rounded-full" title="Local"></div>' : '<div class="absolute bottom-1 right-1 w-2 h-2 bg-teal-400 rounded-full" title="Cloud"></div>'}
                </div>
                <div class="text-[10px] text-gray-400 mt-2 text-center">${new Date(p.created_at).toLocaleDateString()}</div>
            `;
            div.onclick = () => openModal(p);
            galleryGrid.appendChild(div);
        });
    }

    function openModal(photo) {
        if(!photoModal) return;
        currentModalPhoto = photo;
        modalImg.src = photo.public_url;
        modalDownload.href = photo.public_url;
        modalDownload.download = `snapbooth-${new Date(photo.created_at).getTime()}.jpg`;
        photoModal.classList.remove('hidden');
        requestAnimationFrame(() => {
            photoModal.classList.remove('opacity-0');
            modalImg.classList.remove('scale-95');
            modalImg.classList.add('scale-100');
        });
    }

    function closeModal() {
        if(!photoModal) return;
        photoModal.classList.add('opacity-0');
        modalImg.classList.remove('scale-100');
        modalImg.classList.add('scale-95');
        setTimeout(() => { photoModal.classList.add('hidden'); currentModalPhoto = null; }, 300);
    }
    
    if(modalClose) modalClose.onclick = closeModal;
    if(modalDelete) modalDelete.onclick = async () => {
        if(!currentModalPhoto) return;
        if(confirm('Delete this photo?')) {
            // If local
            if (currentModalPhoto.local) {
                let photos = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
                photos = photos.filter(p => p.id !== currentModalPhoto.id);
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(photos));
                closeModal();
                fetchAndRenderGallery();
                return;
            }

            // If Cloud
            if(supabase) {
                try {
                    await supabase.storage.from(BUCKET_NAME).remove([currentModalPhoto.file_path]);
                    await supabase.from(TABLE_NAME).delete().eq('id', currentModalPhoto.id);
                    closeModal();
                    fetchAndRenderGallery();
                } catch (err) { alert("Delete failed: " + err.message); }
            }
        }
    };

    function createFinalImage(images, frameId, filterId) {
        return new Promise((resolve) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const filter = FILTERS.find(f => f.id === filterId);
          const imgElements = images.map(src => { const img = new Image(); img.src = src; return img; });
    
          Promise.all(imgElements.map(img => new Promise(r => img.onload = r))).then(() => {
            if (frameId === 'val2026') {
                 canvas.width = 1536; canvas.height = 1024;
                 const grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                 grd.addColorStop(0, '#ef4444'); grd.addColorStop(1, '#991b1b'); 
                 ctx.fillStyle = grd; ctx.fillRect(0, 0, canvas.width, canvas.height);
                 ctx.globalAlpha = 0.2; ctx.fillStyle = '#fff';
                 drawHeart(ctx, 150, 150, 80); drawHeart(ctx, 600, 80, 50); drawHeart(ctx, 250, 900, 100); drawHeart(ctx, 700, 500, 120);
                 ctx.globalAlpha = 1.0;
                 const margin = 60; const slotW = (canvas.width / 2) - (margin * 1.5); const slotH = (canvas.height / 2) - (margin * 1.5);
                 const positions = [{ x: canvas.width/2 + margin/2, y: margin }, { x: canvas.width/2 + margin/2, y: canvas.height/2 + margin/2 }, { x: margin, y: canvas.height/2 + margin/2 }];
                 if(filter) ctx.filter = filter.css;
                 images.forEach((_, i) => { if (i >= 3) return; const pos = positions[i]; ctx.fillStyle = '#fff'; ctx.fillRect(pos.x, pos.y, slotW, slotH); drawImageProp(ctx, imgElements[i], pos.x + 15, pos.y + 15, slotW - 30, slotH - 30); });
                 ctx.filter = 'none';
                 const textCenterX = canvas.width / 4; const textCenterY = canvas.height / 4; ctx.translate(textCenterX, textCenterY); ctx.rotate(-0.1); 
                 ctx.font = 'bold 110px Pacifico'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText("Happy", 0, -60);
                 ctx.font = 'bold 120px Pacifico'; ctx.fillText("Valentine's", 0, 50); ctx.font = 'bold 80px Pacifico'; ctx.fillText("Day", 0, 140);
                 ctx.rotate(0.1); ctx.font = 'bold 40px Poppins'; ctx.fillStyle = '#fecdd3'; ctx.fillText("February 14, 2026", 0, 220);
                 ctx.setTransform(1, 0, 0, 1, 0, 0); draw3DHeart(ctx, 80, 80, 60); draw3DHeart(ctx, canvas.width - 80, canvas.height - 80, 70); draw3DHeart(ctx, canvas.width/2, canvas.height/2, 50); 
            } else if (frameId === 'vday2026_strip') {
                const stripW = 1024; const stripH = 3072; const footerH = 750; canvas.width = stripW; canvas.height = stripH; ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); drawConfetti(ctx, canvas.width, canvas.height);
                const photoMargin = 60; const availH = stripH - footerH - photoMargin; const pHeight = (availH / 3) - photoMargin;
                if(filter) ctx.filter = filter.css; images.forEach((_, i) => { const y = photoMargin + i * (pHeight + photoMargin); ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(photoMargin + 15, y + 15, stripW - photoMargin*2, pHeight); drawImageProp(ctx, imgElements[i], photoMargin, y, stripW - photoMargin*2, pHeight); });
                ctx.filter = 'none'; drawILoveU(ctx, 0, stripH - footerH, stripW, footerH, 2.5);
            } else if (frameId === 'vday2026_grid') {
                canvas.width = 1536; canvas.height = 1024; ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); drawConfetti(ctx, canvas.width, canvas.height);
                const cellW = canvas.width / 2; const cellH = canvas.height / 2; const m = 40; const positions = [{x: 0, y: 0}, {x: cellW, y: 0}, {x: 0, y: cellH}];
                if(filter) ctx.filter = filter.css; images.forEach((_, i) => { if(i >= 3) return; const pos = positions[i]; const x = pos.x + m; const y = pos.y + m; const w = cellW - m*2; const h = cellH - m*2; ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(x + 10, y + 10, w, h); drawImageProp(ctx, imgElements[i], x, y, w, h); });
                ctx.filter = 'none'; drawILoveU(ctx, cellW, cellH, cellW, cellH, 1.2);
            } else if (frameId === 'strip') {
                const photoW = 1024; const photoH = 1365; const gap = 60; const padding = 80; const totalH = padding * 2 + (photoH * images.length) + (gap * (images.length - 1)) + 400; canvas.width = photoW + padding * 2; canvas.height = totalH; ctx.fillStyle = '#fff1f2'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#fecdd3'; drawHeart(ctx, 100, 100, 70); drawHeart(ctx, canvas.width - 100, canvas.height - 100, 80);
                if(filter) ctx.filter = filter.css; images.forEach((_, i) => { const y = padding + i * (photoH + gap); ctx.fillStyle = '#ffffff'; ctx.fillRect(padding - 20, y - 20, photoW + 40, photoH + 40); drawImageProp(ctx, imgElements[i], padding, y, photoW, photoH); });
                ctx.filter = 'none'; ctx.fillStyle = '#e11d48'; ctx.font = 'bold 100px Pacifico'; ctx.textAlign = 'center'; ctx.fillText("Love You", canvas.width / 2, canvas.height - 220); ctx.font = '40px Poppins'; ctx.fillStyle = '#9f1239'; ctx.fillText(new Date().toLocaleDateString(), canvas.width / 2, canvas.height - 130);
            } else { 
                const cols = 2; const rows = 2; const sqSize = 800; const gap = 60; const padding = 80; canvas.width = padding * 2 + (sqSize * cols) + gap; canvas.height = padding * 2 + (sqSize * rows) + gap + 400; ctx.fillStyle = '#fdfbf7'; ctx.fillRect(0, 0, canvas.width, canvas.height);
                if(filter) ctx.filter = filter.css; images.forEach((_, i) => { const col = i % cols; const row = Math.floor(i / cols); const x = padding + col * (sqSize + gap); const y = padding + row * (sqSize + gap); ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(x + 20, y + 20, sqSize, sqSize); drawImageProp(ctx, imgElements[i], x, y, sqSize, sqSize); });
                ctx.filter = 'none'; ctx.fillStyle = '#1f2937'; ctx.font = 'bold 120px Pacifico'; ctx.textAlign = 'center'; ctx.fillText("SnapBooth", canvas.width / 2, canvas.height - 220); ctx.font = '50px monospace'; ctx.fillStyle = '#6b7280'; ctx.letterSpacing = '8px'; ctx.fillText("MEMORIES", canvas.width / 2, canvas.height - 120);
            }
            resolve(canvas.toDataURL('image/jpeg', 0.92));
          });
        });
    }

    function drawConfetti(ctx, width, height) {
        const count = Math.floor((width * height) / 3000); 
        for(let i=0; i<count; i++) {
            const colors = ['#f43f5e', '#fb7185', '#fda4af', '#e11d48', '#FFD700', '#00fffa'];
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            const x = Math.random() * width; const y = Math.random() * height; const baseSize = width / 100; const size = Math.random() * baseSize + (baseSize/2);
            ctx.beginPath();
            if (Math.random() > 0.5) { ctx.arc(x, y, size/2, 0, Math.PI*2); } else { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.random() * Math.PI); ctx.fillRect(-size/2, -size/4, size, size/2); ctx.restore(); } ctx.fill();
        }
    }
    function drawILoveU(ctx, x, y, w, h, scale = 1) {
        const cx = x + w/2; const cy = y + h/2; const fontSize = 120 * scale; const heartSize = 80 * scale; const offset = 140 * scale;
        ctx.font = `bold ${fontSize}px serif`; ctx.fillStyle = '#e11d48'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText("I", cx - offset, cy - (20 * scale)); ctx.fillText("U", cx + offset, cy - (20 * scale));
        draw3DHeart(ctx, cx, cy - (20 * scale), heartSize); ctx.font = `bold ${28 * scale}px sans-serif`; ctx.fillStyle = '#f43f5e'; ctx.letterSpacing = `${2 * scale}px`; ctx.fillText("VALENTINE'S DAY 2026", cx, cy + (80 * scale)); ctx.font = `${16 * scale}px sans-serif`; ctx.fillStyle = '#fda4af'; ctx.letterSpacing = `${1 * scale}px`; ctx.fillText("FROM GABY", cx, cy + (110 * scale));
    }
    function draw3DHeart(ctx, hx, hy, hsize) {
        const hgrad = ctx.createRadialGradient(hx - hsize/4, hy - hsize/4, hsize/10, hx, hy, hsize); hgrad.addColorStop(0, '#ff748d'); hgrad.addColorStop(1, '#be123c');
        ctx.fillStyle = hgrad; ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = hsize/4; ctx.shadowOffsetY = hsize/8; drawHeart(ctx, hx, hy, hsize);
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.arc(hx - hsize/3, hy - hsize/3, hsize/4, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    }
    function drawHeart(ctx, x, y, size) {
        ctx.save(); ctx.beginPath(); const topCurveHeight = size * 0.3;
        ctx.moveTo(x, y + topCurveHeight); ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight); ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 2, x, y + size); ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 2, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight); ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    function drawImageProp(ctx, img, x, y, w, h) {
        const r = Math.min(w / img.width, h / img.height); let nw = img.width * r; let nh = img.height * r; let cx = 1; let cy = 1; let cw = img.width; let ch = img.height; let ar = 1;
        if (nw < w) ar = w / nw; if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh; nw *= ar; nh *= ar; cw = img.width / (nw / w); ch = img.height / (nh / h); cx = (img.width - cw) * 0.5; cy = (img.height - ch) * 0.5; ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h);
    }
}

// --- On-Screen Confetti Effect ---
function fireScreenConfetti() {
    const container = document.getElementById('screen-confetti');
    if(!container) return;
    container.innerHTML = '';
    for(let i=0; i<100; i++) {
        const c = document.createElement('div'); c.className = 'absolute top-[-20px] w-3 h-3 rounded-full z-50'; c.style.backgroundColor = ['#f43f5e', '#ec4899', '#a855f7', '#3b82f6', '#14b8a6', '#f59e0b'][Math.floor(Math.random()*6)];
        c.style.left = Math.random() * 100 + '%'; c.style.opacity = Math.random() + 0.5;
        const duration = 2 + Math.random() * 3; const delay = Math.random() * 0.5;
        c.style.transition = `top ${duration}s ease-in, transform ${duration}s linear, opacity ${duration}s ease-out`; c.style.transform = `rotate(${Math.random() * 360}deg)`;
        container.appendChild(c);
        requestAnimationFrame(() => { setTimeout(() => { c.style.top = '110%'; c.style.transform = `rotate(${Math.random() * 360 + 360}deg) translateX(${Math.random()*100 - 50}px)`; c.style.opacity = '0'; }, delay * 1000); });
    }
    setTimeout(() => { container.innerHTML = ''; }, 6000);
}