-- ====================================================================================================
-- HỆ THỐNG CƠ SỞ DỮ LIỆU QUẢN LÝ TRUNG TÂM TIẾNG NHẬT MINH TÚ (MINH TU CENTER NIHONGO)
-- FILE: db.sql (Được tạo tự động dựa trên cấu trúc MongoDB Schemas)
-- Đường dẫn: src/assets/db.sql
-- ====================================================================================================

-- // ====================================================================================================
-- // PHẦN 1: THIẾT LẬP CSDL VÀ BẢNG DANH MỤC TRUNG TÂM
-- // ====================================================================================================

-- // BẢNG 1: branches (Cơ sở & Chi nhánh đào tạo)
-- // Quản lý danh sách các cơ sở, chi nhánh đào tạo và văn phòng đại diện của trung tâm.
CREATE TABLE IF NOT EXISTS branches (
    id VARCHAR(36) PRIMARY KEY,                                 -- // Khóa chính định danh cơ sở (UUID/ObjectId)
    name VARCHAR(255) NOT NULL,                                 -- // Tên cơ sở/chi nhánh (VD: Cơ sở Nguyễn Văn Cừ - Ninh Kiều)
    code VARCHAR(50) NOT NULL UNIQUE,                           -- // Mã định danh chi nhánh viết hoa (VD: CT-NVC, CT-DHCT)
    address TEXT NOT NULL,                                      -- // Địa chỉ chi tiết nơi đặt cơ sở
    phone VARCHAR(20) NOT NULL,                                 -- // Số điện thoại hotline liên hệ của cơ sở
    email VARCHAR(100),                                         -- // Email liên hệ chính thức của cơ sở
    is_active BOOLEAN DEFAULT TRUE,                             -- // Trạng thái hoạt động (TRUE: Đang mở cửa tiếp nhận, FALSE: Tạm ngưng)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,             -- // Thời điểm tạo bản ghi cơ sở
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- // Thời điểm cập nhật thông tin lần cuối
);

-- // BẢNG 2: users (Tài khoản người dùng hệ thống)
-- // Quản lý toàn bộ tài khoản đăng nhập vào hệ thống gồm Admin, Nhân viên, Giáo viên và Học viên.
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,                                 -- // Khóa chính định danh tài khoản (UUID/ObjectId)
    name VARCHAR(100) NOT NULL,                                 -- // Họ và tên đầy đủ của người dùng
    email VARCHAR(150) NOT NULL UNIQUE,                         -- // Địa chỉ email đăng nhập (Duy nhất toàn hệ thống)
    password VARCHAR(255) NOT NULL,                             -- // Mật khẩu đã được mã hóa Bcrypt an toàn
    phone VARCHAR(20),                                          -- // Số điện thoại cá nhân
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('admin', 'staff', 'teacher', 'student')), -- // Vai trò: admin (Quản trị), staff (Nhân viên), teacher (Giáo viên), student (Học viên)
    branch_id VARCHAR(36),                                      -- // Cơ sở làm việc trực thuộc (Dành cho nhân viên, giáo viên)
    salary_rate_per_hour DECIMAL(12, 2) DEFAULT 0,              -- // Mức thù lao giảng dạy tính theo mỗi giờ dạy của giáo viên (VNĐ)
    is_active BOOLEAN DEFAULT TRUE,                             -- // Trạng thái tài khoản (TRUE: Đang hoạt động, FALSE: Đang bị khóa)
    is_email_verified BOOLEAN DEFAULT FALSE,                    -- // Đã xác thực email đăng ký qua OTP chưa
    google_id VARCHAR(100),                                     -- // ID định danh nếu đăng nhập qua Google OAuth
    firebase_uid VARCHAR(100),                                  -- // UID trên Firebase Authentication
    avatar TEXT,                                                -- // Đường dẫn ảnh đại diện (Lưu trữ trên Cloudinary)
    token_version INT DEFAULT 0,                                -- // Phiên bản token dùng để thu hồi session đăng nhập hàng loạt khi đổi mật khẩu
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,             -- // Thời điểm tạo tài khoản
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- // Thời điểm cập nhật tài khoản
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
);

