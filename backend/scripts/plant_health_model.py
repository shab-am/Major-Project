"""
DEC-NAM training and prediction for the hydroponics dataset.
"""

import json
import os
import pickle
from pathlib import Path

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from sklearn.metrics import silhouette_score
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

MODEL_DIR = Path(__file__).parent.parent / "models"
MODEL_DIR.mkdir(exist_ok=True)

DEFAULT_DATASET = Path(__file__).parent.parent / "data" / "plant_health_hydroponics_dataset.csv"
MODEL_NAME = "hydroponics_dec_nam"

RAW_FEATURES = [
    "Ambient_Temperature",
    "Water_Temperature",
    "Humidity",
    "Light_Intensity",
    "Water_pH",
    "Dissolved_Oxygen_mg_L",
    "EC_mS_cm",
    "TDS_ppm",
    "Electrochemical_Signal",
]

BASE_FEATURES = [
    "EC_mS_cm",
    "TDS_ppm",
    "Dissolved_Oxygen_mg_L",
    "Water_pH",
    "Electrochemical_Signal",
]

IDEAL_VALUES = {
    "EC_mS_cm": 1.2,
    "TDS_ppm": 650.0,
    "Dissolved_Oxygen_mg_L": 6.5,
    "Water_pH": 6.5,
    "Electrochemical_Signal": 1.0,
}

INPUT_ALIASES = {
    "ambient_temperature": "Ambient_Temperature",
    "temperature": "Ambient_Temperature",
    "water_temperature": "Water_Temperature",
    "soil_temperature": "Water_Temperature",
    "humidity": "Humidity",
    "light_intensity": "Light_Intensity",
    "water_ph": "Water_pH",
    "soil_ph": "Water_pH",
    "soilph": "Water_pH",
    "ph": "Water_pH",
    "ph_value": "Water_pH",
    "dissolved_oxygen": "Dissolved_Oxygen_mg_L",
    "dissolvedoxygen": "Dissolved_Oxygen_mg_L",
    "dissolved_oxygen_mg_l": "Dissolved_Oxygen_mg_L",
    "ec": "EC_mS_cm",
    "ec_value": "EC_mS_cm",
    "ec_ms_cm": "EC_mS_cm",
    "tds": "TDS_ppm",
    "tds_value": "TDS_ppm",
    "tds_ppm": "TDS_ppm",
    "electrochemical_signal": "Electrochemical_Signal",
}


class FeatureNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(1, 16),
            nn.ReLU(),
            nn.Linear(16, 16),
            nn.ReLU(),
        )

    def forward(self, x):
        return self.net(x)


class DECNAM(nn.Module):
    def __init__(self, num_features, latent_dim=16, n_clusters=3):
        super().__init__()
        self.n_clusters = n_clusters
        self.feature_nets = nn.ModuleList([FeatureNet() for _ in range(num_features)])
        self.encoder = nn.Sequential(
            nn.Linear(num_features * 16, 64),
            nn.ReLU(),
            nn.Linear(64, latent_dim),
        )
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 64),
            nn.ReLU(),
            nn.Linear(64, num_features),
        )
        self.cluster_centers = nn.Parameter(torch.randn(n_clusters, latent_dim))

    def forward(self, x):
        feature_embeddings = []
        for i, net in enumerate(self.feature_nets):
            feature_embeddings.append(net(x[:, i].unsqueeze(1)))
        hidden = torch.cat(feature_embeddings, dim=1)
        latent = self.encoder(hidden)
        reconstructed = self.decoder(latent)
        return reconstructed, latent

    def soft_assign(self, latent):
        dist = torch.cdist(latent, self.cluster_centers)
        q = 1.0 / (1.0 + dist ** 2)
        q = q / torch.sum(q, dim=1, keepdim=True)
        return q


def _normalize_input_frame(df):
    df = df.copy()
    rename_map = {}
    for col in df.columns:
        canonical = INPUT_ALIASES.get(col.lower())
        if canonical:
            rename_map[col] = canonical
    if rename_map:
        df = df.rename(columns=rename_map)
    return df


def _build_feature_frame(df):
    df = _normalize_input_frame(df)
    missing = [col for col in RAW_FEATURES if col not in df.columns]
    if missing:
        raise ValueError(f"Dataset is missing required columns: {missing}")

    feature_df = df[BASE_FEATURES].apply(pd.to_numeric, errors="coerce").copy()
    feature_df = feature_df.fillna(feature_df.median(numeric_only=True))

    for col, ideal in IDEAL_VALUES.items():
        feature_df[f"{col}_dev"] = (feature_df[col] - ideal).abs()

    feature_df["EC_TDS_ratio"] = feature_df["EC_mS_cm"] / (feature_df["TDS_ppm"] + 1e-6)
    feature_df["DO_EC_ratio"] = feature_df["Dissolved_Oxygen_mg_L"] / (feature_df["EC_mS_cm"] + 1e-6)
    return feature_df


