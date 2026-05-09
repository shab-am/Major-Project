"""
Compatibility runner for training the hydroponics plant health model.
"""

from pathlib import Path
import json
import sys


CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
SCRIPTS_DIR = BACKEND_DIR / "scripts"

if str(SCRIPTS_DIR) not in sys.path:
    sys.path.append(str(SCRIPTS_DIR))

from plant_health_model import main  # noqa: E402


if __name__ == "__main__":
    dataset_path = BACKEND_DIR / "data" / "plant_health_hydroponics_dataset.csv"
    result = main(
        dataset_path=str(dataset_path),
        retrain=True,
        pretrain_epochs=300,
        dec_epochs=200,
        latent_dim=16,
        n_clusters=3,
        gamma=0.1,
    )
    print(json.dumps(result, indent=2))
