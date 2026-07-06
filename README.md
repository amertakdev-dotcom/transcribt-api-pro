# 🎙 Transcribe API

**ប្រព័ន្ធស្វ័យប្រវត្តិចម្លងសំឡេងទៅជាអក្សរ** (Audio to Text Transcription System)

---

## 📋 សេចក្ដីសង្ខេប (Overview)

Transcribe API ជាប្រព័ន្ធ **Microservices** ដែលមាន 2 services ដូចខាងក្រោម៖

| Service | ភាសា | តួនាទី | Port |
|---------|-------|---------|------|
| **ai-service** | Python (FastAPI) | ចម្លងសំឡេងដោយប្រើ Faster-Whisper | 8000 |
| **node-api** | Node.js (Express) | API layer, upload, queue, frontend | 3000 |

---

## 🏗️ ស្ថាបត្យកម្ម (Architecture)

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend  │────▶│  Node.js API     │────▶│  Python AI      │
│  (Browser)  │     │  (Express)       │     │  (FastAPI)      │
│             │◀────│  Port 3000       │◀────│  Port 8000      │
└─────────────┘     └────────┬─────────┘     └─────────────────┘
                             │
                     ┌───────▼────────┐
                     │   MongoDB      │
                     │  (Job Queue)   │
                     └────────────────┘
```

### លំហូរការងារ (Data Flow):

1. **Frontend** → អ្នកប្រើជ្រើសរើសឯកសារសំឡេង ហើយចុច Upload
2. **Node API** → ទទួលឯកសារ → រក្សាទុកក្នុង `uploads/` → បង្កើត Job ក្នុង MongoDB
3. **Worker** (simple.worker.js) → Poll MongoDB រៀងរាល់ 3 វិនាទី → រក Job ដែលមាន status `queued`
4. **Worker** → ផ្ញើឯកសារទៅ Python AI Service តាម HTTP POST `/transcribe`
5. **Python AI** → ប្រើ Faster-Whisper ដើម្បីចម្លងសំឡេង → ផ្ញើលទ្ធផលត្រឡប់មកវិញ
6. **Worker** → រក្សាទុកលទ្ធផលក្នុង MongoDB → ប្ដូរ status ទៅ `done`
7. **Frontend** → Poll `/api/status/:jobId` រៀងរាល់ 5 វិនាទី → បង្ហាញលទ្ធផល

---

## 🐛 កំហុសដែលបានរកឃើញ និងជួសជុល (Bugs Found & Fixed)

### 1. ❌ server.js — ខ្វះការតភ្ជាប់ MongoDB និង Worker
- **បញ្ហា**: server.js មិនបានហៅ `connectDB()` និងមិនបាន start worker
- **ជួសជុល**: បន្ថែម `connectDB()`, `startWorker()`, bind `0.0.0.0`, និង `/health` endpoint

### 2. ❌ ai-service/app.py — ខ្វះ CORS
- **បញ្ហា**: Python service គ្មាន CORS middleware → frontend មិនអាចហៅពី browser បាន
- **ជួសជុល**: បន្ថែម `CORSMiddleware` អនុញ្ញាតគ្រប់ origin

### 3. ❌ simple.worker.js — មិនបានហៅ AI Service
- **បញ្ហា**: Worker ចាស់គ្រាន់តែ simulate ការចម្លង (fake transcription)
- **ជួសជុល**: Worker ថ្មីផ្ញើឯកសារទៅ Python AI service ពិតប្រាកដតាម HTTP

### 4. ❌ .env — ខ្វះ variables សំខាន់ៗ
- **បញ្ហា**: គ្មាន `MONGO_URL`, `AI_SERVICE_URL`
- **ជួសជុល**: បង្កើត `.env.example` ជាមួយ variables ពេញលេញ

### 5. ❌ requirements.txt — គ្មាន version pins
- **បញ្ហា**: អាចបណ្ដាលឱ្យ dependency ខូចពេល deploy
- **ជួសជុល**: បន្ថែម version ជាក់លាក់

### 6. ❌ app.js — មិនបាន serve frontend
- **បញ្ហា**: គ្មាន static file serving សម្រាប់ `public/` folder
- **ជួសជុល**: បន្ថែម `express.static()` សម្រាប់ frontend UI

### 7. ❌ ai-service/app.py — មិនបានសម្អាតឯកសារក្រោយចម្លង
- **បញ្ហា**: ឯកសារសំឡេងនៅក្នុង `ai-service/uploads/` មិនត្រូវបានលុប
- **ជួសជុល**: បន្ថែម `os.remove()` ក្រោយចម្លងរួច

---

## 🚀 ការដាក់ពង្រាយលើ Render.com (Deployment Steps)

### ជំហានទី 1: Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial production setup"
git remote add origin https://github.com/your-username/transcribe-api.git
git push -u origin main
```

### ជំហានទី 2: Deploy Python AI Service

