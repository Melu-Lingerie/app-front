import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import api from '@/axios/api';
import { setUserData, setAuthenticated, selectIsAuthenticated, selectUser } from '@/store/userSlice';
import type { AppDispatch } from '@/store';
import type { LoginResponseDto } from '@/api';

export const AdminLoginPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // If already authenticated as admin, redirect
    if (isAuthenticated && user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data: res } = await api.post<LoginResponseDto>('/admin/auth/login', { email, password });

            const accessTokenExpiresAt = typeof res.accessTokenExpiresIn === 'number'
                ? Date.now() + res.accessTokenExpiresIn * 1000
                : null;

            dispatch(setUserData({
                userId: res.userId ?? null,
                email: res.email ?? null,
                firstName: res.firstName ?? null,
                lastName: res.lastName ?? null,
                role: res.role ?? null,
                status: res.status ?? null,
                accessToken: res.accessToken ?? null,
                accessTokenExpiresAt,
            }));
            dispatch(setAuthenticated(true));

            navigate('/admin', { replace: true });
        } catch (err: any) {
            const status = err?.status || err?.response?.status;
            if (status === 403) {
                setError('Доступ запрещён. Требуются права администратора.');
            } else if (status === 400 || status === 401) {
                setError('Неверный email или пароль');
            } else {
                setError('Ошибка сервера. Попробуйте позже.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                .admin-login-root {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    background: #FFFBF5;
                }

                .admin-login-root::before,
                .admin-login-root::after {
                    content: '';
                    position: fixed;
                    pointer-events: none;
                    border-radius: 50%;
                    filter: blur(80px);
                    opacity: 0.7;
                }

                .admin-login-root::before {
                    width: 60vmax;
                    height: 60vmax;
                    top: -20%;
                    left: -15%;
                    background: radial-gradient(circle, #F8C6D7 0%, #FDDDE6 40%, transparent 70%);
                    animation: blobMove1 10s ease-in-out infinite alternate;
                    z-index: 0;
                }

                .admin-login-root::after {
                    width: 55vmax;
                    height: 55vmax;
                    bottom: -25%;
                    right: -10%;
                    background: radial-gradient(circle, #E8ADC0 0%, #D4A0B9 30%, transparent 70%);
                    animation: blobMove2 12s ease-in-out infinite alternate;
                    z-index: 0;
                }

                .iridescent-blob-1 {
                    position: fixed;
                    pointer-events: none;
                    border-radius: 50%;
                    filter: blur(90px);
                    width: 50vmax;
                    height: 50vmax;
                    top: 30%;
                    left: 40%;
                    background: radial-gradient(circle, #FFD6E0 0%, #FFC4D6 30%, transparent 70%);
                    animation: blobMove3 14s ease-in-out infinite alternate;
                    opacity: 0.6;
                    z-index: 0;
                }

                .iridescent-blob-2 {
                    position: fixed;
                    pointer-events: none;
                    border-radius: 50%;
                    filter: blur(100px);
                    width: 45vmax;
                    height: 45vmax;
                    top: -10%;
                    right: 20%;
                    background: radial-gradient(circle, #F0B8CC 0%, #E8C5D8 30%, transparent 70%);
                    animation: blobMove4 11s ease-in-out infinite alternate;
                    opacity: 0.5;
                    z-index: 0;
                }

                .iridescent-blob-3 {
                    position: fixed;
                    pointer-events: none;
                    border-radius: 50%;
                    filter: blur(70px);
                    width: 40vmax;
                    height: 40vmax;
                    bottom: 10%;
                    left: 20%;
                    background: radial-gradient(circle, #FDDDE6 0%, #F8C6D7 30%, transparent 70%);
                    animation: blobMove5 9s ease-in-out infinite alternate;
                    opacity: 0.55;
                    z-index: 0;
                }

                @keyframes blobMove1 {
                    0%   { transform: translate(0, 0) scale(1); }
                    33%  { transform: translate(10vw, 8vh) scale(1.1); }
                    66%  { transform: translate(-5vw, 15vh) scale(0.95); }
                    100% { transform: translate(15vw, 5vh) scale(1.05); }
                }

                @keyframes blobMove2 {
                    0%   { transform: translate(0, 0) scale(1); }
                    33%  { transform: translate(-12vw, -6vh) scale(1.08); }
                    66%  { transform: translate(8vw, -12vh) scale(0.92); }
                    100% { transform: translate(-8vw, -10vh) scale(1.1); }
                }

                @keyframes blobMove3 {
                    0%   { transform: translate(0, 0) scale(1); }
                    50%  { transform: translate(-15vw, -10vh) scale(1.15); }
                    100% { transform: translate(10vw, 8vh) scale(0.9); }
                }

                @keyframes blobMove4 {
                    0%   { transform: translate(0, 0) scale(1); }
                    50%  { transform: translate(-10vw, 12vh) scale(1.1); }
                    100% { transform: translate(5vw, -8vh) scale(0.95); }
                }

                @keyframes blobMove5 {
                    0%   { transform: translate(0, 0) scale(1); }
                    50%  { transform: translate(12vw, -5vh) scale(1.12); }
                    100% { transform: translate(-8vw, 10vh) scale(0.93); }
                }

                .login-card {
                    position: relative;
                    z-index: 1;
                    background: rgba(255, 255, 255, 0.75);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(248, 198, 215, 0.3);
                    border-radius: 1.5rem;
                    padding: 3rem;
                    width: 100%;
                    max-width: 420px;
                    margin: 1rem;
                    box-shadow:
                        0 8px 32px rgba(248, 198, 215, 0.15),
                        0 2px 8px rgba(0, 0, 0, 0.05);
                    animation: cardAppear 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    opacity: 0;
                    transform: translateY(30px) scale(0.98);
                }

                @keyframes cardAppear {
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .login-card input {
                    font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                }

                .login-icon-wrapper {
                    width: 64px;
                    height: 64px;
                    border-radius: 1rem;
                    background: linear-gradient(135deg, #F8C6D7 0%, #FDDDE6 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                    box-shadow: 0 4px 16px rgba(248, 198, 215, 0.3);
                }

                .login-btn {
                    width: 100%;
                    padding: 0.875rem;
                    border: none;
                    border-radius: 0.75rem;
                    font-size: 1rem;
                    font-weight: 500;
                    font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                    cursor: pointer;
                    background: linear-gradient(135deg, #F8C6D7 0%, #F0B8CC 50%, #E8ADC0 100%);
                    color: #4A3040;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .login-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(248, 198, 215, 0.4);
                }

                .login-btn:active:not(:disabled) {
                    transform: translateY(0);
                }

                .login-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .login-btn::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    transition: left 0.6s ease;
                }

                .login-btn:hover:not(:disabled)::before {
                    left: 100%;
                }

                .login-input-wrapper {
                    position: relative;
                    margin-bottom: 1rem;
                }

                .login-input {
                    width: 100%;
                    padding: 0.875rem 3rem 0.875rem 1rem;
                    border: 1px solid rgba(248, 198, 215, 0.4);
                    border-radius: 0.75rem;
                    font-size: 0.95rem;
                    background: rgba(255, 255, 255, 0.6);
                    color: #333;
                    outline: none;
                    transition: all 0.3s ease;
                }

                .login-input:focus {
                    border-color: #F8C6D7;
                    box-shadow: 0 0 0 3px rgba(248, 198, 215, 0.2);
                    background: rgba(255, 255, 255, 0.9);
                }

                .login-input::placeholder {
                    color: #B8A0AC;
                }

                .toggle-password {
                    position: absolute;
                    right: 0.75rem;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #B8A0AC;
                    padding: 0.25rem;
                    display: flex;
                    align-items: center;
                    transition: color 0.2s;
                }

                .toggle-password:hover {
                    color: #F0B8CC;
                }

                .login-error {
                    color: #D4546A;
                    font-size: 0.85rem;
                    text-align: center;
                    margin-bottom: 1rem;
                    animation: shake 0.4s ease-in-out;
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-6px); }
                    75% { transform: translateX(6px); }
                }

                .spinner {
                    display: inline-block;
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(74, 48, 64, 0.3);
                    border-top-color: #4A3040;
                    border-radius: 50%;
                    animation: spin 0.6s linear infinite;
                    margin-right: 0.5rem;
                    vertical-align: middle;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>

            <div className="admin-login-root">
                <div className="iridescent-blob-1" />
                <div className="iridescent-blob-2" />
                <div className="iridescent-blob-3" />
                <div className="login-card">
                    <div className="login-icon-wrapper">
                        <Lock size={28} color="#4A3040" strokeWidth={1.5} />
                    </div>

                    <h1
                        style={{
                            textAlign: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 300,
                            color: '#333',
                            marginBottom: '0.5rem',
                            letterSpacing: '0.02em',
                        }}
                    >
                        Панель управления
                    </h1>

                    <p
                        style={{
                            textAlign: 'center',
                            fontSize: '0.9rem',
                            color: '#999',
                            marginBottom: '2rem',
                            fontWeight: 300,
                        }}
                    >
                        Введите данные для входа
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="login-input-wrapper">
                            <input
                                className="login-input"
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError('');
                                }}
                                autoFocus
                            />
                        </div>

                        <div className="login-input-wrapper">
                            <input
                                className="login-input"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Пароль"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {error && <div className="login-error">{error}</div>}

                        <button type="submit" className="login-btn" disabled={loading || !email || !password}>
                            {loading && <span className="spinner" />}
                            {loading ? 'Вход...' : 'Войти'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};
