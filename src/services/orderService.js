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
    
    // TAMBAHKAN INI untuk melihat struktur data asli dari API
    console.log('Data mentah dari API:', response.data);
    
    // Pengecekan struktur berdasarkan temuan baru:
    if (response.data && response.data.data && Array.isArray(response.data.data.menuItems)) {
      // Jika ada response.data, lalu ada response.data.data,
      // dan di dalamnya response.data.data.menuItems adalah sebuah array
      return response.data.data.menuItems; // Kembalikan array menu
    } else {
      // Jika struktur tidak sesuai dengan yang diharapkan
      console.warn("Struktur data menu dari API tidak sesuai harapan. Diterima:", response.data);
      return []; // Kembalikan array kosong sebagai fallback
    }
  } catch (error) {
    console.error('Error fetching menu items:', error);
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

export const createOrder = async (orderPayload) => {
  try {
    const token = localStorage.getItem('token'); // Ambil token dari localStorage
    if (!token) {
      // Jika tidak ada token, idealnya pengguna tidak bisa sampai ke tahap ini
      // karena halaman order seharusnya sudah diproteksi.
      // Namun, sebagai pengaman tambahan:
      throw new Error('No authentication token found. Please login again.');
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`, // Sertakan token di header Authorization
        'Content-Type': 'application/json' // Pastikan mengirim sebagai JSON
      }
    };

    // orderPayload akan berisi objek seperti:
    // { customerName: "...", tableNumber: "...", items: [{ menuId: ..., quantity: ... }] }
    console.log('Sending order payload:', orderPayload); // Untuk debugging
    const response = await axios.post(`${API_BASE_URL}/orders`, orderPayload, config);
    
    // Jika backend mengembalikan status sukses dan data order
    if (response.data && response.data.status === 'success' && response.data.data && response.data.data.order) {
      console.log('Order created successfully:', response.data.data.order); // Untuk debugging
      return response.data.data.order; // Mengembalikan objek order yang telah dibuat
    } else {
      // Jika respons ada tapi formatnya tidak seperti yang diharapkan
      console.warn('Unexpected success response structure:', response.data);
      throw new Error(response.data.message || 'Gagal membuat pesanan, respons server tidak sesuai.');
    }
  } catch (error) {
    console.error('Create Order API error:', error.response ? error.response.data : error.message); // Log error lebih detail
    
    // Penanganan error yang lebih baik berdasarkan respons dari server
    if (error.response && error.response.data && error.response.data.message) {
      // Jika backend mengirim pesan error spesifik di dalam response.data.message
      throw new Error(error.response.data.message);
    } else if (error.response) {
        // Jika ada respons error dari server tapi tidak ada .data.message
        throw new Error(`Gagal membuat pesanan. Server merespons dengan status ${error.response.status}.`);
    } else if (error.request) {
      // Permintaan dibuat tapi tidak ada respons diterima
      throw new Error('Tidak ada respons dari server saat membuat pesanan. Cek koneksi internet Anda.');
    } else {
      // Kesalahan lain saat menyiapkan permintaan
      throw new Error(error.message || 'Terjadi kesalahan yang tidak diketahui saat membuat pesanan.');
    }
  }
};

export const getOrders = async (params = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      // Axios akan mengubah { sortBy: 'createdAt:desc' } menjadi ?sortBy=createdAt:desc
      params: params 
    };

    console.log('Fetching orders with config:', config); // Untuk debug
    const response = await axios.get(`${API_BASE_URL}/orders`, config);

    if (response.data && response.data.status === 'success' && response.data.data && Array.isArray(response.data.data.orders)) {
      return response.data.data.orders;
    } else {
      console.warn('Unexpected structure while fetching orders:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Get Orders API error:', error.response ? error.response.data : error.message);
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else if (error.response) {
      throw new Error(`Gagal mengambil data pesanan. Server merespons dengan status ${error.response.status}.`);
    } else if (error.request) {
      throw new Error('Tidak ada respons dari server saat mengambil pesanan. Cek koneksi.');
    } else {
      throw new Error(error.message || 'Terjadi kesalahan yang tidak diketahui saat mengambil pesanan.');
    }
  }
};

export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const payload = { status: newStatus }; // Body permintaan sesuai instruksi
    console.log(`Updating order ${orderId} to status ${newStatus} with payload:`, payload); // Debug

    // Menggunakan PATCH ke endpoint /api/v1/orders/:orderId/status
    const response = await axios.patch(`${API_BASE_URL}/orders/${orderId}/status`, payload, config);

    if (response.data && response.data.status === 'success' && response.data.data && response.data.data.order) {
      console.log('Order status updated successfully:', response.data.data.order); // Debug
      return response.data.data.order; // Kembalikan objek pesanan yang terupdate
    } else {
      console.warn('Unexpected success response structure after status update:', response.data);
      throw new Error(response.data.message || 'Gagal memperbarui status pesanan, respons server tidak sesuai.');
    }
  } catch (error) {
    console.error('Update Order Status API error:', error.response ? error.response.data : error.message);
    
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else if (error.response) {
      throw new Error(`Gagal memperbarui status. Server merespons dengan status ${error.response.status}.`);
    } else if (error.request) {
      throw new Error('Tidak ada respons dari server saat memperbarui status. Cek koneksi.');
    } else {
      throw new Error(error.message || 'Terjadi kesalahan yang tidak diketahui saat memperbarui status pesanan.');
    }
  }
};