import os
import numpy as np
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from huggingface_hub import hf_hub_download
import gradio as gr

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
    "Transverse",
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


# Load once at Space startup
is_loaded = False
model = None

try:
    HF_TOKEN = os.environ["HF_TOKEN"]
    MODEL_REPO_ID = os.environ["MODEL_REPO_ID"]

    print(f"Downloading model from: {MODEL_REPO_ID}")
    model_path = hf_hub_download(
        repo_id=MODEL_REPO_ID,
        filename="best_bone_model.pt",
        token=HF_TOKEN,
    )
    print(f"Model downloaded to: {model_path}")

    model = BoneFractureModel(num_classes=10)

    state_dict = torch.load(model_path, map_location="cpu")

    if isinstance(state_dict, dict) and "model_state_dict" in state_dict:
        state_dict = state_dict["model_state_dict"]
    elif isinstance(state_dict, dict) and "state_dict" in state_dict:
        state_dict = state_dict["state_dict"]

    if any(k.startswith("base_model.") for k in state_dict.keys()):
        state_dict = {k.replace("base_model.", ""): v for k, v in state_dict.items()}

    load_result = model.load_state_dict(state_dict, strict=False)
    if load_result.missing_keys:
        print(f"WARNING - missing keys ({len(load_result.missing_keys)}): {load_result.missing_keys[:10]}")
    if load_result.unexpected_keys:
        print(f"WARNING - unexpected keys ({len(load_result.unexpected_keys)}): {load_result.unexpected_keys[:10]}")
    if load_result.missing_keys or load_result.unexpected_keys:
        print("Architecture mismatch detected — model may be randomly initialized!")

    model.eval()
    is_loaded = True
    print("Bone model loaded successfully!")

except Exception as e:
    print(f"Error loading bone model: {e}")


def predict(image: Image.Image) -> dict:
    if not is_loaded:
        return {"error": "Model not loaded"}

    image = image.convert("RGB")
    tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        outputs = model(tensor)
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
        },
    }


gr.Interface(
    fn=predict,
    inputs=gr.Image(type="pil", label="X-Ray Image"),
    outputs=gr.JSON(label="Predictions"),
    title="Bone Fracture Classifier",
    description="EfficientNet-B4 classifier for 10 bone fracture types",
).launch(share=False, show_error=True)
