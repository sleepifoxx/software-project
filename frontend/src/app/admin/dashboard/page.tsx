"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
    Box,
    Container,
    Typography,
    Tabs,
    Tab,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import Cookies from 'js-cookie';

// Dynamically import RoomDetailPage with no SSR
const RoomDetailPage = dynamic(() => import('@/components/room-detail-page'), {
    ssr: false
});

interface Post {
    id: number;
    title: string;
    user_id: number;
    status: string;
    is_report: boolean;
    user_email: string;
}

interface Comment {
    id: number;
    post_id: number;
    user_id: number;
    comment: string;
    status: string;
    is_report: boolean;
    user_email: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(0);
    const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
    const [pendingComments, setPendingComments] = useState<Comment[]>([]);
    const [reportedPosts, setReportedPosts] = useState<Post[]>([]);
    const [reportedComments, setReportedComments] = useState<Comment[]>([]);
    const [error, setError] = useState('');
    const [makeAdminDialog, setMakeAdminDialog] = useState(false);
    const [userIdToMakeAdmin, setUserIdToMakeAdmin] = useState('');
    const [previewId, setPreviewId] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const adminUserId = Cookies.get('adminUserId');
        if (!adminUserId) {
            router.push('/admin/login');
            return;
        }

        // Verify if user is admin
        const verifyAdmin = async () => {
            try {
                const response = await fetch(`http://localhost:8000/get-user-info?user_id=${adminUserId}`);
                const data = await response.json();
                if (data.status !== 'success' || !data.user.is_admin) {
                    router.push('/admin/login');
                    return;
                }
                fetchData();
            } catch (err) {
                setError('Có lỗi xảy ra khi xác thực quyền admin');
            }
        };

