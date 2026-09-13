# Architecture & Technical Design

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE (NEXT.JS)                 │
│  Upload → Preview → Editor → Timeline → Export              │
└──────────────────────┬──────────────────────────────────────┘
                       │
       ┌───────────────┴───────────────┐
       ↓                               ↓
┌────────────────────────┐    ┌──────────────────────┐
│   BACKEND API          │    │   PYTHON ML SERVICES │
│  (Node.js + Express)   │    │  (AI Models)         │
│                        │    │                      │
│ • Upload Handler       │    │ • Product Vision     │
│ • Video Generation     │    │ • Script Generator   │
│ • Scene Management     │    │ • Scene Composer     │
│ • Export/Render        │    │ • Video Processing   │
└────────────────────────┘    └──────────────────────┘
       ↓
       └──────────────────────────────────┐
                                          ↓
                    ┌─────────────────────────────────┐
                    │  EXTERNAL AI/ML SERVICES        │
                    │                                 │
                    │ • OpenAI (Script/Analysis)      │
                    │ • Runway/Pika (Video Gen)       │
                    │ • ElevenLabs (Voice Over)       │
                    │ • AWS S3 (Storage)              │
                    └─────────────────────────────────┘
```

## Detailed Flow

### 1. UPLOAD & ANALYSIS PHASE

```
User uploads image
       ↓
Validate image (size, format)
       ↓
Store in temporary storage
       ↓
Analyze with Claude Vision API
  ├─ Product Type: Cosmetics, Food, Fashion, etc.
  ├─ Color Palette: RGB values
  ├─ Key Features: Text, Logo, Shape
  ├─ Material: Plastic, Glass, Metal, Paper
  └─ Brand Elements: Logo position, text content
       ↓
Return analysis JSON
```

### 2. SCRIPT GENERATION PHASE

```
Product analysis data
       ↓
Generate context prompt
       ↓
Call OpenAI API with custom system prompt
       ↓
LLM generates 5-8 scene descriptions
  ├─ Scene 1: Intro (Logo close-up, 3-4s)
  ├─ Scene 2: Hero Shot (Product shine/rotate, 4-5s)
  ├─ Scene 3: Detail Shot (Features, 4s)
  ├─ Scene 4: Lifestyle (Product in use, 5-6s)
  ├─ Scene 5: Benefit (Color/design focus, 4s)
  ├─ Scene 6: CTA (Product + text, 4-5s)
  └─ Voice-over script
       ↓
Store scenes in database
```

### 3. SCENE COMPOSITION PHASE

```
For each scene:
  ├─ Choose background (AI selected based on product type)
  ├─ Choose lighting setup (Studio, Natural, Dramatic, etc.)
  ├─ Set camera angle (Front, 45°, Macro, etc.)
  ├─ Define motion (Rotate, Pan, Zoom, Static)
  ├─ Set duration (calculated from script)
  └─ Create composition JSON
       ↓
Pass all scenes to video generation API
```

### 4. VIDEO GENERATION PHASE

```
For each scene composition:
  ├─ If static: Generate image with background
  ├─ If motion: Use Runway/Pika with motion prompt
  ├─ Extract product from original image
  ├─ Composite product onto generated background
  └─ Apply effects (Glow, Rotation, etc.)
       ↓
Collect all scene videos
```

### 5. VOICE & MUSIC PHASE

```
Script from Phase 2
       ↓
Generate voice-over using ElevenLabs
  ├─ Apply voice style (Enthusiastic, Professional, Casual)
  ├─ Adjust pacing to scene timing
  └─ Generate MP3
       ↓
Select background music from library
  ├─ Based on product type & style
  ├─ Adjust volume levels
  └─ Normalize audio
       ↓
Mix audio: Voice + Music
```

### 6. VIDEO RENDERING PHASE

```
Collect all components:
  ├─ Scene videos (MP4)
  ├─ Audio track (MP3)
  ├─ Text overlays (Title, CTA, etc.)
  ├─ Logo/Brand elements
  └─ Transition effects
       ↓
Use FFmpeg to:
  ├─ Concatenate videos
  ├─ Add audio sync
  ├─ Overlay text with animation
  ├─ Add transitions
  └─ Export to target format (9:16, 16:9, 1:1)
       ↓