def _target_distribution(q):
    weight = q ** 2 / torch.sum(q, dim=0)
    return (weight.t() / torch.sum(weight, dim=1)).t()


def _cluster_label_mapping(summary_df):
    deviation_score = pd.Series(0.0, index=summary_df.index)
    for col, ideal in IDEAL_VALUES.items():
        deviation_score += (summary_df[col] - ideal).abs() / max(abs(ideal), 1e-6)

    ordered_clusters = deviation_score.sort_values().index.tolist()
    labels = ["Healthy", "Moderate Stress", "High Stress"]
    mapping = {}
    for idx, cluster_id in enumerate(ordered_clusters):
        label = labels[idx] if idx < len(labels) else f"Cluster {cluster_id}"
        mapping[int(cluster_id)] = label
    return mapping, deviation_score.to_dict()


def _save_artifacts(model, scaler, metadata, model_path, scaler_path, encoder_path, metadata_path):
    torch.save(
        {
            "model_state_dict": model.state_dict(),
            "cluster_centers": model.cluster_centers.detach().cpu(),
            "num_features": metadata["num_features"],
            "n_clusters": metadata["num_clusters"],
            "latent_dim": metadata["latent_dim"],
        },
        model_path,
    )
    with open(scaler_path, "wb") as f:
        pickle.dump(scaler, f)
    with open(encoder_path, "wb") as f:
        pickle.dump({int(k): v for k, v in metadata["cluster_labels"].items()}, f)
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)


def train_model(
    dataset_path,
    retrain=False,
    pretrain_epochs=300,
    dec_epochs=200,
    latent_dim=16,
    n_clusters=3,
    gamma=0.1,
):
    model_path = MODEL_DIR / "plant_health_model.pt"
    scaler_path = MODEL_DIR / "scaler.pkl"
    encoder_path = MODEL_DIR / "label_encoder.pkl"
    metadata_path = MODEL_DIR / "model_metadata.json"

    if not retrain and model_path.exists() and scaler_path.exists() and metadata_path.exists():
        metadata = json.load(open(metadata_path, encoding="utf-8"))
        return {
            "success": True,
            "message": "Using existing trained model",
            "model_exists": True,
            "metadata": metadata,
            "model_path": str(model_path),
            "retrain": False,
        }

    print(f"Using device: {device}")
    print(f"Loading dataset from: {dataset_path}")

    df = pd.read_csv(dataset_path)
    feature_df = _build_feature_frame(df)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(feature_df)
    X_tensor = torch.tensor(X_scaled, dtype=torch.float32).to(device)

    model = DECNAM(
        num_features=X_tensor.shape[1],
        latent_dim=latent_dim,
        n_clusters=n_clusters,
    ).to(device)

    optimizer = optim.Adam(model.parameters(), lr=0.001)
    recon_loss_fn = nn.MSELoss()

    print(f"Dataset shape: {df.shape}")
    print(f"Training features: {list(feature_df.columns)}")

    for epoch in range(pretrain_epochs):
        optimizer.zero_grad()
        reconstructed, _ = model(X_tensor)
        loss = recon_loss_fn(reconstructed, X_tensor)
        loss.backward()
        optimizer.step()

        if epoch % 50 == 0:
            print(f"Pretrain Epoch {epoch} | Recon Loss: {loss.item():.5f}")

    model.eval()
    with torch.no_grad():
        _, latent = model(X_tensor)

    latent_np = latent.cpu().numpy()
    gmm = GaussianMixture(n_components=n_clusters, random_state=42)
    gmm.fit(latent_np)

    model.cluster_centers.data = torch.tensor(
        gmm.means_,
        dtype=torch.float32,
        device=device,
    )

    optimizer = optim.Adam(model.parameters(), lr=0.0005)

    for epoch in range(dec_epochs):
        optimizer.zero_grad()
        reconstructed, latent = model(X_tensor)
        q = model.soft_assign(latent)
        p = _target_distribution(q).detach()

        recon_loss = recon_loss_fn(reconstructed, X_tensor)
        kl_loss = F.kl_div(q.log(), p, reduction="batchmean")
        loss = recon_loss + gamma * kl_loss
        loss.backward()
        optimizer.step()

        if epoch % 25 == 0:
            print(
                f"DEC Epoch {epoch} | Recon: {recon_loss.item():.4f} | KL: {kl_loss.item():.4f}"
            )

    model.eval()
    with torch.no_grad():
        _, latent = model(X_tensor)
        q = model.soft_assign(latent)

    clusters = q.argmax(dim=1).cpu().numpy()
    latent_np = latent.cpu().numpy()
    sil = silhouette_score(latent_np, clusters)
    print(f"DEC Silhouette Score: {sil}")

    result_df = df.copy()
    result_df["cluster"] = clusters
    cluster_summary = result_df.groupby("cluster")[BASE_FEATURES].mean().round(6)
    cluster_labels, deviation_scores = _cluster_label_mapping(cluster_summary)

    metadata = {
        "model_name": MODEL_NAME,
        "training_mode": "DEC-NAM unsupervised clustering",
        "dataset_path": str(dataset_path),
        "dataset_shape": list(df.shape),
        "device": str(device),
        "num_features": len(feature_df.columns),
        "feature_names": list(feature_df.columns),
        "raw_feature_names": RAW_FEATURES,
        "base_feature_names": BASE_FEATURES,
        "num_clusters": n_clusters,
        "num_classes": n_clusters,
        "classes": [cluster_labels[idx] for idx in sorted(cluster_labels)],
        "latent_dim": latent_dim,
        "pretrain_epochs": pretrain_epochs,
        "dec_epochs": dec_epochs,
        "gamma": gamma,
        "silhouette_score": float(sil),
        "overall_silhouette_score": float(sil),
        "ideal_values": IDEAL_VALUES,
        "cluster_labels": {str(k): v for k, v in cluster_labels.items()},
        "cluster_deviation_scores": {str(int(k)): float(v) for k, v in deviation_scores.items()},
        "cluster_counts": {str(int(k)): int(v) for k, v in pd.Series(clusters).value_counts().sort_index().items()},
        "cluster_summary": {
            str(int(cluster_id)): {
                key: float(value)
                for key, value in row.items()
            }
            for cluster_id, row in cluster_summary.to_dict(orient="index").items()
        },
    }

    _save_artifacts(
        model=model,
        scaler=scaler,
        metadata=metadata,
        model_path=model_path,
        scaler_path=scaler_path,
        encoder_path=encoder_path,
        metadata_path=metadata_path,
    )

    named_predictions = [cluster_labels[int(cluster)] for cluster in clusters]

    return {
        "success": True,
        "message": "DEC-NAM model trained successfully",
        "metadata": metadata,
        "model_path": str(model_path),
        "retrain": True,
        "predictions_preview": named_predictions[:10],
    }


