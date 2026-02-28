# Python Backend Integration

This directory contains the Python backend server that integrates your Colab notebook code with the React frontend.

## 📁 Directory Structure

```
backend/
├── app.py              # Flask server with API endpoints
├── requirements.txt    # Python dependencies
├── scripts/            # Your Python scripts (from Colab notebook)
│   └── main.py        # Template/main script
├── data/              # Dataset files (CSV, JSON, Excel, etc.)
└── README.md          # This file
```

## 🚀 Setup Instructions

### 1. Install Python Dependencies

Make sure you have Python 3.8+ installed, then run:

```bash
cd backend
pip install -r requirements.txt
```

### 2. Add Your Dataset

1. Place your dataset file in the `backend/data/` directory
2. Supported formats: CSV, Excel (.xlsx, .xls), JSON

### 3. Convert Your Colab Notebook

1. Open your Colab notebook
2. Copy the code cells into `backend/scripts/main.py` (or create a new file)
3. Structure your code as a function:

```python
def main(dataset_path=None, **kwargs):
    # Load dataset
    df = pd.read_csv(dataset_path)
    
    # Your processing code here
    # ... (from Colab notebook)
    
    # Return results
    return {
        'success': True,
        'result': your_results,
        'data': processed_data
    }
```

### 4. Start the Backend Server

```bash
cd backend
python app.py
```

The server will run on `http://localhost:5000`

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

### List Available Datasets
```
GET /api/python/datasets
```

### List Available Scripts
```
GET /api/python/scripts
```

### Run Python Script
```
POST /api/python/run
Content-Type: application/json

{
  "script_name": "main",
  "dataset": "your_dataset.csv",
  "param1": "value1",
  "param2": "value2"
}
```

### Process Data
```
POST /api/python/process
Content-Type: application/json

{
  "script_name": "main",
  "dataset": "your_dataset.csv",
  "data": {
    "param1": "value1"
  }
}
```

## 🔧 Converting Colab Notebook to Python Script

### Step 1: Extract Code Cells
Copy all code cells from your Colab notebook (excluding markdown cells).

### Step 2: Organize into Functions
Wrap your main logic in a function:

```python
def main(dataset_path=None, **kwargs):
    # Your Colab code here
    pass
```

### Step 3: Handle Dataset Loading
Replace hardcoded file paths with the `dataset_path` parameter:

```python
# In Colab (before):
df = pd.read_csv('/content/dataset.csv')

# In script (after):
df = pd.read_csv(dataset_path)
```

### Step 4: Return Results
Make sure your function returns a dictionary:

```python
return {
    'success': True,
    'results': your_results,
    'predictions': predictions,
    'accuracy': accuracy_score
}
```

## 📝 Example: Complete Script Structure

```python
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

def main(dataset_path=None, test_size=0.2, **kwargs):
    # Load dataset
    df = pd.read_csv(dataset_path)
    
    # Preprocessing (from Colab)
    X = df.drop('target', axis=1)
    y = df['target']
    
    # Train model (from Colab)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size)
    model = RandomForestClassifier()
    model.fit(X_train, y_train)
    
    # Predictions
    predictions = model.predict(X_test)
    accuracy = model.score(X_test, y_test)
    
    return {
        'success': True,
        'accuracy': float(accuracy),
        'predictions': predictions.tolist(),
        'feature_importance': model.feature_importances_.tolist()
    }
```

## 🔗 Frontend Integration

The React frontend can call these endpoints using the existing `apiService.js`. Example:

```javascript
// In your React component
import apiService from '../services/apiService';

const runPythonScript = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/python/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        script_name: 'main',
        dataset: 'your_dataset.csv'
      })
    });
    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## 🐛 Troubleshooting

### Import Errors
- Make sure all required libraries are in `requirements.txt`
- Install missing packages: `pip install package_name`

### Dataset Not Found
- Check that your dataset file is in `backend/data/` directory
- Verify the filename matches exactly (case-sensitive)

### Script Not Found
- Ensure your script file is in `backend/scripts/` directory
- File must have `.py` extension
- Function must be named `main()`, `process()`, or `run()`

### Port Already in Use
- Change the port in `app.py`: `app.run(port=5001)`
- Or stop the process using port 5000

## 📚 Additional Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Pandas Documentation](https://pandas.pydata.org/)
- [NumPy Documentation](https://numpy.org/)

