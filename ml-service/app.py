from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import joblib
import numpy as np
import json
import os

# ─── Create FastAPI App ───────────────────────────
app = FastAPI(
    title="Fraud Detection ML API",
    description="REST API for AI-based fraud detection",
    version="2.0.0"
)

# ─── CORS Middleware ──────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Load ML Model ────────────────────────────────
print("Loading ML model...")

MODEL_PATH    = "model/fraud_model.pkl"
SCALER_PATH   = "model/scaler.pkl"
FEATURES_PATH = "model/feature_names.pkl"
STATS_PATH    = "model/model_stats.json"

model         = joblib.load(MODEL_PATH)
scaler        = joblib.load(SCALER_PATH)
feature_names = joblib.load(FEATURES_PATH)   # exact ordered list from training

with open(STATS_PATH, "r") as f:
    model_stats = json.load(f)

# ── Optimal threshold from training (beats default 0.5 for fraud recall) ──
FRAUD_THRESHOLD = model_stats.get("optimal_threshold", 0.5)
print(f"✅ ML Model loaded  |  fraud threshold = {FRAUD_THRESHOLD}")
print(f"   Feature order   : {feature_names}")

# ─── Request Schema ───────────────────────────────
class TransactionRequest(BaseModel):
    # Human-readable fields (stored/logged but NOT fed to the model)
    transaction_type:    Optional[str]   = None
    merchant_category:   Optional[str]   = None
    hour_of_day:         Optional[int]   = None
    day_of_week:         Optional[int]   = None

    # ── Core model inputs ──────────────────────────
    # Amount must be the RAW dollar value — the API scales it internally
    amount: float

    # V1-V28 PCA-transformed features from the creditcard dataset
    v1:  Optional[float] = 0.0
    v2:  Optional[float] = 0.0
    v3:  Optional[float] = 0.0
    v4:  Optional[float] = 0.0
    v5:  Optional[float] = 0.0
    v6:  Optional[float] = 0.0
    v7:  Optional[float] = 0.0
    v8:  Optional[float] = 0.0
    v9:  Optional[float] = 0.0
    v10: Optional[float] = 0.0
    v11: Optional[float] = 0.0
    v12: Optional[float] = 0.0
    v13: Optional[float] = 0.0
    v14: Optional[float] = 0.0
    v15: Optional[float] = 0.0
    v16: Optional[float] = 0.0
    v17: Optional[float] = 0.0
    v18: Optional[float] = 0.0
    v19: Optional[float] = 0.0
    v20: Optional[float] = 0.0
    v21: Optional[float] = 0.0
    v22: Optional[float] = 0.0
    v23: Optional[float] = 0.0
    v24: Optional[float] = 0.0
    v25: Optional[float] = 0.0
    v26: Optional[float] = 0.0
    v27: Optional[float] = 0.0
    v28: Optional[float] = 0.0

# ─── Helper: Build Feature Array ──────────────────
def build_features(tx: TransactionRequest) -> np.ndarray:
    """
    Build the feature vector in the EXACT same order as training.

    Training feature order (saved in feature_names.pkl):
        ['Amount', 'V1', 'V2', ..., 'V28']

    Key fix vs old code
    -------------------
    Old code scaled `amount` then put it first — that was correct but
    hidden bugs crept in when training scaled Amount in-place before the
    split, causing the scaler to be fit on the full dataset.  The new
    training script fits the scaler only on the train split, so the
    scaler here receives a raw dollar value and returns a correctly
    normalised value.
    """
    # Scale the raw dollar amount using the saved StandardScaler
    scaled_amount = float(scaler.transform([[tx.amount]])[0][0])

    # Build dict matching training column names exactly
    feature_dict = {
        "Amount": scaled_amount,
        "V1" : tx.v1,  "V2" : tx.v2,  "V3" : tx.v3,  "V4" : tx.v4,
        "V5" : tx.v5,  "V6" : tx.v6,  "V7" : tx.v7,  "V8" : tx.v8,
        "V9" : tx.v9,  "V10": tx.v10, "V11": tx.v11, "V12": tx.v12,
        "V13": tx.v13, "V14": tx.v14, "V15": tx.v15, "V16": tx.v16,
        "V17": tx.v17, "V18": tx.v18, "V19": tx.v19, "V20": tx.v20,
        "V21": tx.v21, "V22": tx.v22, "V23": tx.v23, "V24": tx.v24,
        "V25": tx.v25, "V26": tx.v26, "V27": tx.v27, "V28": tx.v28,
    }

    # Follow the exact order the model was trained on
    ordered = [feature_dict[col] for col in feature_names]
    return np.array(ordered, dtype=np.float64).reshape(1, -1)