1. ចូលទៅ [Render Dashboard](https://dashboard.render.com)
2. ចុច **New +** → **Web Service**
3. ភ្ជាប់ GitHub repository
4. កំណត់ដូចខាងក្រោម៖
   - **Name**: `transcribe-ai-service`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r ai-service/requirements.txt`
   - **Start Command**: `uvicorn ai-service.app:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/health`
   - **Plan**: Free
5. ចុច **Create Web Service**

### ជំហានទី 3: Deploy Node.js API Service

1. ចុច **New +** → **Web Service** (ម្ដងទៀត)
2. ភ្ជាប់ GitHub repository ដដែល
3. កំណត់ដូចខាងក្រោម៖
   - **Name**: `transcribe-api-node`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
   - **Plan**: Free
4. បន្ថែម Environment Variables:
   - `MONGO_URL` = `mongodb+srv://...` (ពី MongoDB Atlas)
   - `AI_SERVICE_URL` = `https://transcribe-ai-service.onrender.com`
   - `NODE_ENV` = `production`
5. ចុច **Create Web Service**

### ជំហានទី 4: បង្កើត MongoDB Atlas (Free)

1. ចូលទៅ [MongoDB Atlas](https://www.mongodb.com/atlas)
2. បង្កើត Cluster Free (M0)
3. បង្កើត Database User
4. ចុច Connect → Drivers → ចម្លង Connection String
5. បន្ថែម Connection String ទៅ Render Environment Variables

---

## 🔧 Environment Variables

| Variable | ការពិពណ៌នា | តម្រូវការ |
|----------|---------------|------------|
| `PORT` | Port សម្រាប់ Node.js (default: 3000) | Optional |
| `HOST` | Host address (default: 0.0.0.0) | Optional |
| `NODE_ENV` | Environment type | Optional |
| `MONGO_URL` | MongoDB connection string | **Required** |
| `AI_SERVICE_URL` | Python AI service URL | **Required** |
| `WORKER_POLL_INTERVAL` | Worker poll interval in ms (default: 3000) | Optional |

---

## 📁 រចនាសម្ព័ន្ធគម្រោងចុងក្រោយ (Final Structure)

```
transcribe-api/
├── ai-service/
│   ├── app.py              # FastAPI AI service
│   ├── requirements.txt    # Python dependencies
│   └── uploads/            # Temp audio files (auto-cleaned)
├── public/
│   └── index.html          # Frontend UI (Khmer language)
├── scripts/
│   ├── start-node.sh       # Start Node.js service
│   └── start-ai.sh         # Start Python AI service
├── src/
│   ├── app.js              # Express app setup
│   ├── server.js           # Entry point (connectDB, worker, health)
│   ├── config/
│   │   ├── db.js           # MongoDB connection
│   │   └── redis.js        # Redis connection (optional)
│   ├── controllers/
│   │   └── upload.controller.js  # Upload handler
│   ├── middleware/
│   │   └── upload.js       # Multer file upload config
│   ├── models/
│   │   └── job.model.js    # Mongoose Job schema
│   ├── queue/
│   │   ├── queue.js        # BullMQ queue (optional)
│   │   └── memory.queue.js # In-memory queue fallback
│   ├── routes/
│   │   ├── upload.route.js # POST /api/upload
│   │   └── status.route.js # GET /api/status/:jobId
│   ├── store/
│   │   └── job.store.js    # In-memory job store
│   └── workers/
│       ├── simple.worker.js # MongoDB-based worker (active)
│       └── transcribe.worker.js # BullMQ worker (optional)
├── uploads/                # Uploaded audio files
├── outputs/                # Transcription outputs
│   ├── json/
│   ├── srt/
│   └── txt/
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── package.json            # Node.js dependencies
├── render.yaml             # Render.com deployment config
└── README.md               # This file
```

---

## 🛠️ ការប្រើប្រាស់ API (API Usage)

### Upload Audio File

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "audio=@/path/to/audio.mp3"
```

**Response:**
```json
{
  "success": true,
  "jobId": "uuid-here",
  "filename": "uuid-here.mp3",
  "originalName": "audio.mp3",
  "size": 1234567,
  "status": "queued"
}
```

### Check Job Status

```bash
curl http://localhost:3000/api/status/uuid-here
```

**Response (processing):**
```json
{
  "success": true,
  "job": {
    "jobId": "uuid-here",
    "status": "processing",
    "originalName": "audio.mp3",
    ...
  }
}
```

**Response (done):**
```json
{
  "success": true,
  "job": {
    "jobId": "uuid-here",
    "status": "done",
    "result": "Transcribed text here...",
    "language": "en",
    ...
  }
}
```

### Health Check

```bash
curl http://localhost:3000/health
curl http://localhost:8000/health
```

---

## 💻 ការដំណើរការលើម៉ាស៊ីនក្នុងស្រុក (Local Development)

### តម្រូវការ (Prerequisites)
- Node.js v18+
- Python 3.10+
- MongoDB (local or Atlas)

### ជំហាន

```bash
# 1. Clone repository
git clone https://github.com/your-username/transcribe-api.git
cd transcribe-api

# 2. Install Node.js dependencies
npm install

# 3. Install Python dependencies
pip install -r ai-service/requirements.txt

# 4. Copy .env.example to .env and edit
cp .env.example .env
# កែសម្រួល MONGO_URL និង AI_SERVICE_URL

# 5. Start Python AI service (terminal 1)
cd ai-service
uvicorn app:app --host 0.0.0.0 --port 8000 --reload

# 6. Start Node.js API (terminal 2)
npm run dev

# 7. Open browser
open http://localhost:3000
```

---

## ⚠️ កំណត់ចំណាំសំខាន់ (Important Notes)

1. **Render Free Plan**: Python service នឹង sleep ពេលគ្មានអ្នកប្រើ 15 នាទី។ ការចម្លងដំបូងអាចយឺត។
2. **Faster-Whisper**: ទាញយក model នៅពេលចាប់ផ្ដើមដំបូង (~1.5GB)។
3. **MongoDB Atlas Free**: មានកំណត់ 512MB storage។
4. **File Size**: កំណត់ត្រឹម 500MB តាម multer config។
5. **Worker**: ប្រើ MongoDB polling (មិនត្រូវការ Redis)។ BullMQ worker ក៏មានដែរ តែត្រូវការ Redis។

---

## 📄 License

MIT