        verifyAdmin();
    }, [activeTab, mounted]);

    const fetchData = async () => {
        try {
            const adminUserId = Cookies.get("adminUserId")
            if (!adminUserId) {
                router.push("/admin/login")
                return
            }

            const headers = {
                "Authorization": adminUserId
            }

            if (activeTab === 0) {
                const response = await fetch("http://localhost:8000/admin/pending-posts", { headers })
                if (response.status === 401 || response.status === 403) {
                    router.push("/admin/login")
                    return
                }
                const data = await response.json()
                if (data.status === "success") {
                    setPendingPosts(data.posts)
                } else {
                    setError(data.message || "Có lỗi xảy ra khi tải bài đăng chờ duyệt")
                }
            } else if (activeTab === 1) {
                const response = await fetch("http://localhost:8000/admin/pending-comments", { headers })
                if (response.status === 401 || response.status === 403) {
                    router.push("/admin/login")
                    return
                }
                const data = await response.json()
                if (data.status === "success") {
                    setPendingComments(data.comments)
                } else {
                    setError(data.message || "Có lỗi xảy ra khi tải bình luận chờ duyệt")
                }
            } else if (activeTab === 2) {
                const response = await fetch("http://localhost:8000/admin/reported-posts", { headers })
                if (response.status === 401 || response.status === 403) {
                    router.push("/admin/login")
                    return
                }
                const data = await response.json()
                if (data.status === "success") {
                    setReportedPosts(data.posts)
                } else {
                    setError(data.message || "Có lỗi xảy ra khi tải bài đăng bị báo cáo")
                }
            } else if (activeTab === 3) {
                const response = await fetch("http://localhost:8000/admin/reported-comments", { headers })
                if (response.status === 401 || response.status === 403) {
                    router.push("/admin/login")
                    return
                }
                const data = await response.json()
                if (data.status === "success") {
                    setReportedComments(data.comments)
                } else {
                    setError(data.message || "Có lỗi xảy ra khi tải bình luận bị báo cáo")
                }
            }
        } catch (err) {
            console.error("Error fetching data:", err)
            setError("Có lỗi xảy ra khi tải dữ liệu")
        }
    }

    const handleApprove = async (type: "post" | "comment", id: number) => {
        try {
            const adminUserId = Cookies.get("adminUserId")
            if (!adminUserId) {
                router.push("/admin/login")
                return
            }

            const headers = {
                "Content-Type": "application/json",
                "Authorization": adminUserId
            }

            const response = await fetch(`http://localhost:8000/admin/approve-${type}/${id}`, {
                method: "PUT",
                headers
            })
            const data = await response.json()
            if (data.status === "success") {
                fetchData()
            } else {
                setError(data.message || `Có lỗi xảy ra khi duyệt ${type}`)
            }
        } catch (err) {
            setError(`Có lỗi xảy ra khi duyệt ${type}`)
        }
    }

    const handleReject = async (type: "post" | "comment", id: number) => {
        try {
            const adminUserId = Cookies.get("adminUserId")
            if (!adminUserId) {
                router.push("/admin/login")
                return
            }

            const headers = {
                "Content-Type": "application/json",
                "Authorization": adminUserId
            }

            const response = await fetch(`http://localhost:8000/admin/reject-${type}/${id}`, {
                method: "PUT",
                headers
            })
            const data = await response.json()
            if (data.status === "success") {
                fetchData()
            } else {
                setError(data.message || `Có lỗi xảy ra khi từ chối ${type}`)
            }
        } catch (err) {
            setError(`Có lỗi xảy ra khi từ chối ${type}`)
        }
    }

    const handleMakeAdmin = async () => {
        try {
            const adminUserId = Cookies.get("adminUserId")
            if (!adminUserId) {
                router.push("/admin/login")
                return
            }

            const headers = {
                "Content-Type": "application/json",
                "Authorization": adminUserId
            }

            const response = await fetch(`http://localhost:8000/admin/make-admin/${userIdToMakeAdmin}`, {
                method: "PUT",
                headers
            })
            const data = await response.json()
            if (data.status === "success") {
                setMakeAdminDialog(false)
                setUserIdToMakeAdmin("")
                alert("Đã cấp quyền admin thành công")
            } else {
                setError(data.message || "Có lỗi xảy ra khi cấp quyền admin")
            }
        } catch (err) {
            setError("Có lỗi xảy ra khi cấp quyền admin")
        }
    }

    const handleLogout = () => {
        Cookies.remove('adminUserId');
        router.push('/admin/login');
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    if (!mounted) {
        return null;
    }

    if (previewId) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ my: 4 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setPreviewId(null)}
                        sx={{ mb: 2 }}
                    >
                        Quay lại
                    </Button>
                    <RoomDetailPage id={previewId.toString()} />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" component="h1">
                        Trang quản trị
                    </Typography>
                    <Box>
                        <Button variant="contained" color="primary" onClick={() => setMakeAdminDialog(true)} sx={{ mr: 2 }}>
                            Cấp quyền admin
                        </Button>
                        <Button variant="outlined" color="error" onClick={handleLogout}>
                            Đăng xuất
                        </Button>
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Paper sx={{ width: '100%', mb: 2 }}>
                    <Tabs value={activeTab} onChange={handleTabChange}>
                        <Tab label="Bài đăng chờ duyệt" />
                        <Tab label="Bình luận chờ duyệt" />
                        <Tab label="Bài đăng bị báo cáo" />
                        <Tab label="Bình luận bị báo cáo" />
                    </Tabs>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Tiêu đề/Nội dung</TableCell>
                                    <TableCell>Người đăng</TableCell>
                                    <TableCell>Trạng thái</TableCell>
                                    <TableCell>Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {activeTab === 0 &&
                                    pendingPosts.map((post) => (
                                        <TableRow key={post.id}>
                                            <TableCell>{post.id}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => setPreviewId(post.id)}
                                                >
                                                    Xem trước
                                                </Button>
                                            </TableCell>
                                            <TableCell>{post.user_email}</TableCell>
                                            <TableCell>{post.status}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    sx={{ mr: 1 }}
                                                    onClick={() => handleApprove('post', post.id)}
                                                >
                                                    Duyệt
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleReject('post', post.id)}
                                                >
                                                    Từ chối
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                {activeTab === 1 &&
                                    pendingComments.map((comment) => (
                                        <TableRow key={comment.id}>
                                            <TableCell>{comment.id}</TableCell>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2">Bài viết ID: {comment.post_id}</Typography>
                                                    <Typography variant="body2">{comment.comment}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{comment.user_email}</TableCell>
                                            <TableCell>{comment.status}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    sx={{ mr: 1 }}
                                                    onClick={() => handleApprove('comment', comment.id)}
                                                >
                                                    Duyệt
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleReject('comment', comment.id)}
                                                >
                                                    Từ chối
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                {activeTab === 2 &&
                                    reportedPosts.map((post) => (
                                        <TableRow key={post.id}>
                                            <TableCell>{post.id}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => setPreviewId(post.id)}
                                                >
                                                    Xem trước
                                                </Button>
                                            </TableCell>
                                            <TableCell>{post.user_email}</TableCell>
                                            <TableCell>{post.is_report ? "Bị báo cáo" : "Bình thường"}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    sx={{ mr: 1 }}
                                                    onClick={() => handleApprove('post', post.id)}
                                                >
                                                    Duyệt
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleReject('post', post.id)}
                                                >
                                                    Từ chối
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                {activeTab === 3 &&
                                    reportedComments.map((comment) => (
                                        <TableRow key={comment.id}>
                                            <TableCell>{comment.id}</TableCell>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2">Bài viết ID: {comment.post_id}</Typography>
                                                    <Typography variant="body2">{comment.comment}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{comment.user_email}</TableCell>
                                            <TableCell>{comment.is_report ? "Bị báo cáo" : "Bình thường"}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    sx={{ mr: 1 }}
                                                    onClick={() => handleApprove('comment', comment.id)}
                                                >
                                                    Duyệt
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleReject('comment', comment.id)}
                                                >
                                                    Từ chối
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>

            <Dialog open={makeAdminDialog} onClose={() => setMakeAdminDialog(false)}>
                <DialogTitle>Cấp quyền admin</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="User ID"
                        type="number"
                        fullWidth
                        value={userIdToMakeAdmin}
                        onChange={(e) => setUserIdToMakeAdmin(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setMakeAdminDialog(false)}>Hủy</Button>
                    <Button onClick={handleMakeAdmin} color="primary">
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
} 