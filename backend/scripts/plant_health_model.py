"""
Plant Health Classification Model using Neural Additive Model (NAM) with Interactions
Converted from Colab notebook
"""

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.nn.functional as F
import os
import pickle
import json
from pathlib import Path

from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import accuracy_score, f1_score, classification_report

# Set device (CPU for backend, GPU if available)
device = "cuda" if torch.cuda.is_available() else "cpu"

# Model save directory
MODEL_DIR = Path(__file__).parent.parent / "models"
MODEL_DIR.mkdir(exist_ok=True)

TARGET_COL = "Plant_Health_Status"


class FeatureNet(nn.Module):
    """Individual feature network for NAM"""
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(1, 16),
            nn.ReLU(),
            nn.Linear(16, 16),
            nn.ReLU()
        )

    def forward(self, x):
        return self.net(x)


class NAMWithInteractions(nn.Module):
    """Neural Additive Model with feature interactions"""
    def __init__(self, num_features, num_classes):
        super().__init__()

        self.feature_nets = nn.ModuleList(
            [FeatureNet() for _ in range(num_features)]
        )

        # Interaction layer (learns feature-feature relations)
        self.interaction = nn.Sequential(
            nn.Linear(num_features * 16, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, num_classes)
        )

    def forward(self, x):
        feature_outputs = []

        for i, net in enumerate(self.feature_nets):
            xi = x[:, i].unsqueeze(1)
            feature_outputs.append(net(xi))

        # Concatenate learned feature representations
        h = torch.cat(feature_outputs, dim=1)

        return self.interaction(h)


def preprocess_data(df, scaler=None, le=None, fit=True):
    """
    Preprocess the dataframe
    
    Args:
        df: Input dataframe
        scaler: Fitted StandardScaler (if fit=False)
        le: Fitted LabelEncoder (if fit=False)
        fit: Whether to fit the scaler and encoder
    
    Returns:
        X, y, scaler, le, feature_names
    """
    df = df.copy()
    
    # Handle datetime columns
    for col in df.columns:
        if df[col].dtype == "object" and col != TARGET_COL:
            try:
                dt = pd.to_datetime(df[col])
                df[col+"_hour"] = dt.dt.hour
                df[col+"_day"] = dt.dt.day
                df[col+"_month"] = dt.dt.month
                df[col+"_weekday"] = dt.dt.weekday

                # Cyclic encoding (very important)
                df[col+"_hour_sin"] = np.sin(2*np.pi*dt.dt.hour/24)
                df[col+"_hour_cos"] = np.cos(2*np.pi*dt.dt.hour/24)

                df.drop(columns=[col], inplace=True)
            except:
                pass
    
    # Extract target and features
    if TARGET_COL not in df.columns:
        raise ValueError(f"Target column '{TARGET_COL}' not found in dataset")
    
    y = df[TARGET_COL].values
    X = df.drop(columns=[TARGET_COL])
    
    # Select only numeric columns
    X = X.select_dtypes(include=[np.number])
    feature_names = list(X.columns)
    
    # Scale features
    if fit:
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
    else:
        if scaler is None:
            raise ValueError("Scaler must be provided when fit=False")
        X_scaled = scaler.transform(X)
    
    # Encode labels
    if fit:
        le = LabelEncoder()
        y_encoded = le.fit_transform(y)
    else:
        if le is None:
            raise ValueError("LabelEncoder must be provided when fit=False")
        # Handle unseen labels
        y_encoded = []
        for label in y:
            if label in le.classes_:
                y_encoded.append(le.transform([label])[0])
            else:
                y_encoded.append(-1)  # Unknown label
        y_encoded = np.array(y_encoded)
    
    return X_scaled, y_encoded, scaler, le, feature_names


