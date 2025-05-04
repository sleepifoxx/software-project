# Hướng dẫn cài đặt và chạy dự án

Dự án này bao gồm hai phần chính:
- Backend: FastAPI (Python)
- Frontend: Next.js (React)

## Yêu cầu hệ thống
- Docker
- Docker Compose

## Cài đặt và chạy dự án

### Cách 1: Sử dụng Docker Compose (Khuyến nghị)

1. Clone repository:
```bash
git clone [URL_REPOSITORY]
cd [TÊN_THƯ_MỤC]
```

2. Chạy dự án:
```bash
docker-compose up --build
```

3. Truy cập ứng dụng:
- Frontend: http://localhost:3000
- Backend API Documentation: http://localhost:8000/docs
- Admin login: http://localhost:3000/admin/login (default account: abc@gmail.com|12345)
- Admin dashboard: http://localhost:3000/admin/dashboard



### Cách 2: Chạy riêng lẻ từng service

#### Backend
1. Vào thư mục backend:
```bash
cd backend
```

2. Cài đặt dependencies:
```bash
pip install -r requirements.txt
```

3. Chạy server:
```bash
uvicorn api:app --reload
```

#### Frontend
1. Vào thư mục frontend:
```bash
cd frontend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Chạy development server:
```bash
npm run dev
```

## Cấu trúc dự án

```
.
├── backend/           # Backend FastAPI
│   ├── api.py        # API endpoints
│   ├── models/       # Database models
│   ├── database.py   # Database configuration
│   └── requirements.txt
│
├── frontend/         # Frontend Next.js
│   ├── src/          # Source code
│   ├── public/       # Static files
│   └── package.json
│
└── docker-compose.yml
```

## Lưu ý
- Khi sử dụng Docker, các thay đổi trong code sẽ được tự động cập nhật nhờ volume mounts
- Backend chạy trên cổng 8000
- Frontend chạy trên cổng 3000
- API URL mặc định được cấu hình trong frontend là http://localhost:8000

## Hỗ trợ
Nếu bạn gặp vấn đề trong quá trình cài đặt hoặc chạy dự án, vui lòng tạo issue trên repository.
