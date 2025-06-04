import axios from 'axios';

const API_BASE_URL = 'https://cafe-kita-backend-production-2ddf.up.railway.app/api/v1';

// Fungsi untuk mengambil semua item menu
export const getAllMenuItems = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/menu`);
    // Asumsikan backend mengembalikan data menu dalam response.data
    // Jika struktur responsnya adalah { data: [...] }, maka return response.data.data;
    // Jika responsnya langsung array [...], maka return response.data;
    // Periksa di Postman atau browser untuk memastikan struktur responsnya.
    // Dari contoh sebelumnya, kita akan asumsikan ada properti 'data' di dalam response.data
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (Array.isArray(response.data)) { // Jika ternyata respons langsung array
      return response.data;
    } else {
      console.warn("Struktur data menu tidak sesuai harapan:", response.data);
      return []; // Kembalikan array kosong atau lempar error
    }
  } catch (error) {
    console.error('Error fetching menu items:', error);
    // Kamu bisa melempar error agar bisa ditangani di komponen
    // atau mengembalikan array kosong / objek error kustom
    if (error.response) {
      // Server merespons dengan status error (misalnya 404, 500)
      throw new Error(`Error ${error.response.status}: ${error.response.data.message || 'Failed to fetch menu'}`);
    } else if (error.request) {
      // Permintaan dibuat tapi tidak ada respons diterima
      throw new Error('No response from server. Please check your network connection.');
    } else {
      // Sesuatu terjadi saat menyiapkan permintaan
      throw new Error('Error setting up request: ' + error.message);
    }
  }
};

// Kamu bisa menambahkan fungsi lain di sini terkait order, misalnya:
// export const createOrder = async (orderData) => { ... };
// export const getOrderById = async (orderId) => { ... };