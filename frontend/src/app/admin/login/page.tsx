"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Container,
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    Paper
} from '@mui/material';
import Cookies from 'js-cookie';

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const adminUserId = Cookies.get('adminUserId');
        if (adminUserId) {
            // Verify if user is admin
            const verifyAdmin = async () => {
                try {
                    const response = await fetch(`http://localhost:8000/get-user-info?user_id=${adminUserId}`);
                    const data = await response.json();
                    if (data.status === 'success' && data.user.is_admin) {
                        router.push('/admin/dashboard');
                    }
                } catch (err) {
                    console.error('Error verifying admin status:', err);
                }
            };
            verifyAdmin();
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(`http://localhost:8000/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.status === 'success') {
                if (data.user.is_admin) {
                    Cookies.set('adminUserId', data.user.id.toString());
                    router.push('/admin/dashboard');
                } else {
                    setError('Bạn không có quyền truy cập trang admin');
                }
            } else {
                setError(data.message || 'Đăng nhập thất bại');
            }
        } catch (err) {
            setError('Có lỗi xảy ra khi đăng nhập');
        }
    };

    if (!mounted) {
        return null;
    }

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        Đăng nhập Admin
                    </Typography>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Mật khẩu"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Đăng nhập
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
} 