-- // BẢNG 3: classrooms (Phòng học & Cơ sở vật chất)
-- // Quản lý danh sách các phòng học vật lý tại từng chi nhánh, sức chứa tối đa và trang thiết bị.
CREATE TABLE IF NOT EXISTS classrooms (
    id VARCHAR(36) PRIMARY KEY,                                 -- // Khóa chính định danh phòng học
    branch_id VARCHAR(36) NOT NULL,                             -- // Thuộc cơ sở/chi nhánh nào
    room_code VARCHAR(50) NOT NULL,                             -- // Mã phòng học viết hoa (VD: LAB-01, ROOM-201)
    capacity INT NOT NULL DEFAULT 25,                           -- // Sức chứa tối đa số lượng học viên trong một phòng
    facilities JSON,                                            -- // Danh sách trang thiết bị trong phòng học (Bảng từ, Máy lạnh, Loa nghe...)
    is_active BOOLEAN DEFAULT TRUE,                             -- // Trạng thái phòng học (TRUE: Sẵn sàng sử dụng, FALSE: Đang bảo trì/tạm ngưng)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,             -- // Thời điểm tạo phòng
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- // Thời điểm cập nhật phòng
    UNIQUE (branch_id, room_code),                              -- // Ràng buộc: Trong cùng 1 chi nhánh không được trùng mã phòng
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

-- // BẢNG 4: shift_slots (Khung ca học chuẩn)
-- // Định nghĩa các ca học tiêu chuẩn của trung tâm chia theo buổi (Sáng, Chiều, Tối) phục vụ việc xếp lịch và tính công.
CREATE TABLE IF NOT EXISTS shift_slots (
    id VARCHAR(36) PRIMARY KEY,                                 -- // Khóa chính định danh ca học
    name VARCHAR(100) NOT NULL,                                 -- // Tên gọi ca học (VD: Ca Tối 1 (17:45 - 19:15))
    start_time VARCHAR(10) NOT NULL,                            -- // Giờ bắt đầu học (Định dạng HH:mm, VD: 17:45)
    end_time VARCHAR(10) NOT NULL,                              -- // Giờ kết thúc học (Định dạng HH:mm, VD: 19:15)
    period VARCHAR(20) NOT NULL DEFAULT 'evening' CHECK (period IN ('morning', 'afternoon', 'evening')), -- // Phân loại buổi: morning (Sáng), afternoon (Chiều), evening (Tối)
    is_active BOOLEAN DEFAULT TRUE,                             -- // Trạng thái áp dụng ca học này trong xếp lịch
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,             -- // Thời điểm tạo ca học
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- // Thời điểm cập nhật ca học
);

-- // ====================================================================================================
-- // PHẦN 2: QUẢN LÝ ĐÀO TẠO, KHÓA HỌC & LỚP HỌC
-- // ====================================================================================================

-- // BẢNG 5: courses (Khóa học tiếng Nhật)
-- // Quản lý danh mục các chương trình đào tạo của trung tâm từ sơ cấp đến nâng cao (N5 -> N1, Kaiwa).
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(36) PRIMARY KEY,                                 -- // Khóa chính định danh khóa học
    title VARCHAR(255) NOT NULL,                                -- // Tên khóa học (VD: Tiếng Nhật Sơ Cấp N5 K45)
    code VARCHAR(50) NOT NULL UNIQUE,                           -- // Mã định danh khóa học viết hoa (VD: JP-N5)
    level VARCHAR(20) NOT NULL CHECK (level IN ('N5', 'N4', 'N3', 'N2', 'N1', 'Kaiwa')), -- // Cấp độ JLPT tương ứng
    description TEXT,                                           -- // Giới thiệu chi tiết lộ trình và đầu ra của khóa học
    textbook VARCHAR(255) DEFAULT 'Minna no Nihongo I',         -- // Giáo trình chuẩn sử dụng giảng dạy
    total_sessions INT NOT NULL DEFAULT 45,                     -- // Tổng số buổi học trong toàn bộ khóa
    tuition_fee DECIMAL(12, 2) NOT NULL,                        -- // Học phí niêm yết chuẩn của khóa học (VNĐ)
    duration VARCHAR(50) DEFAULT '3 tháng',                     -- // Thời lượng đào tạo ước tính
    schedule VARCHAR(100),                                      -- // Khung ngày học gợi ý (VD: T2-4-6 hoặc T3-5-7)
    max_students INT DEFAULT 20,                                -- // Số lượng học viên tối đa khuyến nghị mỗi lớp
    start_date DATE,                                            -- // Ngày dự kiến mở lớp đầu tiên
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')), -- // Trạng thái khóa học
    is_active BOOLEAN DEFAULT TRUE,                             -- // Khóa học có đang được tuyển sinh mở lớp không
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,             -- // Thời điểm tạo khóa học
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- // Thời điểm cập nhật khóa học
);

