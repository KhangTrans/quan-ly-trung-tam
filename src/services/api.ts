import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Luôn đính kèm Access Token mới nhất nếu có trong localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Hàng đợi lưu các request bị tạm hoãn trong lúc chờ refresh token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Xóa sạch dữ liệu phiên và phát sự kiện session-expired
 */
export const clearAuthSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.dispatchEvent(new CustomEvent('auth:session-expired'));
};

// Response Interceptor: Tự động dùng Refresh Token sinh Access Token mới khi hết hạn (HTTP 401)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || '';

    // Bỏ qua các endpoint auth không cần hoặc không được phép refresh token
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/verify-otp') ||
      requestUrl.includes('/auth/resend-otp') ||
      requestUrl.includes('/auth/forgot-password') ||
      requestUrl.includes('/auth/reset-password') ||
      requestUrl.includes('/auth/refresh-token');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Nếu request này đã từng thử refresh 1 lần mà vẫn 401 -> dừng ngay tránh lặp vô hạn
      if (originalRequest._retry) {
        clearAuthSession();
        if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
        return Promise.reject(error);
      }

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // Không có refresh token -> phiên làm việc hết hạn, lập tức điều hướng về login
        clearAuthSession();
        if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
        return Promise.reject(error);
      }

      // Nếu đang có một request khác thực hiện gọi refresh token -> đưa request này vào hàng đợi
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const baseURL = apiClient.defaults.baseURL || 'http://localhost:5000/api/v1';
        // Gọi trực tiếp qua axios thuần để không đi qua interceptor của apiClient
        const refreshResponse = await axios.post(`${baseURL}/auth/refresh-token`, {
          refreshToken,
        });

        const refreshData = refreshResponse.data?.data;
        const newAccessToken = refreshData?.accessToken || refreshData?.token;
        const newRefreshToken = refreshData?.refreshToken;

        if (!newAccessToken) {
          throw new Error('Máy chủ không cấp Access Token mới');
        }

        // Cập nhật token mới vào localStorage
        localStorage.setItem('token', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        // Báo cho AuthContext và các component khác biết token đã được cập nhật
        window.dispatchEvent(
          new CustomEvent('auth:token-refreshed', {
            detail: { token: newAccessToken, refreshToken: newRefreshToken },
          })
        );

        // Giải phóng các request đang chờ trong hàng đợi
        processQueue(null, newAccessToken);

        // Cập nhật header cho request hiện tại và thực thi lại
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        // Refresh token cũng đã hết hạn hoặc không hợp lệ -> tự động logout hoàn toàn
        processQueue(refreshErr, null);
        clearAuthSession();
        if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
