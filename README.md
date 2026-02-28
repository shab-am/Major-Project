# HydroMonitor - Plant Monitoring System

A modern React-based web application for monitoring plant health through real-time sensor data, bioelectrical signals, and AI-powered analytics.

## 🌱 Features

- **Real-time Plant Monitoring** - Track temperature, pH, TDS, humidity, and dissolved oxygen
- **Bioelectrical Signal Analysis** - Monitor plant electrical signals for stress detection
- **AI-Powered Analytics** - Machine learning predictions and recommendations
- **Interactive Dashboard** - Beautiful charts and data visualization
- **Hardware Integration** - Support for Arduino/ESP32 sensor devices
- **Python Integration** - Run Python scripts and process datasets from Colab notebooks
- **Dark/Light Theme** - Modern UI with theme switching
- **Data Export/Import** - CSV data management

## 📋 Prerequisites

Before running this project, make sure you have the following installed on your computer:

### Required Software:
1. **Node.js** (version 14.0 or higher)
   - Download from: [https://nodejs.org/](https://nodejs.org/)
   - This includes npm (Node Package Manager)

2. **Python** (version 3.8 or higher) - For Python integration feature
   - Download from: [https://www.python.org/](https://www.python.org/)
   - Make sure to check "Add Python to PATH" during installation

3. **Git** (optional, for version control)
   - Download from: [https://git-scm.com/](https://git-scm.com/)

4. **Code Editor** (recommended)
   - Visual Studio Code: [https://code.visualstudio.com/](https://code.visualstudio.com/)
   - Or any other IDE you prefer

### System Requirements:
- **Operating System**: Windows 10/11, macOS, or Linux
- **RAM**: At least 4GB (8GB recommended)
- **Storage**: 500MB free space
- **Internet Connection**: Required for downloading dependencies

## 🚀 How to Run the Application

### Step 1: Download the Project
1. Download the project folder to your computer
2. Extract it if it's in a zip file
3. Note the folder location (e.g., `C:\Users\YourName\Desktop\Major-Project`)

### Step 2: Open in Code Editor
1. Open your code editor (Visual Studio Code recommended)
2. Click "File" → "Open Folder"
3. Navigate to and select the project folder
4. The project files should now be visible in your editor

### Step 3: Install Dependencies
1. Open the terminal in your code editor:
   - **In Visual Studio Code**: Press `Ctrl + `` (backtick) or go to "Terminal" → "New Terminal"
   - **In other editors**: Use the built-in terminal or open a separate terminal window

2. Run this command in the terminal:
```bash
npm install
```
This will download all required packages (may take 2-5 minutes)

### Step 4: Start the Application
Run this command:
```bash
npm start
```

### Step 5: (Optional) Set Up Python Backend
If you want to use the Python integration feature:

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the Python backend server (in a separate terminal):
```bash
python app.py
```

4. The Python backend will run on `http://localhost:5000`

For detailed Python integration instructions, see [PYTHON_INTEGRATION.md](PYTHON_INTEGRATION.md)

### Step 6: View the Application
1. Your browser should automatically open to `http://localhost:3000`
2. If it doesn't open automatically, manually go to: `http://localhost:3000`
3. You should see the HydroMonitor dashboard
4. Click on "Python Integration" in the sidebar to use Python scripts

## 🔧 Troubleshooting

### Common Issues:

**1. "npm: command not found"**
- Solution: Install Node.js from [nodejs.org](https://nodejs.org/)

**2. "Port 3000 is already in use"**
- Solution: Close other applications using port 3000, or run:
  ```bash
  npm start -- --port 3001
  ```

**3. "Module not found" errors**
- Solution: Delete `node_modules` folder and `package-lock.json`, then run:
  ```bash
  npm install
  ```

**4. App doesn't load in browser**
- Check if terminal shows "Compiled successfully!"
- Try refreshing the browser page
- Check if you're using the correct URL: `http://localhost:3000`

### Getting Help:
- Check the terminal for error messages
- Make sure all prerequisites are installed
- Ensure you're in the correct project directory

## 📁 Project Structure

```
Major-Project/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Main application pages
│   ├── services/      # API and hardware communication
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   └── types/         # Type definitions
├── public/            # Static assets
├── package.json       # Project dependencies
└── README.md          # This file
```

## 🌐 Hardware Integration

For real-time hardware connectivity, see the [HARDWARE_SETUP.md](HARDWARE_SETUP.md) file for detailed instructions on connecting Arduino/ESP32 devices.

## 🐍 Python Integration

To integrate your Colab notebook Python code and datasets:

1. Place your dataset in `backend/data/` directory
2. Convert your Colab notebook code to `backend/scripts/main.py`
3. Start the Python backend: `cd backend && python app.py`
4. Access the Python Integration page from the sidebar

For detailed instructions, see [PYTHON_INTEGRATION.md](PYTHON_INTEGRATION.md)

## 📞 Support

If you encounter any issues:
1. Check this README for common solutions
2. Verify all prerequisites are installed
3. Check the terminal for error messages
4. Ensure you're following the steps correctly

---

**Happy Plant Monitoring! 🌱📊**
