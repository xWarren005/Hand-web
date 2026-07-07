import os
import cv2

# Thư mục lưu dữ liệu
DATA_DIR = './data'

if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# Số lớp và số ảnh mỗi lớp
number_of_classes = 36
dataset_size = 100

# Mở webcam
cap = cv2.VideoCapture(0)

for j in range(number_of_classes):

    class_dir = os.path.join(DATA_DIR, str(j))

    if not os.path.exists(class_dir):
        os.makedirs(class_dir)

    print(f'Collecting data for class {j}')

    # Chờ người dùng sẵn sàng
    while True:
        ret, frame = cap.read()

        if not ret:
            continue

        # Lật ảnh để không bị mirror
        frame = cv2.flip(frame, 1)

        cv2.putText(
            frame,
            'Ready? Press Q',
            (50, 50),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2,
            cv2.LINE_AA
        )

        cv2.imshow('frame', frame)

        if cv2.waitKey(25) & 0xFF == ord('q'):
            break

    # Chụp ảnh cho lớp hiện tại
    counter = 0

    while counter < dataset_size:
        ret, frame = cap.read()

        if not ret:
            continue

        # Lật ảnh
        frame = cv2.flip(frame, 1)

        cv2.putText(
            frame,
            f'Class: {j}  Image: {counter + 1}/{dataset_size}',
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 255, 0),
            2
        )

        cv2.imshow('frame', frame)

        # Lưu ảnh
        img_path = os.path.join(class_dir, f'{counter}.jpg')
        cv2.imwrite(img_path, frame)

        counter += 1

        # Delay để tránh chụp quá nhanh
        cv2.waitKey(100)

print("Finished collecting data!")

cap.release()
cv2.destroyAllWindows()
