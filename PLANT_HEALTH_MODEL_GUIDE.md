# Plant Health Classification Model - Complete Guide

## 📊 What This Code Does

Your Colab notebook implements a **Neural Additive Model (NAM) with Interactions** for plant health classification. Here's what it does:

### 1. **Data Preprocessing**
- Loads plant health data from CSV
- Handles datetime columns by extracting hour, day, month, weekday
- Applies cyclic encoding (sin/cos) for temporal features
- Standardizes numerical features using StandardScaler
- Encodes target labels (Plant_Health_Status) using LabelEncoder

### 2. **Model Architecture**
- **Feature Networks**: Individual neural networks for each feature (16 hidden units each)
- **Interaction Layer**: Learns relationships between features (128 hidden units)
- **Output Layer**: Classifies into plant health status categories

### 3. **Training Process**
- Uses **5-fold Stratified Cross-Validation** to ensure robust evaluation
- Trains for 200 epochs per fold
- Uses **class-weighted loss** to handle imbalanced datasets
- Evaluates using Accuracy and F1-Score metrics

### 4. **Results**
- Mean accuracy and F1-score across all folds
- Standard deviation showing model stability
- Per-fold performance metrics

## 🔄 How It Works in the Integration

### Model Training vs. Loading

**By Default (retrain=false):**
- ✅ **First time**: Model trains and saves to `backend/models/`
- ✅ **Subsequent runs**: Loads existing model (FAST - no training)
- ✅ **No retraining** unless you explicitly request it

**When retrain=true:**
- 🔄 **Always retrains** the model from scratch
- ⏱️ Takes longer (several minutes depending on dataset size)
- 💾 Saves new model, overwriting the old one

### File Structure After Training

```
backend/
├── models/
│   ├── plant_health_model.pt      # Trained PyTorch model
│   ├── scaler.pkl                 # Feature scaler
│   ├── label_encoder.pkl          # Label encoder
│   └── model_metadata.json        # Model info (accuracy, features, etc.)
├── scripts/
│   └── plant_health_model.py      # Your converted code
└── data/
    └── plant_health_data.csv      # Your dataset
```

## 🚀 How to Use

### Step 1: Place Your Dataset

Put your `plant_health_data.csv` file in:
```
backend/data/plant_health_data.csv
```

**Important**: Make sure your CSV has a column named `Plant_Health_Status` (the target variable).

### Step 2: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Note**: PyTorch installation may take a few minutes. For CPU-only version (default), it's about 200MB.

### Step 3: Start Backend

```bash
cd backend
python app.py
```

### Step 4: Use in Frontend

1. Open React app: `http://localhost:3000`
2. Click "Python Integration" in sidebar
3. Select script: `plant_health_model`
4. Select dataset: `plant_health_data.csv`
5. **Check "Retrain model"** if you want to train from scratch
6. Click "Run Script"

### Step 5: View Results

The results will show:
- ✅ Model status (trained or using existing)
- 📊 Mean Accuracy with standard deviation
- 📈 Mean F1-Score with standard deviation
- 📋 Per-fold cross-validation results
- ℹ️ Model metadata (features, classes, device, etc.)

## 🔧 Configuration Options

You can modify training parameters in the frontend or by editing the script:

```python
# In plant_health_model.py, main() function:
result = train_model(
    dataset_path=dataset_path,
    retrain=False,      # Set to True to always retrain
    epochs=200,         # Number of training epochs
    k_folds=5          # Cross-validation folds
)
```

## 📈 Understanding the Results

### Accuracy
- **Mean Accuracy**: Average accuracy across all 5 folds
- **± Standard Deviation**: Shows how consistent the model is
- Higher is better (0-1 scale, displayed as percentage)

### F1-Score
- **Mean F1-Score**: Average F1-score (weighted) across all folds
- Better metric for imbalanced datasets
- Higher is better (0-1 scale)

### Fold Results
- Shows performance for each of the 5 cross-validation folds
- Helps identify if model is stable across different data splits

## ⚡ Performance Considerations

### First Run (Training)
- ⏱️ **Time**: 5-15 minutes (depends on dataset size and CPU/GPU)
- 💾 **Memory**: ~500MB-2GB depending on dataset
- 🔥 **CPU Usage**: High during training

### Subsequent Runs (Using Existing Model)
- ⚡ **Time**: < 1 second (just loads model)
- 💾 **Memory**: ~100-200MB
- 🔋 **CPU Usage**: Minimal

## 🐛 Troubleshooting

### "Target column not found"
- Make sure your CSV has a column named exactly `Plant_Health_Status`
- Check for typos or extra spaces

### "CUDA out of memory" (if using GPU)
- The code automatically falls back to CPU
- For large datasets, reduce batch size or use CPU

### Model not loading
- Check that `backend/models/` directory exists
- Verify all model files are present (.pt, .pkl, .json)
- Try retraining: set `retrain=true`

### Slow training
- Normal for first run (5-15 minutes)
- Consider reducing epochs or k_folds for faster iteration
- Use GPU if available (automatically detected)

## 📝 Code Changes Made

### From Colab to Backend Script

1. **Removed hardcoded paths**: Uses `dataset_path` parameter
2. **Added model saving**: Saves model, scaler, and encoder after training
3. **Added model loading**: Checks for existing model before training
4. **Added retrain flag**: Control whether to retrain or use existing
5. **Structured output**: Returns JSON-serializable results
6. **Error handling**: Better error messages and tracebacks

### Key Functions

- `preprocess_data()`: Handles data preprocessing
- `train_model()`: Trains or loads the model
- `predict()`: Makes predictions on new data (for future use)
- `main()`: Main entry point for API calls

## 🔮 Future Enhancements

You can extend this to:
1. **Real-time predictions**: Use the `predict()` function to classify new plant data
2. **Model comparison**: Train multiple models and compare
3. **Feature importance**: Extract which features matter most
4. **Visualizations**: Add charts for training curves, confusion matrices

## 📚 Technical Details

### Model Architecture
- **Input**: Standardized numerical features
- **Feature Networks**: 1 → 16 → 16 (ReLU activation)
- **Interaction Layer**: (num_features × 16) → 128 → num_classes
- **Dropout**: 0.2 in interaction layer (prevents overfitting)

### Training
- **Optimizer**: Adam (learning rate: 0.001)
- **Loss**: CrossEntropyLoss with class weights (handles imbalance)
- **Validation**: 5-fold stratified cross-validation
- **Epochs**: 200 per fold

### Why NAM?
- **Interpretability**: Each feature has its own network
- **Interactions**: Learns feature relationships
- **Performance**: Good accuracy on tabular data
- **Flexibility**: Handles non-linear relationships

---

**Need Help?** Check the main [PYTHON_INTEGRATION.md](PYTHON_INTEGRATION.md) guide or the backend [README.md](backend/README.md).


