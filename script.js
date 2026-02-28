// === STATE ===
let journey = {
    playful: { enabled: true, q: '', yes: '', no: '' },
    hunt: [],
    photos: [],
    letter: { content: '', font: '', bg: '', color: '#2D3436', size: '1rem' }
};

// === TEMPLATES DATA ===
const templates = {
    birthday: "My Dearest [Name],\n\nHappy Birthday! Today, the world celebrates the day you were born, and I celebrate having you in my life.\n\nYou bring so much joy, laughter, and light to everyone around you. I hope this next year brings you everything you're hoping for and more.\n\nWith all my love,\n[Your Name]",
    milestone: "Happy Milestone Birthday!\n\nWow, look at how far you've come! Today isn't just about a number; it's about the incredible journey you've been on and the amazing adventures that are still to come.\n\nCheers to you!\n[Your Name]",
    anniversary: "My Love,\n\nAnother year together, and my heart still skips when I think of you. Through every season, every challenge, every joy - you've been my constant.\n\nHere's to us and all the tomorrows we'll share.\n\nForever yours,\n[Your Name]",
    love: "To my [Name],\n\nRemember when we first met? Look at us now. So many memories, so many laughs, so much love.\n\nI just wanted to remind you that you are my favorite person.\n\nYours always,\n[Your Name]",
    graduation: "Dear [Name],\n\nYOU DID IT! All those late nights, all that hard work - it paid off. I am so incredibly proud of you.\n\nThis graduation isn't just an ending. It's the beginning of everything you've been working toward.\n\nCongratulations!\n[Your Name]",
    friendship: "Hey [Name]!\n\nJust wanted you to know - you crossed my mind today and made me smile. No special occasion, no reason except that you're special to me.\n\nHope this little surprise brightens your day.\n\nThinking of you,\n[Your Name]"
};

// === ROUTER ===
window.onload = () => {
    const hash = window.location.hash;
    if (hash && hash.length > 10) {
        try {
            let encoded = hash.substring(1);
            encoded = encoded.replace(/-/g, '+').replace(/_/g, '/');
            const jsonStr = decodeURIComponent(escape(atob(encoded)));
            const data = JSON.parse(jsonStr);
            
            if (!data.hunt || data.hunt.length < 2) throw new Error("Need questions");
            if (!data.photos || data.photos.length < 1) throw new Error("Need photos");
            if (!data.letter || !data.letter.content) throw new Error("Need letter");
            
            journey = data;
            startRecipientMode();
        } catch (e) {
            console.error(e);
            document.getElementById('error-view').classList.remove('hidden');
        }
    } else {
        document.getElementById('landing-view').classList.remove('hidden');
    }
};

// === CREATOR LOGIC ===
let currentStep = 1;

function startBuilding() {
    document.getElementById('landing-view').classList.add('hidden');
    document.getElementById('creator-view').classList.remove('hidden');
    updateProgress();
}

function goHome() { 
    window.location.href = window.location.pathname; 
}

function togglePlayful() {
    const en = document.getElementById('toggle-playful').checked;
    journey.playful.enabled = en;
    document.getElementById('playful-fields').style.display = en ? 'block' : 'none';
}

function nextStep(step) {
    if(currentStep === 1) {
        if(journey.playful.enabled) {
            journey.playful.q = document.getElementById('p-question').value;
            journey.playful.yes = document.getElementById('p-yes').value;
            journey.playful.no = document.getElementById('p-no').value;
        }
    }
    if (step === 3 && journey.hunt.length < 2) { 
        alert("Add at least 2 questions."); 
        return; 
    }
    if (step === 4 && journey.photos.length < 1) { 
        alert("Upload at least 1 photo."); 
        return; 
    }
    if (step === 5 && !document.getElementById('l-content').value.trim()) { 
        alert("Write a letter."); 
        return; 
    }

    document.getElementById(`step-${currentStep}`).classList.add('hidden');
    document.getElementById(`step-${step}`).classList.remove('hidden');
    currentStep = step;
    updateProgress();
    if(step === 5) updateSummary();
}

function prevStep(step) {
    document.getElementById(`step-${currentStep}`).classList.add('hidden');
    document.getElementById(`step-${step}`).classList.remove('hidden');
    currentStep = step;
    updateProgress();
}

function updateProgress() {
    for(let i=1; i<=5; i++) {
        const el = document.getElementById(`prog-${i}`);
        el.classList.remove('active', 'completed');
        if(i < currentStep) el.classList.add('completed');
        if(i === currentStep) el.classList.add('active');
    }
}