Final MP4 video ready for export
```

## Data Models

### Product Analysis
```typescript
interface ProductAnalysis {
  id: string;
  imageUrl: string;
  productType: string; // 'cosmetics' | 'food' | 'fashion' | 'gadget' | 'home'
  brandName: string;
  colors: Color[];
  features: string[];
  material: string;
  logoUrl?: string;
  keyText: string[];
  dimensions: {
    width: number;
    height: number;
  };
  createdAt: Date;
}
```

### Scene
```typescript
interface Scene {
  id: string;
  projectId: string;
  sequenceNumber: number;
  type: 'intro' | 'hero' | 'detail' | 'lifestyle' | 'benefit' | 'cta';
  description: string;
  voiceScript: string;
  duration: number; // seconds
  composition: {
    background: string;
    lighting: 'studio' | 'natural' | 'dramatic' | 'minimal';
    camera: {
      angle: number; // 0-360
      distance: 'macro' | 'close' | 'medium' | 'wide';
      position: 'front' | 'side' | 'top';
    };
    motion: {
      type: 'static' | 'rotate' | 'pan' | 'zoom';
      speed: number;
      direction: string;
    };
  };
  videoUrl?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
}
```

### Project
```typescript
interface VideoProject {
  id: string;
  userId: string;
  productImageUrl: string;
  productAnalysis: ProductAnalysis;
  scenes: Scene[];
  settings: {
    duration: 15 | 30 | 60; // seconds
    aspectRatio: '9:16' | '16:9' | '1:1';
    style: 'luxury' | 'cinematic' | 'minimal' | 'viral' | 'studio' | 'nature' | 'technology';
    voiceStyle: 'professional' | 'casual' | 'enthusiastic';
    includeMusic: boolean;
  };
  audioUrl?: string;
  videoUrl?: string;
  status: 'analyzing' | 'scripting' | 'generating' | 'rendering' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints

### Upload & Analysis
```
POST /api/upload
  Body: FormData { image: File }
  Response: { projectId, analysisId, productAnalysis }

POST /api/projects/:projectId/analyze
  Response: { productAnalysis }
```

### Scene Generation
```
POST /api/projects/:projectId/generate-scenes
  Response: { scenes: Scene[] }

PUT /api/projects/:projectId/scenes/:sceneId
  Body: { composition, description, ... }
  Response: { updatedScene }

POST /api/projects/:projectId/scenes/:sceneId/regenerate
  Response: { scene }
```

### Video Generation
```
POST /api/projects/:projectId/generate-videos
  Response: { jobId, status }

GET /api/jobs/:jobId/status
  Response: { status, progress, scenes[] }

POST /api/projects/:projectId/add-audio
  Body: { voiceStyle, musicStyle }
  Response: { audioUrl }
```

### Export
```
POST /api/projects/:projectId/render
  Body: { format: '9:16' | '16:9' | '1:1', quality: 'low' | 'medium' | 'high' }
  Response: { jobId, estimatedTime }

GET /api/projects/:projectId/download
  Response: { videoUrl, expiresIn }

POST /api/projects/:projectId/variations
  Body: { count: 5 | 10 }
  Response: { jobs: Job[] }
```

## Tech Stack Deep Dive

### Frontend (Next.js)
- **State Management**: Zustand for global state (projects, UI state)
- **UI Components**: Custom components with Tailwind CSS
- **File Upload**: react-dropzone
- **Animations**: Framer Motion for smooth transitions
- **HTTP Client**: Axios with interceptors

### Backend (Node.js)
- **Framework**: Express.js
- **Authentication**: JWT tokens
- **File Handling**: Multer + AWS S3
- **Job Queue**: Bull (Redis) for async tasks
- **API Clients**: openai, axios for external services

### AI Services (Python)
- **Vision**: Claude Vision API or YOLOv8
- **Script Generation**: OpenAI API
- **Video Generation**: Runway API or Pika API
- **Processing**: FFmpeg via fluent-ffmpeg

## Deployment Strategy

### Development
```
Local: Frontend (localhost:3000) + Backend (localhost:5000)
```

### Production
```
Frontend: Vercel (Next.js)
Backend: Railway/Heroku (Node.js)
Python Services: AWS Lambda or separate container
Database: Supabase (PostgreSQL)
Storage: AWS S3
```

## Performance Considerations

1. **Image Optimization**: Compress uploads, lazy load previews
2. **Video Caching**: Store generated videos, reuse similar compositions
3. **Parallel Processing**: Generate multiple scenes simultaneously
4. **Progressive Rendering**: Show video preview as scenes complete
5. **Queue Management**: Prioritize user's current project

## Security

1. **API Authentication**: JWT for all protected routes
2. **File Validation**: Check file types, sizes, and scan for malware
3. **Rate Limiting**: Prevent abuse of AI API calls
4. **Data Privacy**: Store user data encrypted, auto-delete after 30 days
5. **API Keys**: Use environment variables, rotate periodically

## Monitoring & Logging

- **Error Tracking**: Sentry for production errors
- **Performance Monitoring**: DataDog for API latency
- **Logs**: Structured logging with Winston
- **Metrics**: Track API usage, success rates, processing times
