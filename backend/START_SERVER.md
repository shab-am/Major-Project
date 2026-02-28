# Starting the Backend Server

## Quick Start

### 1. Activate Virtual Environment (if using one)

**Windows:**
```bash
cd backend
venv\Scripts\activate
```

### 2. Install Dependencies (if not already installed)

```bash
pip install -r requirements.txt
```

### 3. Start the Server

```bash
python app.py
```

You should see:
```
Starting Flask server...
Data directory: C:\Users\...\backend\data
Scripts directory: C:\Users\...\backend\scripts
Models directory: C:\Users\...\backend\models
Server will run on http://localhost:5000
 * Running on http://0.0.0.0:5000
 * Debug mode: on
```

## Testing the Server

### Option 1: Browser Test
Open your browser and go to:
- `http://localhost:5000/` - Should show API information
- `http://localhost:5000/api/health` - Should show health status

### Option 2: Command Line Test
```bash
# Test root endpoint
curl http://localhost:5000/

# Test health endpoint
curl http://localhost:5000/api/health

# Test datasets endpoint
curl http://localhost:5000/api/python/datasets

# Test scripts endpoint
curl http://localhost:5000/api/python/scripts
```

### Option 3: Python Test Script
```bash
# In a separate terminal (while server is running)
cd backend
python test_server.py
```

## Common Issues

### "Address already in use"
- Another process is using port 5000
- Solution: Change port in `app.py`:
  ```python
  app.run(debug=True, host='0.0.0.0', port=5001)  # Use port 5001 instead
  ```

### "Module not found"
- Dependencies not installed
- Solution: `pip install -r requirements.txt`

### "Connection refused"
- Server is not running
- Solution: Start the server with `python app.py`

### "Not Found" Error
- You're accessing a route that doesn't exist
- Available routes:
  - `GET /` - Root endpoint (API info)
  - `GET /api/health` - Health check
  - `GET /api/python/datasets` - List datasets
  - `GET /api/python/scripts` - List scripts
  - `POST /api/python/run` - Run a script
  - `POST /api/python/process` - Process data

## Verifying Server is Running

1. Check terminal output - should show "Running on http://0.0.0.0:5000"
2. Open browser to `http://localhost:5000/` - should see JSON response
3. Check frontend - "Python Integration" page should show "Connected" status

## Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

