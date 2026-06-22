import os
import pickle
import mediapipe as mp
import cv2

# ── Cấu hình đường dẫn ───────────────────────────────────────────────────────
# File này nằm tại: D:\AI\hand-web\training\create_dataset.py
# Ảnh dữ liệu:      D:\AI\hand-web\training\data\<nhãn>\*.jpg
# Output pickle:    D:\AI\hand-web\model\data.pickle

BASE_DIR  = os.path.dirname(os.path.abspath(__file__))          # .../training
DATA_DIR  = os.path.join(BASE_DIR, 'data')                      # .../training/data
MODEL_DIR = os.path.join(BASE_DIR, '..', 'model')               # .../model
os.makedirs(MODEL_DIR, exist_ok=True)

OUTPUT_PICKLE = os.path.join(MODEL_DIR, 'data.pickle')

# ── Khởi tạo MediaPipe Hands ──────────────────────────────────────────────────
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=True, min_detection_confidence=0.3)

data   = []
labels = []
skipped = 0

print(f"Đọc dữ liệu từ: {DATA_DIR}")
print(f"Sẽ lưu pickle vào: {OUTPUT_PICKLE}\n")

# ── Duyệt từng thư mục nhãn ──────────────────────────────────────────────────
for dir_ in sorted(os.listdir(DATA_DIR)):
    dir_path = os.path.join(DATA_DIR, dir_)
    if not os.path.isdir(dir_path):
        continue

    img_files = [f for f in os.listdir(dir_path)
                 if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))]
    ok_count = 0

    for img_name in img_files:
        data_aux = []
        x_ = []
        y_ = []

        img = cv2.imread(os.path.join(dir_path, img_name))
        if img is None:
            skipped += 1
            continue

        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = hands.process(img_rgb)

        if not results.multi_hand_landmarks:
            skipped += 1
            continue

        # Chỉ lấy bàn tay đầu tiên
        hand_landmarks = results.multi_hand_landmarks[0]

        for lm in hand_landmarks.landmark:
            x_.append(lm.x)
            y_.append(lm.y)

        # Chuẩn hóa: trừ min để bất biến với vị trí tay trên camera
        min_x, min_y = min(x_), min(y_)
        for lm in hand_landmarks.landmark:
            data_aux.append(lm.x - min_x)
            data_aux.append(lm.y - min_y)

        # Chỉ lưu nếu vector đủ 42 chiều (21 điểm × 2)
        if len(data_aux) == 42:
            data.append(data_aux)
            labels.append(dir_)
            ok_count += 1
        else:
            skipped += 1

    print(f"  Nhãn [{dir_:>3}]: {ok_count:>4} mẫu hợp lệ / {len(img_files)} ảnh")

# ── Lưu kết quả ──────────────────────────────────────────────────────────────
with open(OUTPUT_PICKLE, 'wb') as f:
    pickle.dump({'data': data, 'labels': labels}, f)

print(f"\n✓ Hoàn tất!")
print(f"  Tổng mẫu hợp lệ : {len(data)}")
print(f"  Số nhãn          : {len(set(labels))}")
print(f"  Bỏ qua           : {skipped} ảnh (không phát hiện tay)")
print(f"  Đã lưu pickle    : {OUTPUT_PICKLE}")