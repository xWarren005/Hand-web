from flask import Flask, render_template, request, jsonify
import cv2
import mediapipe as mp
import numpy as np
import pickle
import base64

app = Flask(__name__)

# 1. Load Model đã train
model_dict = pickle.load(open('./model/model.p', 'rb')) # Đảm bảo đường dẫn đúng
model = model_dict['model']

# 2. Khởi tạo MediaPipe
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=True, min_detection_confidence=0.3)

# 3. Từ điển nhãn
labels_dict = {0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'H', 8: 'I', 9: 'J',
               10: 'K', 11: 'L', 12: 'M', 13: 'N', 14: 'O', 15: 'P', 16: 'Q', 17: 'R', 18: 'S',
               19: 'T', 20: 'U', 21: 'V', 22: 'W', 23: 'X', 24: 'Y', 25: 'Z', 26: '0', 27: '1',
               28: '2', 29: '3', 30: '4', 31: '5', 32: '6', 33: '7', 34: '8', 35: '9'}

@app.route('/')
def index():
    # Render giao diện web từ file templates/index.html
    return render_template('index.html')

@app.route('/hdsd')
def hdsd():
    # Render trang Hướng Dẫn Sử Dụng từ file templates/HDSD.html
    return render_template('HDSD.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Lấy ảnh định dạng base64 từ request của frontend
        data = request.json['image']
        
        # Giải mã ảnh base64 thành mảng numpy để cv2 đọc được
        img_data = base64.b64decode(data.split(',')[1])
        np_arr = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(frame_rgb)
        
        predicted_character = None
        
        # Xử lý logic MediaPipe y hệt file inference_classifier.py
        if results.multi_hand_landmarks:
            data_aux = []
            x_ = []
            y_ = []
            
            # Lấy bàn tay đầu tiên để tránh lỗi mảng data_aux bị dài gấp đôi nếu có 2 tay
            hand_landmarks = results.multi_hand_landmarks[0] 
            
            for i in range(len(hand_landmarks.landmark)):
                x = hand_landmarks.landmark[i].x
                y = hand_landmarks.landmark[i].y
                x_.append(x)
                y_.append(y)

            for i in range(len(hand_landmarks.landmark)):
                x = hand_landmarks.landmark[i].x
                y = hand_landmarks.landmark[i].y
                data_aux.append(x - min(x_))
                data_aux.append(y - min(y_))

            # Dự đoán
            prediction = model.predict([np.asarray(data_aux)])
            predicted_character = labels_dict[int(prediction[0])]

        return jsonify({'prediction': predicted_character})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Chạy server ở cổng 5000
    app.run(debug=True, host='0.0.0.0', port=5000)