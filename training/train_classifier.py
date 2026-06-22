import os
import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# ── Cấu hình đường dẫn ───────────────────────────────────────────────────────
# File này nằm tại: D:\AI\hand-web\training\train_classifier.py
# Đọc pickle từ:    D:\AI\hand-web\model\data.pickle
# Lưu model vào:    D:\AI\hand-web\model\model.p

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))         # .../training
MODEL_DIR  = os.path.join(BASE_DIR, '..', 'model')              # .../model
os.makedirs(MODEL_DIR, exist_ok=True)

INPUT_PICKLE  = os.path.join(MODEL_DIR, 'data.pickle')
OUTPUT_MODEL  = os.path.join(MODEL_DIR, 'model.p')

# ── 1. Tải dữ liệu ───────────────────────────────────────────────────────────
print(f"Đang tải dữ liệu từ: {INPUT_PICKLE}")

if not os.path.exists(INPUT_PICKLE):
    raise FileNotFoundError(
        f"Không tìm thấy '{INPUT_PICKLE}'.\n"
        "Hãy chạy create_dataset.py trước!"
    )

with open(INPUT_PICKLE, 'rb') as f:
    data_dict = pickle.load(f)

raw_data   = data_dict['data']
raw_labels = data_dict['labels']

# ── 2. Lọc mẫu hợp lệ (đúng 42 chiều) ───────────────────────────────────────
EXPECTED_LEN = 42   # 21 landmarks × (x + y)

data   = []
labels = []
skipped = 0

for sample, label in zip(raw_data, raw_labels):
    if len(sample) == EXPECTED_LEN:
        data.append(sample)
        labels.append(label)
    else:
        skipped += 1

if skipped:
    print(f"  Bỏ qua {skipped} mẫu có kích thước vector không đúng.")

data   = np.array(data)
labels = np.array(labels)

unique_labels = sorted(set(labels))
print(f"  Tổng mẫu hợp lệ : {len(data)}")
print(f"  Số nhãn          : {len(unique_labels)} → {unique_labels}\n")

# ── 3. Chia tập train / test (80 / 20) ───────────────────────────────────────
x_train, x_test, y_train, y_test = train_test_split(
    data, labels,
    test_size=0.2,
    shuffle=True,
    stratify=labels,
    random_state=42
)

print(f"Tập huấn luyện : {len(x_train)} mẫu")
print(f"Tập kiểm tra   : {len(x_test)} mẫu\n")

# ── 4. Huấn luyện Random Forest ──────────────────────────────────────────────
print("Bắt đầu huấn luyện Random Forest (100 cây)...")

model = RandomForestClassifier(
    n_estimators=100,
    max_depth=None,
    random_state=42,
    n_jobs=-1          # dùng toàn bộ CPU để tăng tốc
)
model.fit(x_train, y_train)
print("Huấn luyện hoàn tất!\n")

# ── 5. Đánh giá mô hình ──────────────────────────────────────────────────────
y_predict = model.predict(x_test)
score = accuracy_score(y_test, y_predict)
print(f"✓ Độ chính xác (Accuracy): {score * 100:.2f}%\n")
print("Chi tiết theo từng nhãn:")
print(classification_report(y_test, y_predict))

# ── 6. Lưu mô hình ───────────────────────────────────────────────────────────
with open(OUTPUT_MODEL, 'wb') as f:
    pickle.dump({'model': model}, f)

print(f"✓ Mô hình đã được lưu vào: {OUTPUT_MODEL}")
print("  Sẵn sàng dùng cho backend web!")