-- // BẢNG 6: classes (Lớp học thực tế mở tại cơ sở)
-- // Lớp học cụ thể được mở tại một chi nhánh, gắn với khóa học, giáo viên đứng lớp chính, phòng học và ca học.
CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(36) PRIMARY KEY,                                 -- // Khóa chính định danh lớp học
    course_id VARCHAR(36) NOT NULL,                             -- // Thuộc chương trình khóa học nào
    branch_id VARCHAR(36) NOT NULL,                             -- // Tổ chức giảng dạy tại cơ sở/chi nhánh nào
    class_code VARCHAR(50) NOT NULL UNIQUE,                     -- // Mã lớp học viết hoa (VD: JP-N5-K45-CS1)
    name VARCHAR(255) NOT NULL,                                 -- // Tên hiển thị của lớp học
    primary_teacher_id VARCHAR(36) NOT NULL,                    -- // Giáo viên chủ nhiệm / đứng lớp chính
    default_classroom_id VARCHAR(36) NOT NULL,                  -- // Phòng học cố định mặc định của lớp
    days_of_week JSON NOT NULL,                                 -- // Mảng các ngày học trong tuần [2, 4, 6] (2: Thứ 2, ..., 8: Chủ Nhật)
    shift_slot_id VARCHAR(36) NOT NULL,                         -- // Ca học chuẩn áp dụng cho lớp
    start_date DATE NOT NULL,                                   -- // Ngày khai giảng chính thức
    end_date_expected DATE,                                     -- // Ngày dự kiến bế giảng hoàn thành khóa
    max_students INT DEFAULT 20,                                -- // Sĩ số tối đa của lớp học
    current_student_count INT DEFAULT 0,                        -- // Số lượng học viên hiện đang có mặt trong danh sách lớp
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')), -- // Trạng thái lớp học
    notes TEXT,                                                 -- // Ghi chú thêm về yêu cầu đặc biệt của lớp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,             -- // Thời điểm tạo lớp học
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- // Thời điểm cập nhật lớp học
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT,
    FOREIGN KEY (primary_teacher_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (default_classroom_id) REFERENCES classrooms(id) ON DELETE RESTRICT,
    FOREIGN KEY (shift_slot_id) REFERENCES shift_slots(id) ON DELETE RESTRICT
);

-- // BẢNG 7: class_schedules (Lịch học chi tiết từng buổi)
-- // Toàn bộ thời khóa biểu được tạo ra tự động cho từng buổi học cụ thể của lớp, phục vụ phát hiện trùng lịch giáo viên/phòng học.
CREATE TABLE IF NOT EXISTS class_schedules (
    id VARCHAR(36) PRIMARY KEY,                                 -- // Khóa chính định danh buổi học
    class_id VARCHAR(36) NOT NULL,                              -- // Thuộc lớp học nào
    session_number INT NOT NULL,                                -- // Thứ tự buổi học trong lộ trình (Buổi 1, 2, ..., 45)
    date DATE NOT NULL,                                         -- // Ngày diễn ra buổi học
    shift_slot_id VARCHAR(36) NOT NULL,                         -- // Khung ca học của buổi
    teacher_id VARCHAR(36) NOT NULL,                            -- // Giáo viên phụ trách giảng dạy buổi đó (Hỗ trợ dạy thay)
    classroom_id VARCHAR(36) NOT NULL,                          -- // Phòng học diễn ra buổi đó (Hỗ trợ chuyển phòng khi cần)
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled')), -- // Trạng thái buổi học
    is_holiday_substitute BOOLEAN DEFAULT FALSE,                -- // Đánh dấu nếu đây là buổi dạy bù do nghỉ lễ/sự cố
    notes TEXT,                                                 -- // Ghi chú dặn dò riêng cho buổi học này
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,             -- // Thời điểm tạo lịch buổi học
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- // Thời điểm cập nhật lịch buổi học
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (shift_slot_id) REFERENCES shift_slots(id) ON DELETE RESTRICT,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE RESTRICT
);

-- // ====================================================================================================
-- // PHẦN 3: HỌC VIÊN, GHI DANH & QUẢN LÝ HỌC VỤ
-- // ====================================================================================================

