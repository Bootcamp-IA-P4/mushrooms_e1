# Mushroom Classifier: A Machine Learning Pipeline for Edibility Detection

<div align="center">
  <img src="https://res.cloudinary.com/diowtsfaq/image/upload/v1747045334/hongoclass_tfqi5y.jpg" alt="Descripción de la imagen" width="900" height="450">
</div>

## 📚 Table of Contents

1. [🧾 Overview](#overview)
2. [🎯 System Purpose and Scope](#system-purpose-and-scope)
3. [🔍 Main Features](#-main-features)
4. [💡 Possible Improvements](#-possible-improvements)
5. [📁 Folder Structure](#-folder-structure)
6. [🏗️ Architecture Diagram](#-architecture-diagram)
7. [⚙️ Installation and Usage](#️-installation-and-usage)
   - [1️⃣ Clone the repository](#1️⃣-clone-the-repository)
   - [2️⃣ Create and activate the virtual environment](#2️⃣-create-and-activate-the-virtual-environment)
   - [3️⃣ Install dependencies](#3️⃣-install-dependencies)
   - [4️⃣ Run the code](#4️⃣-run-the-code)
   - [5️⃣ Start the Streamlit](#5️⃣-start-the-streamlit)
8. [🚀 Deployment](#deployment)
9. [🧑‍💻 Collaborators](#-collaborators)

## 🧾 Overview

This document provides a technical overview of the mushrooms-e1 repository, a machine learning system designed for classifying mushrooms as edible or poisonous based on their physical characteristics. The repository implements a complete pipeline from data exploration to model deployment, focusing on ensuring high accuracy and recall for poisonous mushroom detection.

## 🎯 System Purpose and Scope

The mushrooms-e1 repository serves as a comprehensive mushroom classification system that:

1. Analyzes relationships between mushroom characteristics and edibility
2. Trains and evaluates multiple classification models
3. Deploys the best-performing model for inference
4. Provides a structured input validation system to ensure reliable predictions

The system emphasizes safety by prioritizing the accurate identification of poisonous mushrooms, minimizing the risk of false negatives that could lead to dangerous misclassifications.

## 🔍 Main Features

✅ Complete EDA with visualizations to understand variable relationships.

✅ Trained Random Forrest model to predict whenever a mushroom is poison or not

✅ Connecting to the API

✅ Connecting the backend with the frontend

✅ Implement solution using CSS, HTML, and Vanilla JavaScript

✅ Create connection with the database

✅ Model in production

## 💡 Possible Improvements

⏩ Dockerized version of the program.

⏩ Automated training and deployment systems (MLOps).

⏩ Experiments or deployments with neural network models.

## 📁 Folder Structure

```bash
📂 Mushroom-Classifier/

├── 📜 .gitignore

├── 📜 .python-version

├── 📜 hello.py

├── 📜 Informe_Proyecto_Mushroom_EDA_Modelado.md

├── 📜 pyproject.toml

├── 📜 README.md

├── 📜 requirements.txt

├── 📜 requirements.txt.prod

├── 📜 sqlalchemy

├── 📜 uv.lock

├── 📂 api/

│   ├── 📜 main.py

│   └── 📜 __init__.py

├── 📂 data/

│   ├── 📜 best_mushroom_model.pkl

│   ├── 📜 form_inputs.json

│   └── 📂 reports/

│       └── 📂 img/

│           ├── 📜 cramers_matrix.png

│           ├── 📜 heatmap_nulls.png

│           └── 📜 high_corr_matrix.png

├── 📂 db/

│   ├── 📜 crud.py

│   ├── 📜 database.py

│   ├── 📜 init_db.py

│   ├── 📜 models.py

│   └── 📜 __init__.py

├── 📂 eda/

│   └── 📜 EDA_mushroom.ipynb

├── 📂 models/

│   ├── 📜 Mushrooms_MODELS.ipynb

│   └── 📜 Mushrooms_MODELS_2_0.ipynb

├── 📂 static/

│   ├── 📜 index.html

│   ├── 📜 script.js

│   ├── 📜 styles.css

│   └── 📂 img/

│       ├── 📜 comestibles.jpg

│       ├── 📜 comestibles2.jpeg

│       ├── 📜 hongoclass.jpg

│       ├── 📜 mush.png

│       ├── 📜 mush1.png

│       ├── 📜 mush2.png

│       ├── 📜 mushl.png

│       ├── 📜 mushlogo.png

│       ├── 📜 poison.jpg

│       ├── 📜 setas.jpg

│       ├── 📜 taxonomia.jpg

│       └── 📜 veneno.png

└── 📂 tests/

    ├── 📜 conftest.py

    ├── 📜 test_main.py

    └── 📜 test_main_mocked.py
```

## 🏗️ Architecture Diagram

<div align="center">
  <img src="https://res.cloudinary.com/diowtsfaq/image/upload/v1747050292/Capture_nshpys.png" alt="Descripción de la imagen" width="900" height="450">
</div>

## ⚙️ Installation and Usage

### 1️⃣ Clone the repository

```bash
git clone [https://github.com/Bootcamp-IA-P4/mushrooms_e1](https://github.com/Bootcamp-IA-P4/mushrooms_e1)
cd mushrooms_e1
```

### 2️⃣ Create and activate the virtual environment

```bash
python -m venv .venv
source .venv/bin/activate   # On Linux/MacOS
.venv\Scripts\activate     # On Windows
```

### 3️⃣ Install dependencies

```bash
pip install -r requirements.txt
```

### 4️⃣ Run the code

```bash
jupyter notebook eda/eda.ipynb
```

### 5️⃣ Run app

```bash
uvicorn api.main:app --reload
```

### 6️⃣ Run test

```bash
pytest
```

## 🚀 Deployment

- The model can be tested on render, with the following link: [Proyecto Equipo 1](https://mushrooms-e1.onrender.com/)

## 🧑‍💻 Collaborators

This project was developed by the following contributors:

- [Andrea Alonso](https://www.linkedin.com/in/andreaalonsocor/)
- [César Mercado](https://www.linkedin.com/in/cesarmercadohernandez/)
- [Alejandro Rajado](https://www.linkedin.com/in/alejandro-rajado-martín/)
- [Vada Velázquez](https://www.linkedin.com/in/vadavelazquez/)