// --- Hunt ---
function addQuestion() {
    const q = document.getElementById('q-text').value.trim();
    const a = document.getElementById('q-ans').value.trim();
    if(!q || !a) return alert("Fill both.");
    journey.hunt.push({ q, a });
    renderQuestions();
    document.getElementById('q-text').value = '';
    document.getElementById('q-ans').value = '';
}

function renderQuestions() {
    const list = document.getElementById('questions-list');
    list.innerHTML = '';
    journey.hunt.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `<span><b>Q:</b> ${item.q}</span> <button class="btn btn-outline" style="padding:5px 10px;" onclick="removeQ(${i})">✕</button>`;
        list.appendChild(div);
    });
    document.getElementById('q-status').innerText = `${journey.hunt.length} questions added (Min 2 required)`;
    document.getElementById('btn-next-2').disabled = journey.hunt.length < 2;
}

window.removeQ = (i) => { 
    journey.hunt.splice(i, 1); 
    renderQuestions(); 
};

// --- Photos ---
document.getElementById('file-input').addEventListener('change', function(e) {
    if(journey.photos.length >= 10) return alert("Max 10 photos.");
    Array.from(e.target.files).slice(0, 10 - journey.photos.length).forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxW = 600;
                const scale = maxW / img.width;
                canvas.width = maxW;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const data = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
                journey.photos.push(data);
                renderPhotos();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    });
});

function renderPhotos() {
    const grid = document.getElementById('photo-grid');
    grid.innerHTML = '';
    journey.photos.forEach((src, i) => {
        const div = document.createElement('div');
        div.className = 'photo-thumb';
        div.innerHTML = `<img src="data:image/jpeg;base64,${src}"><button onclick="removeP(${i})">✕</button>`;
        grid.appendChild(div);
    });
    document.getElementById('btn-next-3').disabled = journey.photos.length < 1;
}

window.removeP = (i) => { 
    journey.photos.splice(i, 1); 
    renderPhotos(); 
};

// --- Letter ---
function setTemplate(type) {
    document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('selected'));
    event.target.classList.add('selected');
    document.getElementById('l-content').value = templates[type];
    updatePreview();
}

function updatePreview() {
    const content = document.getElementById('l-content').value;
    const font = document.getElementById('l-font').value;
    const bg = document.getElementById('l-bg').value;
    
    journey.letter = { content, font, bg, color: '#2D3436', size: '1rem' };

    const frame = document.getElementById('preview-frame');
    frame.className = `preview-frame ${bg}`;
    frame.style.fontFamily = font;
    frame.innerText = content;

    document.getElementById('btn-next-4').disabled = !content.trim();
}

// --- Generate ---
function updateSummary() {
    document.getElementById('summary').innerHTML = `
        <p>🎭 Playful: ${journey.playful.enabled ? 'Yes' : 'No'}</p>
        <p>🔍 Questions: ${journey.hunt.length}</p>
        <p>📸 Photos: ${journey.photos.length}</p>
    `;
}

