// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react'; // Tambahkan useEffect
import { useNavigate } from 'react-router-dom';
import { loginUser, isAuthenticated as checkAuthStatus } from '../services/authService'; // Import loginUser dan checkAuthStatus
import styles from '../styles/LoginPage.module.css';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Tambahkan state untuk loading
    const navigate = useNavigate();

    // Tambahkan useEffect ini untuk mengecek apakah pengguna sudah login
    // Jika sudah, langsung arahkan ke dashboard
    useEffect(() => {
      if (checkAuthStatus()) {
        navigate('/dashboard'); // Ganti '/dashboard' dengan rute halaman utama setelah login
      }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true); // Mulai loading

        if (!username || !password) {
            setError('Username dan password tidak boleh kosong.');
            setLoading(false); // Hentikan loading
            return;
        }

        try {
            const credentials = { username, password };
            const response = await loginUser(credentials); // Panggil API login

            // Jika loginUser berhasil, token sudah disimpan di localStorage oleh AuthService
            console.log('Login berhasil dari komponen:', response); // response berisi {status, token}
            
            // Arahkan ke halaman dashboard atau halaman utama aplikasi
            // Pastikan '/dashboard' adalah rute yang benar setelah login
            navigate('/dashboard'); 

        } catch (err) {
            console.error('Gagal login di komponen LoginPage:', err);
            // err.message akan berisi pesan error dari AuthService
            setError(err.message || 'Login gagal. Silakan coba lagi.');
        } finally {
            setLoading(false); // Hentikan loading setelah selesai (baik sukses maupun gagal)
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginBox}>
                <h1 className={styles.title}>Cafe-Kita</h1>
                <p className={styles.tagline}>Aplikasi Pemesanan untuk Pelayan</p>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="username" className={styles.label}>Username:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className={styles.input}
                            disabled={loading} // Tambahkan disabled saat loading
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="password" className={styles.label}>Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={styles.input}
                            disabled={loading} // Tambahkan disabled saat loading
                        />
                    </div>
                    {error && <p className={styles.error}>{error}</p>} {/* ClassName error disesuaikan dari .errorMessage menjadi .error jika itu yang ada di CSS */}
                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Memproses...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;