-- // BẢNG 8: students (Hồ sơ học viên)
-- // Quản lý lý lịch chi tiết học viên, liên hệ phụ huynh, trình độ đầu vào và mục tiêu học tập tiếng Nhật.
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(36) PRIMARY KEY,                                 -- // Khóa chính định danh học viên
    student_code VARCHAR(50) NOT NULL UNIQUE,                   -- // Mã học viên viết hoa (VD: HV-2026-001)
    user_id VARCHAR(36),                                        -- // Tài khoản đăng nhập hệ thống của học viên (nếu có)
    full_name VARCHAR(150) NOT NULL,                            -- // Họ và tên đầy đủ của học viên
    dob DATE,                                                   -- // Ngày tháng năm sinh
    gender VARCHAR(10) DEFAULT 'male' CHECK (gender IN ('male', 'female', 'other')), -- // Giới tính (Nam, Nữ, Khác)
    phone VARCHAR(20) NOT NULL,                                 -- // Số điện thoại liên lạc trực tiếp của học viên
    email VARCHAR(150),                                         -- // Địa chỉ email nhận thông báo của học viên
    address TEXT,                                               -- // Địa chỉ cư trú thường trú/tạm trú
    parent_name VARCHAR(150),                                   -- // Họ tên người thân/phụ huynh liên hệ khẩn cấp
    parent_relationship VARCHAR(50),                            -- // Mối quan hệ với học viên (Cha, Mẹ, Anh, Chị...)
    parent_phone VARCHAR(20),                                   -- // Số điện thoại liên hệ của phụ huynh
    input_level VARCHAR(50) DEFAULT 'Chưa biết tiếng Nhật',     -- // Trình độ tiếng Nhật khi mới vào trung tâm
    learning_objective TEXT,                                    -- // Mục tiêu học (Thi đỗ JLPT, Đi du học Nhật, Đi làm việc công ty Nhật...)
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'graduated', 'paused', 'dropped')), -- // Trạng thái học tập: active (Đang học), graduated (Đã tốt nghiệp), paused (Bảo lưu), dropped (Thôi học)
    notes TEXT,                                                 -- // Ghi chú đặc biệt về quá trình học của học viên
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,             -- // Thời điểm tạo hồ sơ học viên
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- // Thời điểm cập nhật hồ sơ
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- // BẢNG 9: enrollments (Đăng ký / Ghi danh vào lớp học)
-- // Ghi nhận học viên tham gia vào một lớp học cụ thể, theo dõi số buổi còn lại và tình trạng học phí.
CREATE TABLE IF NOT EXISTS enrollments (
    id VARCHAR(36) PRIMARY KEY,                                 -- // Khóa chính định danh lượt ghi danh
    student_id VARCHAR(36) NOT NULL,                            -- // Học viên tham gia
    class_id VARCHAR(36) NOT NULL,                              -- // Lớp học được ghi danh vào
    enrollment_date DATE DEFAULT CURRENT_TIMESTAMP,             -- // Ngày thực hiện thủ tục nhập học
    status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'reserved', 'transferred', 'dropped')), -- // Trạng thái: enrolled (Đang theo học), reserved (Bảo lưu), transferred (Đã chuyển lớp), dropped (Nghỉ học)
    remaining_sessions INT DEFAULT 0,                           -- // Số buổi học còn lại được quyền tham gia
    tuition_status VARCHAR(20) DEFAULT 'unpaid' CHECK (tuition_status IN ('unpaid', 'partially_paid', 'paid')), -- // Trạng thái học phí: unpaid (Chưa đóng), partially_paid (Đóng 1 phần), paid (Đã hoàn tất)
    notes TEXT,                                                 -- // Ghi chú lúc làm thủ tục ghi danh
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,             -- // Thời điểm tạo ghi danh
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- // Thời điểm cập nhật
    UNIQUE (student_id, class_id),                              -- // Mỗi học viên chỉ có 1 bản ghi ghi danh trên 1 lớp học
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE RESTRICT
);

