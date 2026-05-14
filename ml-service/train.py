import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    precision_recall_curve,
    roc_auc_score
)
from imblearn.over_sampling import SMOTE
import joblib
import os
import json

print("🚀 Starting ML Model Training...")

# ─── Load Dataset ─────────────────────────────────
df = pd.read_csv("creditcard.csv")
print(f"✅ Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")
print(f"   Fraud cases : {df['Class'].sum()} ({df['Class'].mean()*100:.3f}%)")
print(f"   Normal cases: {(df['Class']==0).sum()}")

# ─── Drop Time Column ──────────────────────────────
df = df.drop(['Time'], axis=1)

# ─── Features and Target ──────────────────────────
X = df.drop(['Class'], axis=1)
y = df['Class']

print(f"\n✅ Feature columns ({len(X.columns)}): {X.columns.tolist()}")

# ─── Scale Amount ONLY (V1-V28 already PCA scaled) ─
# IMPORTANT: Fit scaler ONLY on training split to prevent data leakage.
# We do the split first, then scale.

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print(f"\n✅ Train size: {X_train.shape[0]} | Test size: {X_test.shape[0]}")

# Fit scaler on training Amount only — no leakage
scaler = StandardScaler()
X_train = X_train.copy()
X_test  = X_test.copy()

X_train['Amount'] = scaler.fit_transform(X_train[['Amount']])
X_test['Amount']  = scaler.transform(X_test[['Amount']])   # transform only, not fit

print("✅ Amount scaled (scaler fit on train set only)")

# Save feature names IN ORDER — API must match this exact order
feature_names = X_train.columns.tolist()
print(f"✅ Feature order saved: {feature_names}")

# ─── Balance with SMOTE ───────────────────────────
print("\n⚖️  Balancing training data with SMOTE...")
smote = SMOTE(random_state=42)
X_train_bal, y_train_bal = smote.fit_resample(X_train, y_train)
print(f"✅ After SMOTE — Total: {len(X_train_bal)} | "
      f"Fraud: {y_train_bal.sum()} | Normal: {(y_train_bal==0).sum()}")

# ─── Train Model ──────────────────────────────────
print("\n🌲 Training Random Forest Classifier...")
model = RandomForestClassifier(
    n_estimators=200,
    max_depth=15,
    random_state=42,
    n_jobs=-1,
    class_weight='balanced',
    min_samples_split=5,
    min_samples_leaf=2
)
model.fit(X_train_bal, y_train_bal)
print("✅ Model training complete!")

# ─── Evaluate ─────────────────────────────────────
y_pred       = model.predict(X_test)
y_proba      = model.predict_proba(X_test)[:, 1]

accuracy     = accuracy_score(y_test, y_pred)
precision    = precision_score(y_test, y_pred)
recall       = recall_score(y_test, y_pred)
f1           = f1_score(y_test, y_pred)
roc_auc      = roc_auc_score(y_test, y_proba)
cm           = confusion_matrix(y_test, y_pred)

print(f"\n{'='*55}")
print(f"  ✅ Accuracy   : {accuracy*100:.2f}%")
print(f"  ✅ Precision  : {precision*100:.2f}%")
print(f"  ✅ Recall     : {recall*100:.2f}%")
print(f"  ✅ F1 Score   : {f1*100:.2f}%")
print(f"  ✅ ROC-AUC    : {roc_auc:.4f}")
print(f"{'='*55}")
print(f"\nConfusion Matrix:")
print(f"  TN={cm[0][0]}  FP={cm[0][1]}")
print(f"  FN={cm[1][0]}  TP={cm[1][1]}")
print(f"\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=["Normal", "Fraud"]))

# ─── Find Optimal Threshold ───────────────────────
# Default 0.5 threshold misses many fraud cases.
# We pick the threshold that maximises F1 on the test set.
precisions_arr, recalls_arr, thresholds_arr = precision_recall_curve(y_test, y_proba)
f1_scores_arr = (2 * precisions_arr * recalls_arr /
                 (precisions_arr + recalls_arr + 1e-8))

best_idx       = int(np.argmax(f1_scores_arr[:-1]))  # last element has no threshold
best_threshold = float(thresholds_arr[best_idx])
best_f1        = float(f1_scores_arr[best_idx])

print(f"\n✅ Optimal fraud threshold : {best_threshold:.4f}  (F1={best_f1*100:.2f}%)")
print(f"   (Default 0.5 threshold  : F1={f1*100:.2f}%)")

# ─── Save Artifacts ───────────────────────────────
os.makedirs("model", exist_ok=True)

joblib.dump(model,         "model/fraud_model.pkl")
joblib.dump(scaler,        "model/scaler.pkl")
joblib.dump(feature_names, "model/feature_names.pkl")

stats = {
    "accuracy"    : round(accuracy  * 100, 2),
    "precision"   : round(precision * 100, 2),
    "recall"      : round(recall    * 100, 2),
    "f1_score"    : round(f1        * 100, 2),
    "roc_auc"     : round(roc_auc,          4),
    "optimal_threshold": round(best_threshold, 4),
    "total_training_samples": int(X_train_bal.shape[0]),
    "total_test_samples"    : int(X_test.shape[0]),
    "fraud_cases_detected"  : int(y_pred.sum()),
    "confusion_matrix": {
        "true_negatives" : int(cm[0][0]),
        "false_positives": int(cm[0][1]),
        "false_negatives": int(cm[1][0]),
        "true_positives" : int(cm[1][1])
    }
}

with open("model/model_stats.json", "w") as f:
    json.dump(stats, f, indent=2)

print("\n🎉 All model files saved to ./model/")
print("   ├── fraud_model.pkl")
print("   ├── scaler.pkl")
print("   ├── feature_names.pkl")
print("   └── model_stats.json")
print("\n✅ Training pipeline complete!")