def train_model(dataset_path, retrain=False, epochs=200, k_folds=5):
    """
    Train the plant health classification model
    
    Args:
        dataset_path: Path to the dataset CSV file
        retrain: If True, retrain even if model exists. If False, load existing model
        epochs: Number of training epochs
        k_folds: Number of folds for cross-validation
    
    Returns:
        dict: Training results and model info
    """
    model_path = MODEL_DIR / "plant_health_model.pt"
    scaler_path = MODEL_DIR / "scaler.pkl"
    encoder_path = MODEL_DIR / "label_encoder.pkl"
    metadata_path = MODEL_DIR / "model_metadata.json"
    
    # Check if model exists and retrain flag
    if not retrain and model_path.exists() and scaler_path.exists() and encoder_path.exists():
        try:
            # Load existing model
            metadata = json.load(open(metadata_path)) if metadata_path.exists() else {}
            return {
                'success': True,
                'message': 'Using existing trained model',
                'model_exists': True,
                'metadata': metadata,
                'model_path': str(model_path),
                'retrain': False
            }
        except Exception as e:
            print(f"Error loading existing model: {e}. Retraining...")
    
    # Load and preprocess data
    print(f"Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)
    
    print("Preprocessing data...")
    X, y, scaler, le, feature_names = preprocess_data(df, fit=True)
    
    print(f"X shape: {X.shape}")
    print(f"Classes: {le.classes_}")
    print(f"Number of features: {len(feature_names)}")
    
    # Convert to tensors
    X = torch.tensor(X, dtype=torch.float)
    y = torch.tensor(y, dtype=torch.long)
    
    # Cross-validation
    kfold = StratifiedKFold(n_splits=k_folds, shuffle=True, random_state=42)
    
    acc_scores = []
    f1_scores = []
    fold_results = []
    
    print(f"\nStarting {k_folds}-fold cross-validation...")
    
    for fold, (train_idx, test_idx) in enumerate(kfold.split(X, y)):
        print(f"\n===== Fold {fold+1}/{k_folds} =====")
        
        X_train, X_test = X[train_idx], X[test_idx]
        y_train, y_test = y[train_idx], y[test_idx]
        
        model = NAMWithInteractions(
            num_features=X.shape[1],
            num_classes=len(torch.unique(y))
        ).to(device)
        
        # Class-weighted loss (important for imbalanced datasets)
        class_weights = torch.bincount(y_train)
        class_weights = 1.0 / class_weights.float()
        class_weights = class_weights / class_weights.sum()
        
        criterion = nn.CrossEntropyLoss(weight=class_weights.to(device))
        optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
        
        # Training
        print(f"Training for {epochs} epochs...")
        for epoch in range(epochs):
            model.train()
            optimizer.zero_grad()
            
            logits = model(X_train.to(device))
            loss = criterion(logits, y_train.to(device))
            
            loss.backward()
            optimizer.step()
            
            if (epoch + 1) % 50 == 0:
                print(f"  Epoch {epoch+1}/{epochs}, Loss: {loss.item():.4f}")
        
        # Testing
        model.eval()
        with torch.no_grad():
            preds = model(X_test.to(device)).argmax(dim=1).cpu()
        
        acc = accuracy_score(y_test.cpu(), preds)
        f1 = f1_score(y_test.cpu(), preds, average="weighted")
        
        acc_scores.append(acc)
        f1_scores.append(f1)
        
        fold_results.append({
            'fold': fold + 1,
            'accuracy': float(acc),
            'f1_score': float(f1)
        })
        
        print(f"Fold {fold+1} - Accuracy: {acc:.4f}, F1-score: {f1:.4f}")
        
        # Save the model from the last fold (or best fold)
        if fold == k_folds - 1:
            torch.save(model.state_dict(), model_path)
            with open(scaler_path, 'wb') as f:
                pickle.dump(scaler, f)
            with open(encoder_path, 'wb') as f:
                pickle.dump(le, f)
    
    # Final results
    mean_acc = np.mean(acc_scores)
    std_acc = np.std(acc_scores)
    mean_f1 = np.mean(f1_scores)
    std_f1 = np.std(f1_scores)
    
    print("\n===== FINAL RESULTS =====")
    print(f"Mean Accuracy: {mean_acc:.4f} ± {std_acc:.4f}")
    print(f"Mean F1-score: {mean_f1:.4f} ± {std_f1:.4f}")
    
    # Save metadata
    metadata = {
        'mean_accuracy': float(mean_acc),
        'std_accuracy': float(std_acc),
        'mean_f1_score': float(mean_f1),
        'std_f1_score': float(std_f1),
        'num_features': len(feature_names),
        'num_classes': len(le.classes_),
        'classes': le.classes_.tolist(),
        'feature_names': feature_names,
        'dataset_shape': df.shape,
        'k_folds': k_folds,
        'epochs': epochs,
        'device': device
    }
    
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    return {
        'success': True,
        'message': 'Model trained successfully',
        'mean_accuracy': float(mean_acc),
        'std_accuracy': float(std_acc),
        'mean_f1_score': float(mean_f1),
        'std_f1_score': float(std_f1),
        'fold_results': fold_results,
        'metadata': metadata,
        'model_path': str(model_path),
        'retrain': True
    }


def predict(model_path, scaler_path, encoder_path, X_new):
    """
    Make predictions on new data
    
    Args:
        model_path: Path to saved model
        scaler_path: Path to saved scaler
        encoder_path: Path to saved label encoder
        X_new: New data (dataframe or array)
    
    Returns:
        dict: Predictions and probabilities
    """
    # Load model components
    with open(scaler_path, 'rb') as f:
        scaler = pickle.load(f)
    with open(encoder_path, 'rb') as f:
        le = pickle.load(f)
    
    metadata_path = MODEL_DIR / "model_metadata.json"
    with open(metadata_path, 'r') as f:
        metadata = json.load(f)
    
    # Preprocess new data
    if isinstance(X_new, pd.DataFrame):
        # Remove target column if present
        if TARGET_COL in X_new.columns:
            X_new = X_new.drop(columns=[TARGET_COL])
        X_new = X_new.select_dtypes(include=[np.number])
        # Ensure same feature order
        X_new = X_new.reindex(columns=metadata['feature_names'], fill_value=0)
        X_scaled = scaler.transform(X_new)
    else:
        X_scaled = scaler.transform(X_new)
    
    # Load model
    model = NAMWithInteractions(
        num_features=metadata['num_features'],
        num_classes=metadata['num_classes']
    ).to(device)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()
    
    # Make predictions
    X_tensor = torch.tensor(X_scaled, dtype=torch.float).to(device)
    with torch.no_grad():
        logits = model(X_tensor)
        probs = F.softmax(logits, dim=1)
        preds = logits.argmax(dim=1).cpu().numpy()
    
    # Decode predictions
    predicted_classes = le.inverse_transform(preds)
    
    return {
        'predictions': predicted_classes.tolist(),
        'probabilities': probs.cpu().numpy().tolist(),
        'classes': le.classes_.tolist()
    }


def main(dataset_path=None, retrain=False, epochs=200, k_folds=5, **kwargs):
    """
    Main function to train or load the model
    
    Args:
        dataset_path: Path to dataset CSV file
        retrain: If True, retrain the model. If False, use existing model if available
        epochs: Number of training epochs
        k_folds: Number of cross-validation folds
    
    Returns:
        dict: Results dictionary
    """
    if not dataset_path:
        return {
            'error': 'Dataset path is required',
            'dataset_path': dataset_path
        }
    
    if not os.path.exists(dataset_path):
        return {
            'error': f'Dataset file not found: {dataset_path}',
            'dataset_path': dataset_path
        }
    
    try:
        result = train_model(dataset_path, retrain=retrain, epochs=epochs, k_folds=k_folds)
        return result
    except Exception as e:
        import traceback
        return {
            'error': str(e),
            'traceback': traceback.format_exc(),
            'type': type(e).__name__
        }


if __name__ == '__main__':
    # Test the model
    result = main(
        dataset_path='../data/plant_health_data.csv',
        retrain=True,
        epochs=200,
        k_folds=5
    )
    print(json.dumps(result, indent=2))


