import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllMenuItems, createOrder } from '../services/orderService';
import styles from '../styles/OrderPage.module.css';

/*const getDisplayImageUrl = (category) => {
    switch (category) {
        case 'Makanan':
            return 'https://images.pexels.com/photos/3926133/pexels-photo-3926133.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
        case 'Minuman':
            return 'https://via.placeholder.com/80x80/007BFF/FFFFFF?text=DRINK';
        case 'Snack':
            return 'https://via.placeholder.com/80x80/28A745/FFFFFF?text=SNACK';
        default:
            return 'https://via.placeholder.com/80x80/6c757d/FFFFFF?text=ITEM';
    }
};*/

function OrderPage() {
    const navigate = useNavigate();
    const [apiMenuData, setApiMenuData] = useState([]);
    const [loadingMenu, setLoadingMenu] = useState(true);
    const [errorMenu, setErrorMenu] = useState(null);

    const [selectedMenu, setSelectedMenu] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('Semua');
    const [tableNumber, setTableNumber] = useState('');
    
    // --- STATE BARU UNTUK INPUT CUSTOMER NAME ---
    const [customerNameInput, setCustomerNameInput] = useState(''); 
    // --- AKHIR STATE BARU ---

    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
    const [submitOrderError, setSubmitOrderError] = useState('');
    const [submitOrderSuccess, setSubmitOrderSuccess] = useState('');

    // ... (useEffect untuk autentikasi dan fetchMenuData tetap sama) ...
    useEffect(() => {
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                setLoadingMenu(true);
                const data = await getAllMenuItems();
                setApiMenuData(data || []);
                setErrorMenu(null);
            } catch (err) {
                setErrorMenu(err.message || 'Gagal memuat data menu.');
                console.error("Error di OrderPage fetchMenuData:", err);
                setApiMenuData([]);
            } finally {
                setLoadingMenu(false);
            }
        };
        fetchMenuData();
    }, []);


    // ... (handleAddToOrder, handleUpdateQuantity, handleRemoveFromOrder, calculateTotal, filteredMenu, categories, tableNumbers tetap sama) ...
    const handleAddToOrder = (item) => {
        const existingItemIndex = selectedMenu.findIndex(orderItem => orderItem.id === item.id);
        if (existingItemIndex > -1) {
            const updatedMenu = [...selectedMenu];
            updatedMenu[existingItemIndex].quantity += 1;
            setSelectedMenu(updatedMenu);
        } else {
            setSelectedMenu([...selectedMenu, { ...item, quantity: 1 }]);
        }
    };

    const handleUpdateQuantity = (itemId, change) => {
        const updatedMenu = selectedMenu.map(item =>
            item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity + change) } : item
        ).filter(item => item.quantity > 0);
        setSelectedMenu(updatedMenu);
    };

    const handleRemoveFromOrder = (itemId) => {
        setSelectedMenu(selectedMenu.filter(item => item.id !== itemId));
    };

    const calculateTotal = () => {
        return selectedMenu.reduce((total, item) => total + (parseFloat(item.harga) * item.quantity), 0);
    };

    const filteredMenu = apiMenuData.filter(item => {
        const itemName = item.nama || '';
        const itemCategory = item.kategori || '';
        const matchesSearch = itemName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'Semua' || itemCategory === filterCategory;
        return matchesSearch && matchesCategory;
    });
    const categories = ['Semua', ...new Set(apiMenuData.map(item => item.kategori || 'Lainnya').filter(Boolean))];
    const tableNumbers = Array.from({ length: 10 }, (_, i) => `Meja ${i + 1}`);
    // Akhir dari fungsi yang tidak berubah signifikan


    const handleSubmitOrder = async () => {
        setSubmitOrderError('');
        setSubmitOrderSuccess('');

        if (selectedMenu.length === 0) {
            alert('Keranjang pesanan masih kosong! Silakan pilih menu terlebih dahulu.');
            return;
        }
        // --- VALIDASI BARU UNTUK CUSTOMER NAME ---
        if (!customerNameInput.trim()) { // .trim() untuk menghapus spasi di awal/akhir
            alert('Nama customer tidak boleh kosong!');
            return;
        }
        // --- AKHIR VALIDASI BARU ---
        if (!tableNumber) {
            alert('Harap pilih nomor meja atau opsi "Take Away" terlebih dahulu!');
            return;
        }

        const orderPayload = {
            // --- GUNAKAN NILAI DARI INPUT FIELD ---
            customerName: customerNameInput.trim(), 
            // --- AKHIR PENGGUNAAN NILAI DARI INPUT FIELD ---
            tableNumber: tableNumber === 'Take Away' ? tableNumber : parseInt(tableNumber.replace('Meja ', ''), 10),
            items: selectedMenu.map(item => ({
                menuId: item.id,
                quantity: item.quantity
            })),
        };

        const confirmation = window.confirm(
            `Konfirmasi pesanan untuk ${orderPayload.customerName} di ${orderPayload.tableNumber} dengan total Rp${calculateTotal().toLocaleString()}?`
        );

        if (confirmation) {
            setIsSubmittingOrder(true);
            console.log('Mengirim data pesanan:', orderPayload);

            try {
                const createdOrder = await createOrder(orderPayload);
                console.log('Pesanan berhasil dibuat:', createdOrder);
                
                setSubmitOrderSuccess(`Pesanan untuk ${createdOrder.customerName} (ID: ${createdOrder.id}) berhasil dibuat!`);
                alert(`Pesanan untuk ${createdOrder.customerName} (ID: ${createdOrder.id}) berhasil dibuat dan sedang diproses!`);
                
                setSelectedMenu([]);
                setTableNumber('');
                // --- KOSONGKAN INPUT CUSTOMER NAME SETELAH SUKSES ---
                setCustomerNameInput(''); 
                // --- AKHIR KOSONGKAN INPUT ---

            } catch (submitError) {
                console.error("Error submitting order:", submitError);
                setSubmitOrderError(submitError.message || 'Gagal mengirim pesanan. Silakan coba lagi.');
                alert(`Gagal mengirim pesanan: ${submitError.message}`);
            } finally {
                setIsSubmittingOrder(false);
            }
        }
    };

    if (loadingMenu) {
        return <div className={styles.orderPageContainer}><p className={styles.loadingMessage}>Memuat menu, harap tunggu...</p></div>;
    }

    if (errorMenu) {
        return <div className={styles.orderPageContainer}><p className={styles.errorMessage}>Error Memuat Menu: {errorMenu}</p></div>;
    }

    return (
        <div className={styles.orderPageContainer}>
            {/* ... (Bagian Daftar Menu tetap sama) ... */}
             <div className={styles.menuSection}>
                {/* ... (Konten menuSection tidak berubah signifikan, hanya disable tombol/input) ... */}
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Pilih Menu</h2>
                    <button onClick={() => navigate('/dashboard')} className={styles.backButton}  disabled={isSubmittingOrder}>
                        Kembali
                    </button>
                </div>
                <div className={styles.controls}>
                    <input type="text" placeholder="Cari menu..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={styles.searchInput} disabled={isSubmittingOrder}/>
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={styles.categorySelect} disabled={isSubmittingOrder}>
                        {categories.map(cat => (<option key={cat} value={cat}>{cat || 'Tidak Berkategori'}</option>))}
                    </select>
                </div>
                <div className={styles.menuList}>
                    {filteredMenu.length > 0 ? (
                        filteredMenu.map(item => (
                            <div key={item.id} className={styles.menuItem} onClick={() => !isSubmittingOrder && handleAddToOrder(item)} style={{ cursor: isSubmittingOrder ? 'not-allowed' : 'pointer' }}>
                                <img
                                    src={item.imageUrl || 'https://via.placeholder.com/80x80?text=NO+IMAGE'}
                                    alt={item.nama}
                                    className={styles.menuItemImage} // jika ingin styling khusus
                                />
                                <div className={styles.menuItemInfo}>
                                    <h4>{item.nama || 'Nama Tidak Tersedia'}</h4>
                                    <p>Rp{(parseFloat(item.harga) || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className={styles.emptyCartMessage}>Tidak ada menu yang ditemukan atau sesuai filter.</p>
                    )}
                </div>
            </div>


            {/* Bagian Keranjang Pesanan */}
            <div className={styles.orderSection}>
                <h3 className={styles.sectionTitle}>Keranjang Pesanan</h3>
                {submitOrderError && <p className={styles.errorMessage}>{submitOrderError}</p>}
                {submitOrderSuccess && <p className={styles.successMessage}>{submitOrderSuccess}</p>}

                {/* --- INPUT FIELD BARU UNTUK CUSTOMER NAME --- */}
                <div className={styles.customerNameInputGroup}> {/* Buat style untuk ini jika perlu */}
                    <label htmlFor="customerName" className={styles.label}>Nama Customer:</label>
                    <input
                        type="text"
                        id="customerName"
                        value={customerNameInput}
                        onChange={(e) => setCustomerNameInput(e.target.value)}
                        className={styles.customerNameInput} // Buat style untuk ini jika perlu
                        placeholder="Masukkan nama customer"
                        required
                        disabled={isSubmittingOrder}
                    />
                </div>
                {/* --- AKHIR INPUT FIELD BARU --- */}

                <div className={styles.tableNumberSelectGroup}>
                    <label htmlFor="tableNumber" className={styles.label}>Nomor Meja / Opsi Pesanan:</label>
                    <select id="tableNumber" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} className={styles.tableNumberSelect} required disabled={isSubmittingOrder}>
                        <option value="">-- Pilih Meja --</option>
                        {tableNumbers.map(table => (<option key={table} value={table}>{table}</option>))}
                    </select>
                </div>
                
                {/* ... (Tampilan selectedMenu tetap sama) ... */}
                 {selectedMenu.length === 0 ? (
                    <p className={styles.emptyCartMessage}>Keranjang masih kosong.</p>
                ) : (
                    <ul className={styles.orderList}>
                        {selectedMenu.map(item => (
                            <li key={item.id} className={styles.orderItem}>
                                <div className={styles.orderItemInfo}>
                                    <p>{item.nama}</p>
                                    <p>Rp{(parseFloat(item.harga) || 0).toLocaleString()} x {item.quantity}</p>
                                </div>
                                <div className={styles.quantityControls}>
                                    <button onClick={() => !isSubmittingOrder && handleUpdateQuantity(item.id, -1)} className={styles.qtyBtn} disabled={isSubmittingOrder}>-</button>
                                    <span className={styles.qtyText}>{item.quantity}</span>
                                    <button onClick={() => !isSubmittingOrder && handleUpdateQuantity(item.id, 1)} className={styles.qtyBtn} disabled={isSubmittingOrder}>+</button>
                                    <button onClick={() => !isSubmittingOrder && handleRemoveFromOrder(item.id)} className={styles.removeBtn} disabled={isSubmittingOrder}>X</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                <div className={styles.orderSummary}>
                    <h4>Total: Rp{calculateTotal().toLocaleString()}</h4>
                    <button
                        onClick={handleSubmitOrder}
                        className={styles.submitOrderBtn}
                        disabled={selectedMenu.length === 0 || !tableNumber || !customerNameInput.trim() || loadingMenu || isSubmittingOrder} // Tambahkan customerNameInput ke kondisi disabled
                    >
                        {isSubmittingOrder ? 'Memproses Pesanan...' : 'Kirim Pesanan'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OrderPage;