-- // BẢNG 10: class_transfers (Bảo lưu, Chuyển lớp & Học bù)
-- // Lưu trữ toàn bộ lịch sử học viên xin bảo lưu khóa học, chuyển sang lớp khác hoặc sắp xếp học bù ở lớp khác.
CREATE TABLE IF NOT EXISTS class_transfers (
    id VARCHAR(36) PRIMARY KEY,                                 -- // Khóa chính định danh giao dịch học vụ
    enrollment_id VARCHAR(36) NOT NULL,                         -- // Hồ sơ ghi danh gốc bị tác động
    student_id VARCHAR(36) NOT NULL,                            -- // Học viên thực hiện thủ tục
    type VARCHAR(30) NOT NULL CHECK (type IN ('RESERVATION', 'CLASS_TRANSFER', 'MAKEUP_CLASS')), -- // Loại hình: RESERVATION (Bảo lưu), CLASS_TRANSFER (Chuyển lớp), MAKEUP_CLASS (Học bù)
    from_class_id VARCHAR(36) NOT NULL,                         -- // Lớp học hiện tại trước khi chuyển đổi/bảo lưu
    to_class_id VARCHAR(36),                                    -- // Lớp học chuyển đến (Bắt buộc nếu là CLASS_TRANSFER)
    target_schedule_id VARCHAR(36),                             -- // Buổi học cụ thể học bù (Nếu là MAKEUP_CLASS)
    remaining_sessions_at_event INT NOT NULL DEFAULT 0,         -- // Số buổi học còn tồn tại thời điểm bảo lưu/chuyển lớp
    reservation_expiry_date DATE,                               -- // Hạn chót bảo lưu (Thường tối đa 6 tháng kể từ ngày xin)
    reason TEXT NOT NULL,                                       -- // Lý do xin bảo lưu, đổi lớp hoặc học bù
    approved_by VARCHAR(36) NOT NULL,                           -- // Nhân viên hoặc Admin đã duyệt yêu cầu này
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,             -- // Thời điểm thực hiện thủ tục
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- // Thời điểm cập nhật
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (from_class_id) REFERENCES classes(id) ON DELETE RESTRICT,
    FOREIGN KEY (to_class_id) REFERENCES classes(id) ON DELETE RESTRICT,
    FOREIGN KEY (target_schedule_id) REFERENCES class_schedules(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- // ====================================================================================================
-- // PHẦN 4: ĐIỂM DANH, SỔ ĐẦU BÀI & ĐÁNH GIÁ HỌC TẬP
-- // ====================================================================================================

-- // BẢNG 11: attendances (Điểm danh từng buổi học)
-- // Lưu vết sự có mặt hay vắng mặt của học viên trong từng buổi học cụ thể.
CREATE TABLE IF NOT EXISTS attendances (
    id VARCHAR(36) PRIMARY KEY,                                 -- // Khóa chính điểm danh
    schedule_id VARCHAR(36) NOT NULL,                           -- // Buổi học diễn ra điểm danh
    class_id VARCHAR(36) NOT NULL,                              -- // Lớp học tương ứng
    student_id VARCHAR(36) NOT NULL,                            -- // Học viên được điểm danh
    status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'excused_absence', 'unexcused_absence', 'late')), -- // Trạng thái: present (Có mặt), excused_absence (Vắng có phép), unexcused_absence (Vắng không phép), late (Đi trễ)
    note TEXT,                                                  -- // Ghi chú lý do vắng hoặc số phút đi trễ
    marked_by VARCHAR(36) NOT NULL,                             -- // Giáo viên hoặc nhân viên thực hiện điểm danh
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,             -- // Thời điểm lưu kết quả điểm danh
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- // Thời điểm cập nhật
    UNIQUE (schedule_id, student_id),                           -- // Mỗi học viên chỉ có 1 bản ghi điểm danh trong 1 buổi học
    FOREIGN KEY (schedule_id) REFERENCES class_schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- // BẢNG 12: session_logs (Sổ đầu bài / Nhật ký buổi dạy)
-- // Sổ đầu bài điện tử ghi lại nội dung bài giảng, bài tập về nhà và nhận xét không khí học tập của giáo viên sau mỗi buổi.
CREATE TABLE IF NOT EXISTS session_logs (
    id VARCHAR(36) PRIMARY KEY,                                 -- // Khóa chính sổ đầu bài
    schedule_id VARCHAR(36) NOT NULL UNIQUE,                    -- // Gắn chặt với duy nhất 1 buổi học trong lịch trình
    class_id VARCHAR(36) NOT NULL,                              -- // Lớp học thực hiện buổi dạy
    teacher_id VARCHAR(36) NOT NULL,                            -- // Giáo viên thực hiện giảng dạy và ký sổ
    lesson_content TEXT NOT NULL,                               -- // Nội dung ngữ pháp, từ vựng và Kanji đã giảng trong buổi
    homework TEXT NOT NULL,                                     -- // Bài tập về nhà giao cho học viên
    class_atmosphere TEXT,                                      -- // Đánh giá thái độ và không khí học tập chung của lớp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,             -- // Thời điểm ghi sổ đầu bài
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- // Thời điểm cập nhật sổ đầu bài
    FOREIGN KEY (schedule_id) REFERENCES class_schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- // BẢNG 13: session_log_student_comments (Nhận xét riêng từng học viên trong buổi)
-- // Giáo viên đánh giá chi tiết mức độ phát âm, hiểu bài hoặc cần cải thiện của từng học viên trong buổi học.
CREATE TABLE IF NOT EXISTS session_log_student_comments (
    id VARCHAR(36) PRIMARY KEY,                                 -- // Khóa chính nhận xét học viên
    session_log_id VARCHAR(36) NOT NULL,                        -- // Thuộc sổ đầu bài của buổi học nào
    student_id VARCHAR(36) NOT NULL,                            -- // Học viên được nhận xét
    comment TEXT NOT NULL,                                      -- // Lời nhận xét chi tiết của giáo viên
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,             -- // Thời điểm tạo nhận xét
    FOREIGN KEY (session_log_id) REFERENCES session_logs(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- // BẢNG 14: exams (Kỳ thi, Kiểm tra định kỳ & Thi thử JLPT)
-- // Quản lý các đợt kiểm tra định kỳ (15p, 1 tiết, giữa kỳ, cuối khóa) và thi thử JLPT theo thang điểm chuẩn Nhật Bản.
CREATE TABLE IF NOT EXISTS exams (
    id VARCHAR(36) PRIMARY KEY,                                 -- // Khóa chính định danh kỳ thi
    class_id VARCHAR(36) NOT NULL,                              -- // Lớp học tổ chức kỳ thi
    title VARCHAR(255) NOT NULL,                                -- // Tên bài thi (VD: Kiểm tra giữa kỳ JLPT N5 Đợt 1)
    exam_type VARCHAR(30) DEFAULT 'PERIODIC_TEST' CHECK (exam_type IN ('PERIODIC_TEST', 'JLPT_MOCK', 'FINAL_EXAM')), -- // Loại kỳ thi: PERIODIC_TEST (Định kỳ), JLPT_MOCK (Thi thử JLPT), FINAL_EXAM (Thi cuối khóa)
    exam_date DATE NOT NULL,                                    -- // Ngày tổ chức thi
    max_score_vocabulary_kanji DECIMAL(5, 2) DEFAULT 60.00,     -- // Điểm tối đa phần Từ vựng - Chữ Hán (Kanji)
    max_score_grammar_reading DECIMAL(5, 2) DEFAULT 60.00,      -- // Điểm tối đa phần Ngữ pháp - Đọc hiểu
    max_score_listening DECIMAL(5, 2) DEFAULT 60.00,            -- // Điểm tối đa phần Nghe hiểu (Choukai)
    max_score_total DECIMAL(5, 2) DEFAULT 180.00,               -- // Tổng điểm trần tối đa của đề thi (Chuẩn JLPT là 180 điểm)
    passing_score DECIMAL(5, 2) DEFAULT 90.00,                  -- // Điểm sàn tối thiểu để qua môn (Đậu/Pass)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,             -- // Thời điểm tạo bài thi
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- // Thời điểm cập nhật bài thi
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- // BẢNG 15: exam_results (Kết quả điểm thi của học viên)
-- // Bảng điểm chi tiết từng kỹ năng tiếng Nhật của học viên trong kỳ thi và đánh giá của giáo viên chấm bài.
CREATE TABLE IF NOT EXISTS exam_results (
    id VARCHAR(36) PRIMARY KEY,                                 -- // Khóa chính bảng điểm học viên
    exam_id VARCHAR(36) NOT NULL,                               -- // Bài thi được chấm điểm
    student_id VARCHAR(36) NOT NULL,                            -- // Học viên nhận điểm
    class_id VARCHAR(36) NOT NULL,                              -- // Lớp học của học viên
    score_vocabulary_kanji DECIMAL(5, 2) DEFAULT 0.00,          -- // Điểm đạt được phần Từ vựng & Chữ Hán
    score_grammar_reading DECIMAL(5, 2) DEFAULT 0.00,           -- // Điểm đạt được phần Ngữ pháp & Đọc hiểu
    score_listening DECIMAL(5, 2) DEFAULT 0.00,                 -- // Điểm đạt được phần Nghe hiểu
    score_total DECIMAL(5, 2) DEFAULT 0.00,                     -- // Tổng điểm đạt được cả 3 phần thi
    is_passed BOOLEAN DEFAULT FALSE,                            -- // Kết quả chung cuộc: TRUE (Đậu/Đạt chuẩn), FALSE (Chưa đạt chuẩn)
    teacher_evaluation TEXT,                                    -- // Nhận xét đánh giá chi tiết điểm mạnh/điểm yếu của giáo viên chấm
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,             -- // Thời điểm nhập điểm
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- // Thời điểm cập nhật điểm
    UNIQUE (exam_id, student_id),                               -- // Mỗi học viên chỉ có 1 kết quả điểm trên 1 kỳ thi
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- // ====================================================================================================
-- // PHẦN 5: TÀI CHÍNH, HỌC PHÍ, HÓA ĐƠN & GIAO DỊCH VIETQR
-- // ====================================================================================================

-- // BẢNG 16: invoices (Hóa đơn học phí & Công nợ)
-- // Quản lý nghĩa vụ đóng học phí của học viên, các mức ưu đãi giảm học phí, số tiền đã đóng và số tiền nợ lại.
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(36) PRIMARY KEY,                                 -- // Khóa chính định danh hóa đơn
    invoice_code VARCHAR(50) NOT NULL UNIQUE,                   -- // Mã hóa đơn viết hoa (VD: HD-2026-0001)
    student_id VARCHAR(36) NOT NULL,                            -- // Học viên chịu trách nhiệm thanh toán
    enrollment_id VARCHAR(36),                                  -- // Gắn với đợt ghi danh khóa học nào
    title VARCHAR(255) NOT NULL,                                -- // Tiêu đề hóa đơn (VD: Thu học phí khóa Tiếng Nhật N5 K45)
    original_amount DECIMAL(12, 2) NOT NULL,                    -- // Học phí gốc niêm yết (VNĐ)
    discount_amount DECIMAL(12, 2) DEFAULT 0,                   -- // Tiền học bổng hoặc ưu đãi giảm trừ (VNĐ)
    final_amount DECIMAL(12, 2) NOT NULL,                       -- // Số tiền thực tế học viên phải đóng sau giảm trừ (VNĐ)
    paid_amount DECIMAL(12, 2) DEFAULT 0,                       -- // Số tiền lũy kế học viên đã nộp vào trung tâm (VNĐ)
    debt_amount DECIMAL(12, 2) DEFAULT 0,                       -- // Số tiền học phí còn nợ lại (final_amount - paid_amount)
    due_date DATE NOT NULL,                                     -- // Hạn chót phải hoàn tất học phí
    status VARCHAR(20) DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partially_paid', 'paid', 'overdue', 'cancelled')), -- // Trạng thái: unpaid (Chưa đóng), partially_paid (Đóng 1 phần), paid (Đã xong), overdue (Quá hạn), cancelled (Hủy bỏ)
    notes TEXT,                                                 -- // Ghi chú điều khoản thanh toán học phí
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,             -- // Thời điểm phát hành hóa đơn
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- // Thời điểm cập nhật hóa đơn
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE SET NULL
);

-- // BẢNG 17: payment_transactions (Lịch sử thanh toán & Cổng VietQR PayOS)
-- // Lưu vết từng lần đóng tiền học phí, hỗ trợ thanh toán tự động bằng mã VietQR qua cổng PayOS hoặc thu tiền mặt/chuyển khoản thủ công.
CREATE TABLE IF NOT EXISTS payment_transactions (
    id VARCHAR(36) PRIMARY KEY,                                 -- // Khóa chính định danh giao dịch nộp tiền
    invoice_id VARCHAR(36) NOT NULL,                            -- // Nộp tiền cho hóa đơn nào
    student_id VARCHAR(36) NOT NULL,                            -- // Học viên thực hiện thanh toán
    transaction_code VARCHAR(100) NOT NULL UNIQUE,              -- // Mã đối soát giao dịch (VD: TXN-20261120-001)
    amount DECIMAL(12, 2) NOT NULL,                             -- // Số tiền thanh toán trong lần nộp này (Tối thiểu 1,000 VNĐ)
    payment_method VARCHAR(20) DEFAULT 'VIETQR' CHECK (payment_method IN ('VIETQR', 'BANK_TRANSFER', 'CASH', 'MOMO')), -- // Phương thức nộp: VIETQR (Quét mã VietQR), BANK_TRANSFER (Chuyển khoản), CASH (Tiền mặt tại quầy), MOMO (Ví điện tử)
    payment_gateway VARCHAR(20) DEFAULT 'PAYOS' CHECK (payment_gateway IN ('PAYOS', 'MANUAL')), -- // Cổng xử lý giao dịch: PAYOS (Tự động xác nhận giao dịch qua Webhook), MANUAL (Thu ngân xác nhận tay)
    qr_code_url TEXT,                                           -- // Đường dẫn ảnh hoặc dữ liệu chuỗi QR PayOS VietQR
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED')), -- // Trạng thái giao dịch: PENDING (Chờ học viên quét mã), SUCCESS (Đã nộp thành công), FAILED (Thất bại), REFUNDED (Đã hoàn tiền)
    bank_transaction_id VARCHAR(100),                           -- // Mã giao dịch do phía ngân hàng cấp (FT number...)
    paid_at TIMESTAMP,                                          -- // Thời điểm hệ thống ghi nhận tiền đã vào tài khoản
    note TEXT,                                                  -- // Ghi chú nộp tiền hoặc thông tin hóa đơn đi kèm
    recorded_by VARCHAR(36),                                    -- // Nhân viên/Thu ngân trực tiếp thu hoặc xác nhận tiền
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,             -- // Thời điểm tạo lệnh thanh toán
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- // Thời điểm cập nhật trạng thái nộp tiền
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- // ====================================================================================================
-- // PHẦN 6: BẢO MẬT HỆ THỐNG & NHẬT KÝ KIỂM TOÁN (AUDIT LOGS)
-- // ====================================================================================================

-- // BẢNG 18: audit_logs (Nhật ký theo dõi hành vi hệ thống)
-- // Lưu vết mọi thao tác Tạo, Sửa, Xóa hoặc Hủy dữ liệu nhạy cảm của nhân viên và quản trị viên, kèm địa chỉ IP và dữ liệu trước/sau thay đổi.
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,                                 -- // Khóa chính bản ghi kiểm toán
    user_id VARCHAR(36) NOT NULL,                               -- // Người dùng thực hiện thao tác
    action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'CANCEL')), -- // Loại hành động: CREATE (Thêm mới), UPDATE (Sửa đổi), DELETE (Xóa bỏ), CANCEL (Hủy bỏ giao dịch)
    target_collection VARCHAR(100) NOT NULL,                    -- // Bảng/Collection dữ liệu bị tác động (VD: branches, classes, invoices...)
    target_id VARCHAR(36) NOT NULL,                             -- // Khóa chính của bản ghi cụ thể bị tác động
    old_data JSON,                                              -- // Ảnh chụp dữ liệu gốc trước khi người dùng thực hiện sửa/xóa
    new_data JSON,                                              -- // Ảnh chụp dữ liệu mới sau khi người dùng sửa/thêm
    ip_address VARCHAR(45),                                     -- // Địa chỉ IP mạng của thiết bị thực hiện thao tác
    user_agent TEXT,                                            -- // Chuỗi định danh thiết bị/trình duyệt của người thao tác
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,             -- // Thời điểm xảy ra thao tác (Chỉ ghi một lần, không cho phép chỉnh sửa)
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- // ====================================================================================================
-- // PHẦN 7: TẠO CÁC CHỈ MỤC TỐI ƯU TỐC ĐỘ TRUY VẤN (INDEXES)
-- // ====================================================================================================

-- // Chỉ mục tìm kiếm người dùng theo email và cơ sở
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_branch ON users(branch_id);

-- // Chỉ mục tìm kiếm phòng học theo cơ sở
CREATE INDEX IF NOT EXISTS idx_classrooms_branch ON classrooms(branch_id);

-- // Chỉ mục tìm kiếm lớp học theo cơ sở và trạng thái
CREATE INDEX IF NOT EXISTS idx_classes_branch_status ON classes(branch_id, status);
CREATE INDEX IF NOT EXISTS idx_classes_course ON classes(course_id);

-- // Chỉ mục chống trùng lịch dạy giáo viên và phòng học (Conflict Detection)
CREATE INDEX IF NOT EXISTS idx_schedules_teacher_conflict ON class_schedules(teacher_id, date, shift_slot_id);
CREATE INDEX IF NOT EXISTS idx_schedules_classroom_conflict ON class_schedules(classroom_id, date, shift_slot_id);

-- // Chỉ mục tìm kiếm học viên theo mã học viên và số điện thoại
CREATE INDEX IF NOT EXISTS idx_students_code ON students(student_code);
CREATE INDEX IF NOT EXISTS idx_students_phone ON students(phone);

-- // Chỉ mục tra cứu điểm danh theo buổi học và học viên
CREATE INDEX IF NOT EXISTS idx_attendances_schedule ON attendances(schedule_id);
CREATE INDEX IF NOT EXISTS idx_attendances_student ON attendances(student_id);

-- // Chỉ mục tra cứu hóa đơn và giao dịch nộp tiền
CREATE INDEX IF NOT EXISTS idx_invoices_student ON invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_code ON invoices(invoice_code);
CREATE INDEX IF NOT EXISTS idx_transactions_invoice ON payment_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_transactions_code ON payment_transactions(transaction_code);

-- // Chỉ mục tìm kiếm nhật ký kiểm toán theo bảng dữ liệu và người thực hiện
CREATE INDEX IF NOT EXISTS idx_audit_target ON audit_logs(target_collection, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
