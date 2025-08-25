# 🌌 QMemory - Quantum Memory Reconstruction

> 記憶の断片から、心に刻まれた場所を量子的に観測するアプリケーション

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.1-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue?logo=typescript)](https://typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green?logo=fastapi)](https://fastapi.tiangolo.com/)

## 📸 Screenshots

<p align="center">
  <img src="./docs/main.png" width="100%" alt="Main Interface">
</p>

<p align="center">
  <img src="./docs/goal.png" width="100%" alt="Quantum Results View">
</p>

## 🎯 Overview

**QMemory** は、曖昧な記憶の断片（テキスト・感情など）をもとに、AI と量子コンピューティングの概念を活用して、ユーザーの心に残っていた可能性のある「場所」を提示するWebアプリケーションです。

### Key Features

- 🧠 **Memory Fragment Input** - テキストベースの記憶断片入力
- 🎭 **Emotion Selection** - 6種類の感情コンテキスト選択
- ⚛️ **Quantum Processing Visualization** - 量子重ね合わせ状態の視覚化
- 🌍 **Location Discovery** - 実在する場所の特定とマッピング
- 📸 **Memory Screenshots** - 完全な記憶体験のキャプチャ機能
- 🗺️ **Interactive Maps** - リアルタイム地図統合

## 🔬 Quantum Computing Concepts

| Quantum Concept | Application in QMemory |
| --------------- | ---------------------- |
| **Superposition** | 複数の場所候補を同時に保持 |
| **Entanglement** | 記憶-感情間の量子もつれ相関 |
| **Interference** | キーワード・感情による確率振幅の干渉 |
| **Observation** | 波動関数の収束による最終的な場所決定 |
| **Decoherence** | 量子状態から古典的結果への変換 |

## 🚀 Technology Stack

### Frontend
- **Next.js 15.4.6** with App Router
- **React 19.1.1** - Modern React with concurrent features
- **TypeScript 5.9.2** - Type safety and developer experience
- **Tailwind CSS** - Utility-first styling
- **Framer Motion 10.16.16** - Advanced animations
- **Lucide React** - Modern icon system
- **React Leaflet** - Interactive maps
- **html2canvas** - Screenshot functionality

### Backend
- **FastAPI** - High-performance Python API
- **Python Quantum Libraries** - Qiskit, Cirq for quantum simulation
- **NumPy/SciPy** - Scientific computing

### AI & APIs
- **Google Gemini API** - Primary AI language model
- **OpenStreetMap** - Geographic data and mapping
- **Geocoding Services** - Location coordinate resolution

## 📁 Project Structure

```
qmemory/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── gemini/        # Gemini AI endpoints
│   │   │   └── quantum/       # Quantum processing endpoints
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx          # Main application page
│   │   └── settings/         # Settings page
│   ├── components/           # React components
│   │   ├── MemorySupersitionView.tsx    # Quantum visualization
│   │   ├── QuantumProcessingVisualizer.tsx  # Processing animation
│   │   ├── MapComponent.tsx              # Interactive maps
│   │   └── ParticleBackground.tsx        # Quantum particle effects
│   ├── lib/                  # Utility libraries
│   │   ├── gemini.ts         # Gemini API integration
│   │   ├── geocoding.ts      # Location services
│   │   ├── imageService.ts   # Image handling
│   │   └── crypto.ts         # API key encryption
│   └── types/                # TypeScript definitions
├── backend/                  # Python quantum backend
│   ├── main.py              # FastAPI application
│   ├── quantum_engine.py    # Quantum processing engine
│   ├── models.py           # Data models
│   └── requirements.txt    # Python dependencies
├── static/                 # Static assets
└── docs/                  # Documentation and images
```

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/wg-quantum/qmemory.git
cd qmemory
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### 3. Environment Configuration

Create `.env.local`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### 4. Backend Setup (Optional)

```bash
cd backend
pip install -r requirements.txt

# Start the quantum backend
python main.py
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📱 Usage

### Basic Workflow

1. **Input Memory Fragment** - Enter descriptive text about a vague memory
2. **Select Emotion** - Choose the emotional context (nostalgic, melancholic, etc.)
3. **Quantum Processing** - Watch the quantum superposition visualization
4. **Observe Results** - See the most probable location with supporting evidence
5. **Explore Alternatives** - View other possible locations in superposition
6. **Save & Share** - Capture and share your quantum memory reconstruction

### Memory Input Examples

**Domestic (Japan)**:
```
桜の花びら、静かな石段、古いお寺の鐘の音、お香の香り
```

**International**:
```
石畳の道、教会の鐘、パン屋の香り、古い建物、ヨーロッパ
```

## 🎨 Features Deep Dive

### Quantum Visualization System

- **Real-time Processing Animation** - 6-stage quantum processing pipeline
- **Superposition States** - Multiple location probabilities displayed simultaneously
- **Wave Function Collapse** - Animated transition to final observation
- **Quantum Metrics** - Coherence, entanglement, and superposition measurements

### Interactive Components

- **Memory Fragment Grid** - Visual representation of quantum bits
- **Probability Clouds** - Dynamic probability distribution visualization
- **Location Cards** - Rich media cards with images and descriptions
- **Interactive Maps** - Embedded OpenStreetMap integration

### Screenshot & Sharing

- **Full-Screen Capture** - Advanced html2canvas implementation
- **Native Share API** - Cross-platform sharing with fallbacks
- **Clipboard Integration** - Direct image copying functionality
- **Download Options** - High-quality PNG export

## 🔧 API Endpoints

### Quantum Processing
```
POST /api/quantum/memory-analysis
```

### Gemini Integration
```
POST /api/gemini/analyze-memory
GET  /api/gemini/test
```

### Configuration
```
GET  /api/config
```

## 🧪 Development

### Available Scripts

```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Production build
npm run build

# Production server
npm run start
```

### Code Quality

The project uses:
- **TypeScript** for type safety
- **ESLint** for code linting
- **Next.js built-in optimizations**
- **Tailwind CSS** for consistent styling

## 📊 Performance Features

- **Next.js App Router** - Optimized routing and rendering
- **React 19 Concurrent Features** - Improved user experience
- **Image Optimization** - Automatic image optimization and lazy loading
- **Dynamic Imports** - Code splitting for better performance
- **Caching Strategies** - Optimized API response caching

## 🚀 Deployment

### Frontend (Vercel - Recommended)

```bash
# Build and deploy
npm run build
```

Deploy to Vercel with environment variables:
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_BACKEND_URL`

### Backend (Docker)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🌟 Future Roadmap

### Phase 1 - Enhanced AI Integration
- Multi-model AI ensemble (GPT-4, Claude, Gemini)
- Advanced image generation with DALL-E 3
- Voice input for memory fragments

### Phase 2 - True Quantum Computing
- IBM Quantum Network integration
- Real quantum hardware utilization
- Quantum machine learning algorithms

### Phase 3 - Extended Reality
- VR/AR memory exploration
- 3D location reconstruction
- Immersive quantum visualization

### Phase 4 - Social & Personal
- Memory sharing and collaboration
- Personal memory databases
- AI-powered memory assistance

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use semantic commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **IBM Quantum Network** - Quantum computing inspiration
- **Google AI** - Gemini API integration
- **OpenStreetMap** - Geographic data
- **Next.js Team** - Amazing React framework
- **Vercel** - Deployment platform

## 📞 Support

- **GitHub Issues** - Bug reports and feature requests
- **Discussions** - General questions and community chat
- **Wiki** - Detailed documentation and tutorials

---

<p align="center">
  <strong>Exploring the quantum nature of human memory through technology</strong>
</p>

<p align="center">
  Made with ⚛️ and 🧠 by the QMemory Team
</p>