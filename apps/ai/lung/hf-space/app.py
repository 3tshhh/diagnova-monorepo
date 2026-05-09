import os
import json
import numpy as np
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from huggingface_hub import hf_hub_download
import gradio as gr

CLASSES = [
    "Atelectasis", "Cardiomegaly", "Effusion", "Infiltration", "Mass",
    "Nodule", "Pneumonia", "Pneumothorax", "Consolidation", "Edema",
    "Emphysema", "Fibrosis", "Pleural_Thickening", "Hernia",
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


# Load once at Space startup
is_loaded = False
model = None

try:
    HF_TOKEN = os.environ["HF_TOKEN"]
    MODEL_REPO_ID = os.environ["MODEL_REPO_ID"]

    print(f"Downloading model from: {MODEL_REPO_ID}")
    model_path = hf_hub_download(
        repo_id=MODEL_REPO_ID,
        filename="best_densenet121_v2_model.pt",
        token=HF_TOKEN,
    )
    print(f"Model downloaded to: {model_path}")

    model = DenseNet121_V2(num_classes=14)

    state_dict = torch.load(model_path, map_location="cpu")

    if isinstance(state_dict, dict) and "model_state_dict" in state_dict:
        state_dict = state_dict["model_state_dict"]
    elif isinstance(state_dict, dict) and "state_dict" in state_dict:
        state_dict = state_dict["state_dict"]

    load_result = model.load_state_dict(state_dict, strict=False)
    if load_result.missing_keys:
        print(f"WARNING - missing keys ({len(load_result.missing_keys)}): {load_result.missing_keys[:10]}")
    if load_result.unexpected_keys:
        print(f"WARNING - unexpected keys ({len(load_result.unexpected_keys)}): {load_result.unexpected_keys[:10]}")
    if load_result.missing_keys or load_result.unexpected_keys:
        print("Architecture mismatch detected — model may be randomly initialized!")

    model.eval()
    is_loaded = True
    print("Lung model loaded successfully!")

except Exception as e:
    print(f"Error loading lung model: {e}")


def predict(image: Image.Image) -> dict:
    if not is_loaded:
        return {"error": "Model not loaded"}

    image = image.convert("RGB")
    tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        outputs = model(tensor)
        probs = torch.sigmoid(outputs)[0]

    probs_list = probs.cpu().numpy().tolist()

    top3_indices = np.argsort(probs_list)[::-1][:3]
    top3 = [
        {"class": CLASSES[i], "confidence": round(float(probs_list[i]), 4)}
        for i in top3_indices
    ]

    THRESHOLD = 0.5
    findings = [CLASSES[i] for i, p in enumerate(probs_list) if p >= THRESHOLD]

    return {
        "findings": findings if findings else ["No Finding"],
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
    title="Lung X-Ray Classifier",
    description="DenseNet121 multi-label classifier for 14 chest pathologies",
).launch(share=False, show_error=True)
