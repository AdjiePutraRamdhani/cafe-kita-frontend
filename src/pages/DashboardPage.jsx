import React, { useState, useEffect } from 'react'; // Tambahkan useState
import { useNavigate, NavLink } from 'react-router-dom';
import { getOrders } from '../services/orderService'; // Pastikan path ini benar
import styles from '../styles/Dashboard.module.css';

// Fungsi helper untuk cek apakah tanggal adalah hari ini
const isToday = (dateString) => {
  if (!dateString) return false;
  const orderDate = new Date(dateString);
  const today = new Date();
  return orderDate.getFullYear() === today.getFullYear() &&
         orderDate.getMonth() === today.getMonth() &&
         orderDate.getDate() === today.getDate();
};

// Fungsi helper untuk format ringkasan item
const formatOrderItemsSummary = (items) => {
  if (!items || items.length === 0) return "Tidak ada item";
  // Pastikan item.menu ada sebelum mengakses item.menu.nama
  return items.map(item => item.menu ? `${item.menu.nama} (${item.quantity})` : 'Item tidak valid').join(', ');
};


function DashboardPage() {
    const navigate = useNavigate();

    // State untuk data dashboard dari API
    const [pesananHariIniCount, setPesananHariIniCount] = useState(0);
    const [pesananMenungguCount, setPesananMenungguCount] = useState(0);
    const [totalPendapatanHariIni, setTotalPendapatanHariIni] = useState(0);
    const [daftarPesananAktif, setDaftarPesananAktif] = useState([]); // Ini akan berisi pesanan PENDING
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Proteksi rute dan fetch data
    useEffect(() => {
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        if (!isAuthenticated) {
            navigate('/login');
            return; 
        }

        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Ambil pesanan PENDING (untuk "Pesanan Menunggu" dan "Pesanan Aktif")
                const pendingOrdersParams = { 
                    status: 'PENDING', 
                    sortBy: 'createdAt:desc' 
                };
                const pendingOrders = await getOrders(pendingOrdersParams);
                setPesananMenungguCount(pendingOrders.length);
                setDaftarPesananAktif(pendingOrders);

                // 2. Ambil semua pesanan terbaru untuk kalkulasi "Pesanan Hari Ini" dan "Total Pendapatan Hari Ini"
                const allRecentOrdersParams = { 
                    sortBy: 'createdAt:desc'
                    // Anda bisa tambahkan limit jika API mendukung dan datanya sangat banyak
                    // limit: 100, 
                };
                const allOrders = await getOrders(allRecentOrdersParams);

                let todayOrdersCount = 0;
                let todayRevenue = 0;

                allOrders.forEach(order => {
                    if (isToday(order.createdAt)) {
                        todayOrdersCount++;
                        todayRevenue += parseFloat(order.totalPrice) || 0;
                    }
                });

                setPesananHariIniCount(todayOrdersCount);
                setTotalPendapatanHariIni(todayRevenue);

            } catch (err) {
                setError(err.message || 'Gagal memuat data dashboard.');
                console.error("Error fetching dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('token'); // Jangan lupa hapus token juga
        navigate('/login');
    };

    // Tampilan loading dan error
    if (loading) {
        return (
            <div className={styles.dashboardContainer}>
                <aside className={styles.sidebar}>
                    {/* Sidebar bisa tetap ditampilkan saat loading jika diinginkan */}
                    <h1 className={styles.sidebarTitle}>Cafe-Kita</h1>
                    {/* ... Navigasi bisa disederhanakan atau disembunyikan saat loading ... */}
                </aside>
                <main className={styles.mainContent}>
                    <p>Memuat data dashboard...</p>
                </main>
            </div>
        );
    }

    if (error) {
         return (
            <div className={styles.dashboardContainer}>
                <aside className={styles.sidebar}>
                     <h1 className={styles.sidebarTitle}>Cafe-Kita</h1>
                     {/* ... Navigasi ... */}
                </aside>
                <main className={styles.mainContent}>
                    <p>Error memuat data: {error}</p>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer}>
            {/* Sidebar Navigasi */}
            <aside className={styles.sidebar}>
                <h1 className={styles.sidebarTitle}>Cafe-Kita</h1>
                <nav>
                    <ul className={styles.sidebarNav}>
                        <li className={styles.sidebarNavItem}>
                            <NavLink
                                to="/dashboard"
                                className={({ isActive }) =>
                                    isActive ? `${styles.sidebarNavLink} ${styles.active}` : styles.sidebarNavLink
                                }
                                end
                            >
                                Dashboard
                            </NavLink>
                        </li>
                        <li className={styles.sidebarNavItem}>
                            <NavLink
                                to="/order" // Pastikan ini rute ke halaman OrderPage Anda
                                className={({ isActive }) =>
                                    isActive ? `${styles.sidebarNavLink} ${styles.active}` : styles.sidebarNavLink
                                }
                            >
                                Buat Pesanan
                            </NavLink>
                        </li>
                        <li className={styles.sidebarNavItem}>
                            <NavLink
                                to="/active-orders" // Rute ini perlu Anda buat komponennya nanti
                                className={({ isActive }) =>
                                    isActive ? `${styles.sidebarNavLink} ${styles.active}` : styles.sidebarNavLink
                                }
                            >
                                Pesanan Aktif
                            </NavLink>
                        </li>
                    </ul>
                </nav>
                <button onClick={handleLogout} className={styles.logoutButton}>
                    Logout
                </button>
            </aside>

            {/* Konten Utama Dashboard */}
            <main className={styles.mainContent}>
                <h1 className={styles.welcomeHeader}>Selamat Datang, Pelayan!</h1>
                <p>Ringkasan Aktivitas Cafe-Kita hari ini.</p>

                {/* Grid Kartu Informasi - Menggunakan state dari API */}
                <div className={styles.cardGrid}>
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Pesanan Hari Ini</h3>
                        <p className={styles.cardNumber}>{pesananHariIniCount}</p>
                        <p className={styles.cardDescription}>Total pesanan yang masuk hari ini.</p>
                    </div>
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Pesanan Menunggu</h3>
                        <p className={styles.cardNumber}>{pesananMenungguCount}</p>
                        <p className={styles.cardDescription}>Pesanan yang sedang menunggu untuk disiapkan.</p>
                    </div>
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Total Pendapatan</h3>
                        <p className={styles.cardNumber}>Rp{totalPendapatanHariIni.toLocaleString('id-ID')}</p>
                        <p className={styles.cardDescription}>Estimasi pendapatan kotor hari ini.</p>
                    </div>
                </div>

                {/* Bagian Pesanan Aktif (Status PENDING) - Menggunakan state dari API */}
                <h2 className={styles.sectionTitle}>Pesanan Aktif</h2>
                <div className={styles.activeOrdersList}>
                    {/* Ini akan diisi dengan data pesanan aktif dari API nantinya */}
                    {daftarPesananAktif.length === 0 ? (
                        <p>Tidak ada pesanan aktif (PENDING) saat ini.</p>
                    ) : (
                        <ul className={styles.orderList}> {/* Anda mungkin perlu class .orderList atau .activeOrdersList dari CSS Anda */}
                            {daftarPesananAktif.map(order => (
                                <li key={order.id} className={styles.orderListItem}> {/* Anda mungkin perlu class .orderListItem */}
                                    <div><strong>Pesanan #{order.id}</strong></div>
                                    <div>Customer: {order.customerName}</div>
                                    <div>Meja: {order.tableNumber}</div>
                                    <div>Items: {formatOrderItemsSummary(order.items)}</div>
                                    <div>Total: Rp{parseFloat(order.totalPrice).toLocaleString('id-ID')}</div>
                                    <div 
                                        className={`${styles.statusBadge} ${styles['status' + order.status.toUpperCase()]}`}
                                    >
                                        {order.status}
                                    </div>
                                    {/* Tambahkan tombol aksi jika perlu, misal: ubah status */}
                                </li>
                            ))}
                        </ul>
                    )}
                    <p style={{textAlign: 'center', marginTop: '20px'}}>
                        <button onClick={() => navigate('/active-orders')} className={styles.logoutButton} style={{backgroundColor: '#17a2b8'}}>
                            Lihat Semua Pesanan Aktif
                        </button>
                    </p>
                </div>
            </main>
        </div>
    );
}

export default DashboardPage;