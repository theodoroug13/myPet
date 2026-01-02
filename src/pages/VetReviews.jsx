import { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Grid, Rating, Avatar, Button, 
    TextField, Dialog, DialogTitle, DialogContent, DialogActions, 
    CircularProgress, Card, CardContent, Alert, Stack, IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VetLayout from '../components/VetLayout';
import { useAuth } from '../context/AuthContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReplyIcon from '@mui/icons-material/Reply';

const VetReviews = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ average: 0, total: 0 });
    
    const [replyDialog, setReplyDialog] = useState({ open: false, reviewId: null, text: '' });

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [reviewsRes, usersRes] = await Promise.all([
                fetch('http://localhost:8000/reviews'),
                fetch('http://localhost:8000/users')
            ]);

            const allReviews = await reviewsRes.json();
            const allUsers = await usersRes.json();

            if (Array.isArray(allReviews)) {
                // Φιλτράρισμα κριτικών μόνο για τον συγκεκριμένο γιατρό
                const myReviews = allReviews
                    .filter(r => r.vetId == user.id)
                    .map(review => {
                        const owner = allUsers.find(u => u.id == review.ownerId);
                        return {
                            ...review,
                            ownerName: owner ? owner.fullName : 'Άγνωστος Χρήστης'
                        };
                    });

                // Ταξινόμηση: Οι πιο πρόσφατες πρώτα
                myReviews.sort((a, b) => new Date(b.date) - new Date(a.date));

                setReviews(myReviews);
                calculateStats(myReviews);
            }
        } catch (error) {
            console.error("Σφάλμα φόρτωσης:", error);
        }
        setLoading(false);
    };

    const calculateStats = (data) => {
        if (data.length === 0) {
            setStats({ average: 0, total: 0 });
            return;
        }
        const totalRating = data.reduce((sum, r) => sum + Number(r.rating), 0);
        const avg = (totalRating / data.length).toFixed(1);
        setStats({ average: avg, total: data.length });
    };

    const handleOpenReply = (review) => {
        setReplyDialog({ open: true, reviewId: review.id, text: review.reply || '' });
    };

    const handleSendReply = async () => {
        if (!replyDialog.text.trim()) return;

        try {
            await fetch(`http://localhost:8000/reviews/${replyDialog.reviewId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reply: replyDialog.text })
            });

            const updatedReviews = reviews.map(r => 
                r.id === replyDialog.reviewId ? { ...r, reply: replyDialog.text } : r
            );
            setReviews(updatedReviews);
            setReplyDialog({ open: false, reviewId: null, text: '' });

        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <VetLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                    <CircularProgress />
                </Box>
            </VetLayout>
        );
    }

    return (
        <VetLayout>
            <Box sx={{ maxWidth: 1000, margin: '0 auto' }}>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ mr: 2, bgcolor: '#f5f5f5' }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: '#2c3e50' }}>
                        Αξιολογήσεις Πελατών
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* Αριστερά: Στατιστικά */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ borderRadius: 3, textAlign: 'center', p: 2, bgcolor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                            <CardContent>
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    Συνολική Βαθμολογία
                                </Typography>
                                <Typography variant="h2" fontWeight="bold" color="primary">
                                    {stats.average}
                                </Typography>
                                <Rating value={Number(stats.average)} precision={0.5} readOnly size="large" sx={{ my: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                    Βάσει {stats.total} αξιολογήσεων
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Δεξιά: Λίστα Κριτικών */}
                    <Grid item xs={12} md={8}>
                        <Stack spacing={2}>
                            {reviews.length === 0 ? (
                                <Alert severity="info">Δεν υπάρχουν ακόμα αξιολογήσεις.</Alert>
                            ) : (
                                reviews.map((review) => (
                                    <Paper key={review.id} sx={{ p: 3, borderRadius: 3, position: 'relative' }} elevation={1}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{ bgcolor: '#1976d2' }}>
                                                    {review.ownerName ? review.ownerName.charAt(0) : '?'}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        {review.ownerName}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {review.date}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Rating value={Number(review.rating)} readOnly size="small" />
                                        </Box>

                                        <Typography variant="body1" sx={{ mb: 2, color: '#333' }}>
                                            "{review.comment}"
                                        </Typography>

                                        {review.reply ? (
                                            <Box sx={{ bgcolor: '#f5f7fa', p: 2, borderRadius: 2, mt: 2, borderLeft: '4px solid #1976d2' }}>
                                                <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 0.5 }}>
                                                    Η απάντησή σας:
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {review.reply}
                                                </Typography>
                                                <Button 
                                                    size="small" 
                                                    sx={{ mt: 1, textTransform: 'none' }} 
                                                    onClick={() => handleOpenReply(review)}
                                                >
                                                    Επεξεργασία
                                                </Button>
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                                <Button 
                                                    variant="outlined" 
                                                    startIcon={<ReplyIcon />} 
                                                    onClick={() => handleOpenReply(review)}
                                                    size="small"
                                                >
                                                    Απάντηση
                                                </Button>
                                            </Box>
                                        )}
                                    </Paper>
                                ))
                            )}
                        </Stack>
                    </Grid>
                </Grid>

                <Dialog open={replyDialog.open} onClose={() => setReplyDialog({ ...replyDialog, open: false })} fullWidth maxWidth="sm">
                    <DialogTitle>Απάντηση στην αξιολόγηση</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Το σχόλιό σας"
                            type="text"
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            value={replyDialog.text}
                            onChange={(e) => setReplyDialog({ ...replyDialog, text: e.target.value })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setReplyDialog({ ...replyDialog, open: false })}>Ακύρωση</Button>
                        <Button onClick={handleSendReply} variant="contained">Αποστολή</Button>
                    </DialogActions>
                </Dialog>

            </Box>
        </VetLayout>
    );
};

export default VetReviews;