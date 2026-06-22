thực hiện theo các bước sau: 
1. download python version 3.9.9 ( nhớ click add to path)
2. tạo môi trường ảo py3.9:
   - vào terminal gõ : python -3.9 -m venv venv
   - kích hoạt môi trường ảo: .\venv\Scripts\activate
   - install các thư viện cần thiết: pip install opencv-python mediapipe numpy scikit-learn flask
   - chuyển đổi mediapip về version 0.10.9 : pip install mediapipe==0.10.9
3. chạy lần lượt các file: create_dataset.py -> train_classifier.py->app.py
4. truy cập http://localhost:5000 và test
