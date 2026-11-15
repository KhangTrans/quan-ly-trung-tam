# Frontend Skeleton - React + Vite + TypeScript

Khung dự án Frontend cơ bản cho hệ thống Trung tâm Nhật ngữ Minh Tú (`minhtucenter.nihongo`).

---

## 📁 Cấu trúc khung dự án (Skeleton)

```text
minhtucenter.nihongo/
├── src/
│   ├── assets/             # Hình ảnh, icons, static assets
│   ├── components/         # Chứa các UI Components tái sử dụng (.gitkeep)
│   ├── hooks/              # Chứa các React Custom Hooks (.gitkeep)
│   ├── layouts/            # Chứa các Layouts tổng thể (MainLayout.tsx)
│   ├── pages/              # Chứa các màn hình/trang giao diện (HomePage, NotFoundPage)
│   ├── routes/             # Cấu hình định tuyến Router (routes/index.tsx)
│   ├── services/           # Cấu hình gọi API Axios Client (services/api.ts)
│   ├── types/              # Khai báo TypeScript types / interfaces chung
│   ├── utils/              # Chứa các hàm tiện ích dùng chung (.gitkeep)
│   ├── App.tsx             # Component Root tích hợp Router
│   ├── index.css           # Cấu hình Tailwind CSS v4
│   └── main.tsx            # Entry point của ứng dụng
├── .env & .env.example     # Biến môi trường kết nối API
├── vite.config.ts          # Thiết lập alias '@' -> 'src' và port 3000
├── tsconfig.json           # Cấu hình TypeScript
└── package.json            # Scripts & dependencies
```

---

## 🚀 Hướng dẫn khởi chạy

```bash
# 1. Cài đặt thư viện (nếu chưa cài)
npm install

# 2. Khởi chạy môi trường phát triển (Dev server)
npm run dev

# 3. Kiểm tra build sản phẩm
npm run build
```
Mặc định ứng dụng chạy tại: **http://localhost:3000**
