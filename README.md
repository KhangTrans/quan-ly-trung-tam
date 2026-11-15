# Minh Tu Center - Frontend Web App (minhtucenter.nihongo)

Giao diện Quản lý Đào tạo, Học vụ & Hồ sơ Du học – Trung tâm Nhật ngữ Minh Tú (MTCenter).

Được xây dựng với **React (v19)**, **Vite**, **TypeScript**, **Tailwind CSS (v4)**, **Lucide Icons**, **React Router (v7)** và **Axios**, đồng bộ hoàn toàn với backend API `minhtucenter-api`.

---

## 📁 Cấu trúc thư mục

```text
minhtucenter.nihongo/
├── public/                 # Static assets, favicon, logo
├── src/
│   ├── assets/             # Hình ảnh, icons cục bộ
│   ├── components/         # Các UI components tái sử dụng
│   │   ├── Badge.tsx       # Huy hiệu phân loại trình độ JLPT & trạng thái
│   │   ├── Modal.tsx       # Hộp thoại popup (thêm khóa học, xác nhận...)
│   │   ├── Navbar.tsx      # Thanh điều hướng trên cùng (tìm kiếm, thông báo, tài khoản)
│   │   ├── ProtectedRoute.tsx # Kiểm tra trạng thái đăng nhập bảo vệ routes
│   │   ├── Sidebar.tsx     # Menu điều hướng chính theo thương hiệu MTCenter
│   │   └── StatCard.tsx    # Thẻ thống kê số liệu tổng quan
│   ├── context/
│   │   └── AuthContext.tsx # Quản lý trạng thái người dùng & phiên làm việc
│   ├── layouts/
│   │   ├── AuthLayout.tsx  # Layout màn hình Đăng nhập / Đăng ký
│   │   └── DashboardLayout.tsx # Layout giao diện chính (Sidebar + Header + Content)
│   ├── pages/
│   │   ├── CoursesPage.tsx # Quản lý khóa học (N5 - N1, Kaiwa), lọc & thêm mới
│   │   ├── DashboardPage.tsx # Tổng quan hoạt động đào tạo, biểu đồ tỷ lệ JLPT
│   │   ├── EnrollmentsPage.tsx # Quản lý ghi danh, công nợ & đóng học phí
│   │   ├── LoginPage.tsx   # Đăng nhập hệ thống (kèm tài khoản mẫu)
│   │   ├── NotFoundPage.tsx# Trang lỗi 404
│   │   └── PlaceholderPage.tsx # Các phân hệ mở rộng theo lộ trình
│   ├── services/
│   │   ├── api.ts          # Axios client với Interceptors & gắn Bearer Token
│   │   ├── auth.service.ts # API đăng nhập, đăng ký, lấy thông tin cá nhân
│   │   ├── course.service.ts # API danh sách, tạo mới, chỉnh sửa khóa học
│   │   └── enrollment.service.ts # API ghi danh và cập nhật học phí
│   ├── types/
│   │   └── index.ts        # Định nghĩa kiểu dữ liệu TypeScript đồng bộ với Backend
│   ├── App.tsx             # Cấu hình Router & Provider
│   ├── index.css           # Cấu hình Tailwind CSS v4 & theme
│   └── main.tsx            # Entry point của ứng dụng
├── .env.example            # Mẫu biến môi trường
├── .env                    # Biến môi trường cục bộ
├── package.json            # Scripts & thư viện phụ thuộc
├── tsconfig.json           # Cấu hình TypeScript
└── vite.config.ts          # Cấu hình Vite & Tailwind CSS plugin
```

---

## 🚀 Hướng dẫn khởi chạy

### 1. Cài đặt các gói thư viện
```bash
cd minhtucenter.nihongo
npm install
```

### 2. Thiết lập biến môi trường
Kiểm tra file `.env` (mặc định đã kết nối tới Backend API tại cổng 5000):
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Trung Tâm Nhật Ngữ Minh Tú
```

### 3. Chạy môi trường phát triển (Development)
```bash
npm run dev
```
Ứng dụng sẽ chạy tại: **http://localhost:3000** (khớp với cấu hình CORS của Backend).

### 4. Build sản phẩm (Production)
```bash
npm run build
```

---

## 🔑 Tài khoản đăng nhập Demo
Bạn có thể sử dụng tài khoản khởi tạo sẵn từ bộ dữ liệu mẫu (seed) của backend:
* **Email:** `admin@minhtucenter.com`
* **Mật khẩu:** `Password@123`
*(Giao diện trang Login đã tích hợp sẵn thông tin tài khoản mẫu để đăng nhập nhanh 1 chạm).*
