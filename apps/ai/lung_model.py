import torch
import torch.nn as nn
import torchvision.transforms as transforms
from torchvision import models
from PIL import Image
import numpy as np
import io

MODEL_PATH = r"C:\Users\mo010\OneDrive\Desktop\lung2\best_densenet121_v2_model.pt"

CLASSES = [
    "Atelectasis",
    "Cardiomegaly",
    "Effusion",
    "Infiltration",
    "Mass",
    "Nodule",
    "Pneumonia",
    "Pneumothorax",
    "Consolidation",
    "Edema",
    "Emphysema",
    "Fibrosis",
    "Pleural_Thickening",
    "Hernia"
]

transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


class DenseNet121_V2(nn.Module):
    def __init__(self, num_classes=14):
        super().__init__()
        self.densenet = models.densenet121(weights=None)
        in_features = self.densenet.classifier.in_features
        self.densenet.classifier = nn.Sequential(
            nn.Dropout(p=0.5),
            nn.Linear(in_features, 512),
            nn.ReLU(),
            nn.Dropout(p=0.3),
            nn.Linear(512, num_classes)
        )

    def forward(self, x):
        return self.densenet(x)


class LungModel:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.is_loaded = False
        self._load()

    def _load(self):
        try:
            print(f"Loading lung model from: {MODEL_PATH}")
            print(f"Using device: {self.device}")

            self.model = DenseNet121_V2(num_classes=14)

            state_dict = torch.load(MODEL_PATH, map_location=self.device)

            # Handle different save formats
            if isinstance(state_dict, dict) and "model_state_dict" in state_dict:
                state_dict = state_dict["model_state_dict"]
            elif isinstance(state_dict, dict) and "state_dict" in state_dict:
                state_dict = state_dict["state_dict"]

            load_result = self.model.load_state_dict(state_dict, strict=False)
            if load_result.missing_keys:
                print(f"WARNING - missing keys ({len(load_result.missing_keys)}): {load_result.missing_keys[:10]}")
            if load_result.unexpected_keys:
                print(f"WARNING - unexpected keys ({len(load_result.unexpected_keys)}): {load_result.unexpected_keys[:10]}")
            if load_result.missing_keys or load_result.unexpected_keys:
                print("Architecture mismatch detected — model may be randomly initialized!")
            self.model.to(self.device)
            self.model.eval()
            self.is_loaded = True
            print("Lung model loaded successfully!")

        except Exception as e:
            print(f"Error loading lung model: {e}")
            self.is_loaded = False

    def predict(self, image_bytes: bytes) -> dict:
        if not self.is_loaded:
            raise RuntimeError("Lung model not loaded")

        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor = transform(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(tensor)
            # Multi-label: sigmoid بدل softmax
            probs = torch.sigmoid(outputs)[0]

        probs_list = probs.cpu().numpy().tolist()

        # Top 3 بالـ confidence الأعلى
        top3_indices = np.argsort(probs_list)[::-1][:3]
        top3 = [
            {"class": CLASSES[i], "confidence": round(float(probs_list[i]), 4)}
            for i in top3_indices
        ]

        THRESHOLD = 0.5
        findings = [
            CLASSES[i] for i, p in enumerate(probs_list) if p >= THRESHOLD
        ]

        return {
            "findings": findings if findings else ["No Finding"],
            "top3": top3,
            "all_probabilities": {
                CLASSES[i]: round(float(probs_list[i]), 4)
                for i in range(len(CLASSES))
            }
        }
