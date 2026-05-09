---
title: Diagnova Lung XRay Classifier
emoji: 🫁
colorFrom: blue
colorTo: indigo
sdk: gradio
sdk_version: 5.9.0
app_file: app.py
pinned: false
---

Multi-label DenseNet121 classifier for 14 chest pathologies trained on NIH ChestX-ray14. Returns findings, top-3 predictions, and full probability distribution. Intended for use as a private API endpoint — not for direct clinical use.
