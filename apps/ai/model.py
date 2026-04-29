import torch
import torch.nn as nn
import torchvision.transforms as transforms
from torchvision import models
from PIL import Image
import numpy as np
import io
import os

MODEL_PATH = r"C:\Users\mo010\OneDrive\Desktop\model-bone\best_bone_model.pt"

CLASSES = [
    "Comminuted",
    "Greenstick",
    "Healthy",
    "Linear",
    "Oblique Displaced",
    "Oblique",
    "Segmental",
    "Spiral",
    "Transverse Displaced",
    "Transverse"
]

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


class AttentionGate(nn.Module):
    def __init__(self, in_channels):
        super().__init__()
        self.gate = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
            nn.Linear(in_channels, in_channels // 4),
            nn.ReLU(),
            nn.Linear(in_channels // 4, in_channels),
            nn.Sigmoid()
        )

    def forward(self, x):
        w = self.gate(x).unsqueeze(-1).unsqueeze(-1)
        return x * w


class BoneFractureModel(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        base = models.efficientnet_b4(weights=None)
        self.features = base.features
        self.attention = AttentionGate(1792)
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.dropout1 = nn.Dropout(0.4)
        self.dropout2 = nn.Dropout(0.3)
        self.classifier = nn.Sequential(
            nn.Linear(1792, 512),
            nn.ReLU(),
            self.dropout2,
            nn.Linear(512, num_classes)
        )

    def forward(self, x):
        x = self.features(x)
        x = self.attention(x)
        x = self.pool(x)
        x = torch.flatten(x, 1)
        x = self.dropout1(x)
        return self.classifier(x)


class BoneModel:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.is_loaded = False
        self._load()

    def _load(self):
        try:
            print(f"Loading bone model from: {MODEL_PATH}")
            print(f"Using device: {self.device}")

            self.model = BoneFractureModel(num_classes=10)

            state_dict = torch.load(MODEL_PATH, map_location=self.device)

            # Handle different save formats
            if isinstance(state_dict, dict) and "model_state_dict" in state_dict:
                state_dict = state_dict["model_state_dict"]
            elif isinstance(state_dict, dict) and "state_dict" in state_dict:
                state_dict = state_dict["state_dict"]

            # Strip "base_model." prefix if present
            if any(k.startswith("base_model.") for k in state_dict.keys()):
                state_dict = {k.replace("base_model.", ""): v for k, v in state_dict.items()}

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
            print("Bone model loaded successfully!")

        except Exception as e:
            print(f"Error loading model: {e}")
            self.is_loaded = False

    def predict(self, image_bytes: bytes) -> dict:
        if not self.is_loaded:
            raise RuntimeError("Model not loaded")

        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor = transform(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(tensor)
            probs = torch.softmax(outputs, dim=1)[0]

        probs_list = probs.cpu().numpy().tolist()
        pred_idx = int(np.argmax(probs_list))
        confidence = float(probs_list[pred_idx])

        top3_indices = np.argsort(probs_list)[::-1][:3]
        top3 = [
            {"class": CLASSES[i], "confidence": round(float(probs_list[i]), 4)}
            for i in top3_indices
        ]

        return {
            "prediction": CLASSES[pred_idx],
            "confidence": round(confidence, 4),
            "top3": top3,
            "all_probabilities": {
                CLASSES[i]: round(float(probs_list[i]), 4)
                for i in range(len(CLASSES))
            }
        }
