// src/pages/ActiveOrdersPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Import updateOrderStatus
import { getOrders, updateOrderStatus } from '../services/orderService'; 
import styles from '../styles/ActiveOrdersPage.module.css';

// ... (fungsi getStatusClass tetap sama) ...
const getStatusClass = (status) => {
  if (!status) return styles.statusDefault;
  const statusClass = styles['status' + status.toUpperCase().replace(/\s+/g, '_')];
  return statusClass || styles.statusDefault;
};

function ActiveOrdersPage() {
  const navigate = useNavigate();
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State untuk menandai order mana yang sedang diupdate statusnya (untuk loading di tombol)
  const [updatingStatusForOrderId, setUpdatingStatusForOrderId] = useState(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchAllOrders(); // Panggil fungsi fetch
  }, [navigate]); // dependensi navigate

  const fetchAllOrders = async () => { // Buat fungsi fetch terpisah agar bisa dipanggil ulang
    setLoading(true);
    setError(null);
    try {
      const params = { sortBy: 'createdAt:desc' };
      const orders = await getOrders(params);
      setAllOrders(orders);
    } catch (err) {
      setError(err.message || 'Gagal memuat data semua pesanan.');
      console.error("Error fetching all orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi umum untuk menangani update status
  const handleUpdateStatus = async (orderId, targetStatus, buttonAction) => {
    const orderToUpdate = allOrders.find(order => order.id === orderId);
    if (!orderToUpdate) return;

    const confirmationMessage = 
        buttonAction === 'Batalkan' ? `Apakah Anda yakin ingin membatalkan pesanan #${String(orderId).padStart(3, '0')}?`
      : buttonAction === 'Proses' ? `Proses pesanan #${String(orderId).padStart(3, '0')}?`
      : `Selesaikan pesanan #${String(orderId).padStart(3, '0')}?`;

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    setUpdatingStatusForOrderId(orderId); // Set loading untuk order ini
    try {
      const updatedOrderFromApi = await updateOrderStatus(orderId, targetStatus);
      
      // Update state allOrders dengan data order yang baru dari API
      setAllOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...updatedOrderFromApi } : order
        )
      );
      alert(`Status pesanan #${String(orderId).padStart(3, '0')} berhasil diubah menjadi ${targetStatus}!`);

    } catch (err) {
      console.error(`Error updating status for order ${orderId} to ${targetStatus}:`, err);
      alert(`Gagal mengubah status pesanan: ${err.message}`);
    } finally {
      setUpdatingStatusForOrderId(null); // Hapus loading untuk order ini
    }
  };


  if (loading && allOrders.length === 0) { // Tampilkan loading awal hanya jika belum ada data
    return <div className={styles.pageContainer}><p>Memuat semua pesanan...</p></div>;
  }

  if (error) {
    return <div className={styles.pageContainer}><p>Error: {error}</p> <button onClick={fetchAllOrders}>Coba Lagi</button></div>;
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>Daftar Semua Pesanan</h1> 
        <button onClick={() => navigate('/dashboard')} className={styles.backButton} disabled={!!updatingStatusForOrderId}>
          Kembali ke Dashboard
        </button>
      </header>

      {allOrders.length === 0 && !loading ? ( // Tampilkan jika tidak loading dan order kosong
        <p className={styles.noOrdersMessage}>Belum ada pesanan.</p>
      ) : (
        <div className={styles.ordersGrid}>
          {allOrders.map(order => {
            const isCurrentlyUpdating = updatingStatusForOrderId === order.id;
            return (
              <div key={order.id} className={`${styles.orderCard} ${getStatusClass(order.status)}`}>
                <div className={styles.cardHeader}>
                  <span className={styles.orderId}>#ORDER{String(order.id).padStart(3, '0')}</span>
                  <span className={styles.tableInfo}>{typeof order.tableNumber === 'number' ? `Meja ${order.tableNumber}` : order.tableNumber}</span>
                </div>
                <div className={styles.customerInfo}>
                  Customer: {order.customerName}
                </div>
                <ul className={styles.orderItems}>
                  {order.items && order.items.map((item, index) => (
                    <li key={`${order.id}-item-${item.menuId}-${index}`} className={styles.item}>
                      <span>{item.menu ? item.menu.nama : 'Nama Menu Tidak Ada'}</span>
                      <span>{item.quantity}x</span>
                    </li>
                  ))}
                </ul>
                <div className={styles.cardFooter}>
                  <div className={styles.totalPrice}>Total: Rp{parseFloat(order.totalPrice).toLocaleString('id-ID')}</div>
                  <div className={`${styles.statusLabel}`}>
                    Status: {order.status}
                  </div>
                  <div className={styles.orderDate}>
                      Dibuat: {new Date(order.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className={styles.actions}>
                    {/* Tombol Proses (PENDING -> DIPROSES) */}
                    {order.status === 'PENDING' && (
                      <button 
                        onClick={() => handleUpdateStatus(order.id, 'COMPLETED', 'Selesai')} 
                        className={`${styles.actionButton} ${styles.prosesButton}`}
                        disabled={isCurrentlyUpdating}
                      >
                        {isCurrentlyUpdating ? 'Memproses...' : 'Proses'}
                      </button>
                    )}
                     {(order.status === 'PENDING' || order.status === 'DIPROSES') && (
                      <button 
                        onClick={() => handleUpdateStatus(order.id, 'CANCELLED', 'Batalkan')} 
                        className={`${styles.actionButton} ${styles.batalButton}`}
                        disabled={isCurrentlyUpdating}
                      >
                        {isCurrentlyUpdating ? 'Membatalkan...' : 'Batalkan'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ActiveOrdersPage;