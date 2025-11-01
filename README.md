# Campus Lost & Found App

A fully functional, responsive, and feature-rich Lost-and-Found web application for college campuses. Built with React + TypeScript frontend and Python Flask backend, featuring advanced search, image matching, QR codes, gamification, and comprehensive analytics.

## 🎯 Features

### Frontend Features
- **Modern Responsive UI**: Built with React, TypeScript, Tailwind CSS, and Radix UI components
- **Dynamic Search & Filters**: Advanced search with auto-suggestions as you type
- **Item Reporting**: Form with image upload and live preview
- **Interactive Dashboard**: Charts and statistics using Chart.js and Recharts
- **QR Code Generation**: Each item automatically generates a QR code for easy sharing
- **Image Similarity Matching**: Automatic detection of similar items using image hashing
- **Gamification System**: Badges and achievements for user engagement
- **Dark/Light Mode**: Smooth theme toggle with persistent preferences
- **Real-time Updates**: Dynamic status changes and notifications


### Backend Features
- **RESTful API**: Python Flask backend with structured routes
- **Data Validation**: Secure input validation and error handling
- **Image Processing**: Image hash calculation for similarity detection
- **JSON-based Storage**: Lightweight file-based data persistence
- **Badge System**: Automatic badge awards based on user activity
- **Search Endpoints**: Advanced search with multiple filter options
- **Dashboard Analytics**: Comprehensive statistics and trending data

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- pip (Python package manager)

### Installation

#### 1. Install Frontend Dependencies
```bash
npm install
```

#### 2. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### 3. Run the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
python app.py
```
The backend will run on `http://localhost:5000`

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```
The frontend will run on `http://localhost:3000` (or the port shown in terminal)

### Environment Variables

Create a `.env` file in the root directory (optional, defaults are used):
```env
VITE_API_URL=http://localhost:5000/api
```

## 📁 Project Structure

```
Lost and Found App/
├── backend/
│   ├── app.py              # Flask backend application
│   ├── requirements.txt    # Python dependencies
│   ├── data/               # JSON data storage (auto-created)
│   └── utils/              # Backend utilities
├── src/
│   ├── components/         # React components
│   │   ├── Dashboard.tsx  # Analytics dashboard with charts
│   │   ├── ReportItemForm.tsx
│   │   ├── ItemList.tsx
│   │   ├── SearchWithSuggestions.tsx  # Auto-suggest search
│   │   ├── BadgesPanel.tsx           # Gamification panel
│   │   └── ...
│   ├── services/
│   │   └── api.ts          # API service layer
│   ├── types/
│   │   └── index.ts        # TypeScript types
│   └── App.tsx             # Main app component
├── package.json
└── README.md
```

## 🎨 Key Features Explained

### 1. Auto-Suggestions Search
- Real-time search suggestions as you type
- Debounced API calls for performance
- Suggestions include titles, categories, and locations

### 2. Image Similarity Matching
- Automatic image hash calculation on upload
- Compares hashes to find similar items
- Displays potential matches in item details

### 3. QR Code Generation
- Each item automatically generates a QR code
- QR codes link directly to item details page
- Easy sharing and scanning for mobile users

### 4. Gamification & Badges
- **First Reporter**: Report your first item
- **Active Reporter**: Report 10 items
- **Super Reporter**: Report 50 items
- **First Claim**: Successfully claim an item
- **Claim Master**: Claim 5 items
- **Matchmaker**: Find matches using image similarity

### 5. Dashboard Analytics
- **Bar Charts**: Top categories and locations
- **Doughnut Chart**: Items by status distribution
- **Line Chart**: Items reported over time
- **Statistics Cards**: Key metrics at a glance

## 🔧 API Endpoints

### Items
- `GET /api/items` - Get all items (with optional filters)
- `POST /api/items` - Add new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Search
- `GET /api/search` - Search items with query parameters
- `GET /api/search/suggestions?q=query` - Get search suggestions

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics and trends

### Additional
- `GET /api/items/:id/similar` - Get similar items
- `GET /api/items/:id/qr` - Get QR code data
- `GET /api/badges/:email` - Get user badges

## 🛠️ Development

### Building for Production
```bash
npm run build
```

The production build will be in the `build/` directory.

### Backend Development
The Flask backend runs in debug mode by default. Data is stored in `backend/data/items.json` and `backend/data/badges.json`.

### Frontend Development
The frontend uses Vite for fast development. Hot module replacement is enabled for instant updates.

## 🎯 Hackathon Highlights

This application demonstrates:

1. **Full-Stack Development**: Complete frontend and backend implementation
2. **Modern Tech Stack**: React, TypeScript, Flask, Chart.js
3. **Advanced Features**: Image matching, QR codes, gamification
4. **Production-Ready**: Error handling, validation, responsive design
5. **User Experience**: Smooth animations, auto-suggestions, notifications
6. **Data Visualization**: Comprehensive charts and analytics
7. **Mobile-First**: Fully responsive design

## 📝 Notes

- The backend uses JSON file storage for simplicity. For production, consider using a database (PostgreSQL, MongoDB, etc.)
- Image similarity uses MD5 hashing. For better results, consider perceptual hashing algorithms (pHash, dHash)
- Badges are stored per email address. Consider implementing proper user authentication
- The app includes CORS enabled for local development

## 🐛 Troubleshooting

**Backend won't start:**
- Ensure Python 3.8+ is installed
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Verify port 5000 is available

**Frontend won't connect to backend:**
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in `.env` file
- Check browser console for CORS errors

**Images not uploading:**
- Check file size (max 5MB)
- Ensure image format is supported (PNG, JPG, JPEG, GIF, WEBP)

## 📄 License

This project is open source and available for hackathon use.

## 🙏 Credits

Built with:
- React 18
- TypeScript
- Vite
- Flask
- Chart.js
- Tailwind CSS
- Radix UI
- Lucide Icons