function generateLink() {
    try {
        const json = JSON.stringify(journey);
        const b64 = btoa(unescape(encodeURIComponent(json)));
        const safeB64 = b64.replace(/\+/g, '-').replace(/\//g, '_');
        const url = window.location.href.split('#')[0] + '#' + safeB64;
        
        document.getElementById('final-link').value = url;
        document.getElementById('preview-link').href = url;
        document.getElementById('link-output').classList.remove('hidden');
    } catch(e) {
        alert("Error: Too much data. Remove some photos.");
    }
}

function copyLink() {
    document.getElementById('final-link').select();
    document.execCommand('copy');
    alert("Link Copied!");
}

// === RECIPIENT LOGIC ===
let currentQ = 0;

function startRecipientMode() {
    document.getElementById('landing-view').classList.add('hidden');
    document.getElementById('recipient-view').classList.remove('hidden');
    
    if(journey.playful.enabled) {
        showStage(1);
        initParticles();
    } else {
        showStage(2);
    }
}

function initParticles() {
    const container = document.getElementById('particles');
    container.innerHTML = '';
    for(let i=0; i<20; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 20 + 10;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = (Math.random() * 10 + 10) + 's';
        p.style.animationDelay = (Math.random() * 5) + 's';
        container.appendChild(p);
    }
}

function showStage(num) {
    document.querySelectorAll('#recipient-view > div:not(.lightbox)').forEach(el => el.classList.add('hidden'));
    document.getElementById(`r-stage-${num}`).classList.remove('hidden');
    
    if(num === 2) initHunt();
    if(num === 4) renderLetter();
}

// Stage 1
function playfulAnswer(ans) {
    document.getElementById('rp-btns').classList.add('hidden');
    const res = document.getElementById('rp-response');
    res.classList.remove('hidden');
    
    if(ans === 'yes') {
        res.innerText = journey.playful.yes || "Great!";
        setTimeout(() => showStage(2), 2000);
    } else {
        res.innerText = journey.playful.no || "Too bad!";
        setTimeout(() => { 
            res.innerText = "The adventure waits for no one! Starting now...";
            setTimeout(() => showStage(2), 1500); 
        }, 1500);
    }
}

// Stage 2
function initHunt() {
    document.getElementById('r-q-total').innerText = journey.hunt.length;
    showQuestion(0);
}

function showQuestion(i) {
    currentQ = i;
    document.getElementById('r-q-num').innerText = i+1;
    document.getElementById('r-q-text').innerText = journey.hunt[i].q;
    document.getElementById('r-answer').value = '';
    document.getElementById('r-hunt-progress').style.width = ((i / journey.hunt.length) * 100) + '%';
    document.getElementById('r-error').innerText = '';
}

function checkAnswer() {
    const input = document.getElementById('r-answer').value.trim().toLowerCase();
    const correct = journey.hunt[currentQ].a.trim().toLowerCase();
    
    if(input === correct) {
        currentQ++;
        if(currentQ >= journey.hunt.length) {
            document.getElementById('r-hunt-progress').style.width = '100%';
            document.getElementById('r-stage-2').innerHTML = `
                <div class="hunt-card" style="text-align:center;">
                    <h1 style="font-size:4rem;">🎉</h1>
                    <h2 style="margin-bottom:2rem;">You solved it!</h2>
                    <button class="btn btn-gold" onclick="showStage(3)">Open Box →</button>
                </div>
            `;
        } else {
            showQuestion(currentQ);
        }
    } else {
        document.getElementById('r-answer').classList.add('shake');
        document.getElementById('r-error').innerText = "Nope, try again!";
        setTimeout(() => document.getElementById('r-answer').classList.remove('shake'), 500);
    }
}

// Stage 3
function openBox() {
    document.querySelector('.gift-box').classList.add('opened');
    setTimeout(() => {
        document.getElementById('r-box').style.display = 'none';
        scatterPhotos();
        document.getElementById('r-to-letter').classList.remove('hidden');
    }, 800);
}

function scatterPhotos() {
    const cont = document.getElementById('r-photos');
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    journey.photos.forEach((src, i) => {
        const div = document.createElement('div');
        div.className = 'photo-particle';
        const w = 100 + Math.random() * 100;
        const x = Math.random() * (vw - w);
        const y = Math.random() * (vh - w);
        const rot = -20 + Math.random() * 40;
        
        div.style.cssText = `width:${w}px; left:${x}px; top:${y}px; --rot:${rot}deg; animation: popInPhoto 0.5s ${i*0.05}s forwards;`;
        div.innerHTML = `<img src="data:image/jpeg;base64,${src}" style="height:${w}px;">`;
        div.onclick = () => {
            document.getElementById('lightbox-img').src = 'data:image/jpeg;base64,'+src;
            document.getElementById('lightbox').classList.add('active');
        };
        cont.appendChild(div);
    });
}

// Stage 4
function renderLetter() {
    const l = journey.letter;
    const el = document.getElementById('r-letter');
    el.className = `letter-container ${l.bg}`;
    el.style.fontFamily = l.font;
    document.getElementById('r-letter-body').innerText = l.content;
    setTimeout(() => el.classList.add('visible'), 100);
}

// Add missing CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes popInPhoto { 
        0% { opacity: 0; transform: scale(0) rotate(0deg); } 
        100% { opacity: 1; transform: scale(1) rotate(var(--rot)); } 
    }
    .shake { 
        animation: shake 0.5s linear; 
    }
    @keyframes shake { 
        0%, 100% { transform: translateX(0); } 
        25% { transform: translateX(-10px); } 
        75% { transform: translateX(10px); } 
    }
    .progress-hunt {
        width: 100%;
        height: 4px;
        background: rgba(255,255,255,0.2);
        border-radius: 2px;
        margin-bottom: 1rem;
    }
    .progress-hunt-fill {
        height: 100%;
        background: var(--primary-gold);
        border-radius: 2px;
        transition: width 0.3s;
    }
`;
document.head.appendChild(style);