def predict(model_path, scaler_path, encoder_path, X_new):
    with open(scaler_path, "rb") as f:
        scaler = pickle.load(f)
    with open(encoder_path, "rb") as f:
        cluster_labels = pickle.load(f)
    cluster_labels = {int(k): v for k, v in cluster_labels.items()}

    metadata_path = MODEL_DIR / "model_metadata.json"
    with open(metadata_path, "r", encoding="utf-8") as f:
        metadata = json.load(f)

    if isinstance(X_new, pd.DataFrame):
        df = X_new.copy()
    else:
        df = pd.DataFrame(X_new, columns=metadata["raw_feature_names"])

    feature_df = _build_feature_frame(df)
    feature_df = feature_df.reindex(columns=metadata["feature_names"], fill_value=0)
    X_scaled = scaler.transform(feature_df)
    X_tensor = torch.tensor(X_scaled, dtype=torch.float32).to(device)

    checkpoint = torch.load(model_path, map_location=device)
    model = DECNAM(
        num_features=checkpoint["num_features"],
        latent_dim=checkpoint["latent_dim"],
        n_clusters=checkpoint["n_clusters"],
    ).to(device)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.cluster_centers.data = checkpoint["cluster_centers"].to(device)
    model.eval()

    with torch.no_grad():
        _, latent = model(X_tensor)
        q = model.soft_assign(latent)

    cluster_ids = q.argmax(dim=1).cpu().numpy()
    predictions = [cluster_labels[int(cluster_id)] for cluster_id in cluster_ids]

    return {
        "predictions": predictions,
        "probabilities": q.cpu().numpy().tolist(),
        "classes": [cluster_labels[idx] for idx in sorted(cluster_labels)],
        "cluster_ids": cluster_ids.tolist(),
    }


def main(
    dataset_path=None,
    retrain=False,
    pretrain_epochs=300,
    dec_epochs=200,
    latent_dim=16,
    n_clusters=3,
    gamma=0.1,
    **kwargs,
):
    dataset_path = dataset_path or str(DEFAULT_DATASET)

    if not os.path.exists(dataset_path):
        return {
            "error": f"Dataset file not found: {dataset_path}",
            "dataset_path": dataset_path,
        }

    try:
        return train_model(
            dataset_path=dataset_path,
            retrain=retrain,
            pretrain_epochs=pretrain_epochs,
            dec_epochs=dec_epochs,
            latent_dim=latent_dim,
            n_clusters=n_clusters,
            gamma=gamma,
        )
    except Exception as e:
        import traceback

        return {
            "error": str(e),
            "traceback": traceback.format_exc(),
            "type": type(e).__name__,
        }


if __name__ == "__main__":
    result = main(
        dataset_path=str(DEFAULT_DATASET),
        retrain=True,
    )
    print(json.dumps(result, indent=2))