# ─── Helper: Risk Level ───────────────────────────
def get_risk_level(prob: float) -> str:
    if prob >= 0.8:   return "critical"
    elif prob >= 0.6: return "high"
    elif prob >= 0.4: return "medium"
    elif prob >= 0.2: return "low"
    else:             return "safe"

# ─── ROUTES ───────────────────────────────────────

@app.get("/")
def health_check():
    return {
        "status" : "running",
        "message": "Fraud Detection ML API is running ✅",
        "model"  : "Random Forest v2",
        "version": "2.0.0",
        "fraud_threshold": FRAUD_THRESHOLD
    }

# ─── Debug Route (remove in production) ───────────
@app.post("/api/debug")
def debug_features(transaction: TransactionRequest):
    """Returns the raw feature vector sent to the model — helpful for diagnosing wrong predictions."""
    features = build_features(transaction)
    fraud_prob = float(model.predict_proba(features)[0][1])
    return {
        "feature_names"     : feature_names,
        "feature_values"    : features[0].tolist(),
        "raw_fraud_prob"    : round(fraud_prob * 100, 4),
        "threshold_used"    : FRAUD_THRESHOLD,
        "would_flag_fraud"  : fraud_prob >= FRAUD_THRESHOLD,
    }

# ─── Predict Fraud ────────────────────────────────
@app.post("/api/predict")
def predict_fraud(transaction: TransactionRequest):
    try:
        features = build_features(transaction)

        # Raw probability from the forest
        fraud_prob       = float(model.predict_proba(features)[0][1])
        fraud_percentage = round(fraud_prob * 100, 2)
        risk_level       = get_risk_level(fraud_prob)

        # Use optimal threshold (NOT hard-coded 0.5)
        is_fraud = fraud_prob >= FRAUD_THRESHOLD

        print(f"[predict] amount={transaction.amount}  "
              f"prob={fraud_percentage}%  "
              f"threshold={FRAUD_THRESHOLD}  "
              f"result={'FRAUD ⚠️' if is_fraud else 'NORMAL ✅'}")

        return {
            "success": True,
            "prediction": {
                "is_fraud"         : is_fraud,
                "fraud_probability": fraud_percentage,
                "risk_level"       : risk_level,
                "status"           : "fraud" if is_fraud else "normal",
                "message"          : "⚠️ Fraudulent transaction detected!" if is_fraud
                                     else "✅ Transaction appears normal"
            }
        }

    except Exception as e:
        print(f"❌ Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# ─── Get Model Stats ──────────────────────────────
@app.get("/api/stats")
def get_model_stats():
    return {
        "success": True,
        "stats"  : model_stats
    }

# ─── Batch Predict ────────────────────────────────
@app.post("/api/predict/batch")
def predict_batch(transactions: list[TransactionRequest]):
    try:
        results = []
        for tx in transactions:
            features         = build_features(tx)
            fraud_prob       = float(model.predict_proba(features)[0][1])
            fraud_percentage = round(fraud_prob * 100, 2)
            risk_level       = get_risk_level(fraud_prob)
            is_fraud         = fraud_prob >= FRAUD_THRESHOLD

            results.append({
                "is_fraud"         : is_fraud,
                "fraud_probability": fraud_percentage,
                "risk_level"       : risk_level,
                "status"           : "fraud" if is_fraud else "normal"
            })

        return {
            "success"    : True,
            "total"      : len(results),
            "fraud_count": sum(1 for r in results if r["is_fraud"]),
            "results"    : results
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")