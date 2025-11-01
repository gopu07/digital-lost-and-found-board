# How to Run the Lost and Found App

## Quick Start Guide

Follow these steps to get the application running on your machine.

## Prerequisites

Before you begin, make sure you have:
- **Node.js 18+** installed ([Download here](https://nodejs.org/))
- **Python 3.8+** installed ([Download here](https://www.python.org/downloads/))
- **npm** (comes with Node.js)
- **pip** (comes with Python)

## Step-by-Step Instructions

### 1. Install Frontend Dependencies

Open a terminal/command prompt in the project root directory and run:

```bash
npm install
```

This will install all the React, TypeScript, and UI dependencies. It may take a few minutes.

### 2. Install Backend Dependencies

Open a new terminal/command prompt and navigate to the backend folder:

```bash
cd backend
pip install -r requirements.txt
```

This will install Flask and other Python dependencies.

### 3. Start the Backend Server

In the backend terminal (still in the `backend` folder), run:

```bash
python app.py
```

You should see output like:
```
 * Running on http://0.0.0.0:5000
 * Debug mode: on
```

**Keep this terminal open** - the backend must be running for the app to work.

### 4. Start the Frontend Development Server

Open a **new terminal/command prompt** in the project root directory (not in the backend folder) and run:

```bash
npm run dev
```

You should see output like:
```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 5. Open the Application

Open your web browser and navigate to:
```
http://localhost:3000
```

The application should now be running! 🎉

## Troubleshooting

### Backend Issues

**Problem:** `python app.py` gives an error
- **Solution:** Make sure you're using Python 3.8+ and all dependencies are installed
- Try: `python3 app.py` or `py app.py` (depending on your OS)

**Problem:** Port 5000 is already in use
- **Solution:** The backend uses port 5000. Close any other applications using that port, or modify `backend/app.py` to use a different port

**Problem:** Flask not found
- **Solution:** Run `pip install -r requirements.txt` again in the backend folder

### Frontend Issues

**Problem:** `npm install` fails
- **Solution:** 
  - Make sure Node.js 18+ is installed
  - Try deleting `node_modules` folder (if it exists) and `package-lock.json`, then run `npm install` again
  - On Windows, you might need to run terminal as Administrator

**Problem:** `npm run dev` doesn't start
- **Solution:** 
  - Make sure you ran `npm install` first
  - Check that you're in the project root directory (not in `backend` or `src` folders)
  - Try `npx vite` directly

**Problem:** Can't connect to backend
- **Solution:** 
  - Make sure the backend is running (check Terminal 1)
  - Check that backend is on `http://localhost:5000`
  - Open browser console (F12) to see any error messages

## Running in Production

To build the frontend for production:

```bash
npm run build
```

This creates an optimized build in the `build/` folder.

## Project Structure

```
Lost and Found App/
├── backend/          # Python Flask backend
│   ├── app.py       # Main backend server
│   └── data/        # JSON data storage (auto-created)
├── src/              # React frontend source code
├── package.json      # Frontend dependencies
└── README.md         # Full documentation
```

## Need Help?

- Check the main `README.md` for detailed documentation
- Check `backend/README.md` for API documentation
- Check browser console (F12) for frontend errors
- Check backend terminal for server errors

