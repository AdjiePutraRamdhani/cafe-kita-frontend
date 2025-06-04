// src/services/AuthService.js
import axios from 'axios';

const API_LOGIN_URL = 'https://cafe-kita-backend-production-2ddf.up.railway.app/api/v1/auth/login';

export const loginUser = async (credentials) => {
  try {
    // credentials akan berisi { username: '...', password: '...' }
    const response = await axios.post(API_LOGIN_URL, credentials);

    // Jika login sukses dan ada token di respons
    if (response.data && response.data.token) {
      // Simpan token ke localStorage (atau state management lain)
      localStorage.setItem('token', response.data.token);
      // Anda juga bisa menandai bahwa pengguna sudah terautentikasi
      localStorage.setItem('isAuthenticated', 'true');
      // Kembalikan data respons agar bisa digunakan di komponen jika perlu
      return response.data;
    } else {
      // Jika respons sukses tapi tidak ada token (seharusnya tidak terjadi jika API konsisten)
      throw new Error('Login berhasil tetapi tidak ada token diterima.');
    }
  } catch (error) {
    console.error('Login API error:', error.response || error.message);
    // Lempar error agar bisa ditangani di komponen LoginPage
    // Kita akan perbaiki penanganan error ini jika sudah tahu struktur error dari backend
    if (error.response && error.response.data) {
      // Jika backend mengirim pesan error spesifik
      throw new Error(error.response.data.message || 'Login gagal. Periksa kembali username dan password Anda.');
    } else if (error.request) {
      throw new Error('Tidak ada respons dari server. Cek koneksi internet Anda.');
    } else {
      throw new Error('Terjadi kesalahan saat mencoba login.');
    }
  }
};

// Fungsi untuk logout (opsional, bisa ditambahkan nanti)
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('isAuthenticated');
  // Tambahkan logika lain jika perlu (misal, redirect ke halaman login)
};

// Fungsi untuk memeriksa status autentikasi (opsional)
export const isAuthenticated = () => {
  return !!localStorage.getItem('token') && localStorage.getItem('isAuthenticated') === 'true';
};