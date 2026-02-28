import axiosClient from '../axiosClient';

const authApi = {
    // Common
    getCurrentUser: (config = {}) => axiosClient.get('auth/me', config),

    seekerLogin: (credentials) => axiosClient.post('auth/login', { ...credentials, role: 'seeker' }),
    seekerSignup: (data) => axiosClient.post('auth/signup', { ...data, role: 'seeker' }),
    recruiterLogin: (credentials) => axiosClient.post('auth/login', { ...credentials, role: 'employer' }),
    recruiterSignup: (data) => axiosClient.post('auth/signup', { ...data, role: 'employer' }),

    // Google Auth
    googleVerify: (token, role) => axiosClient.post('auth/google/google-verify', { token, role }),
    googleAuth: (token, role) => axiosClient.post('auth/google', { token, role }),

    // OTP Auth
    sendOtp: (email, role) => axiosClient.post('auth/send-otp', { email, role }),
    verifyOtp: (email, otp, role) => axiosClient.post('auth/verify-otp', { email, otp, role }),

    // Password Reset (No OTP required)
    forgotPassword: (email, password, role) => axiosClient.post('auth/forgot-password', { email, password, role }),
    resetPassword: (email, password, role) => axiosClient.post('auth/reset-password', { email, password, role })
};

export default authApi;
