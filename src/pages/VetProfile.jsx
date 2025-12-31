import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, TextField, Card, CardContent, Avatar, Divider, Stack, IconButton, Rating, Paper, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VetLayout from '../components/VetLayout';
import { useAuth } from '../context/AuthContext';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const VetProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [recentReviews, setRecentReviews] = useState([]);
  
  // Προσθήκη state για τον Μέσο Όρο και το Πλήθος
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviewsCount, setTotalReviewsCount] = useState(0);

  const [formData, setFormData] = useState({
    fullName: '',
    specialty: '',
    phone: '',
    email: '',
    address: '',
    bio: '',
    education: '',
    hours: '',
    photo: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        specialty: user.specialty || '',
        phone: user.phone || '',
        email: user.email || '',
        address: user.address || '',
        bio: user.bio || '',
        education: user.education || '',
        hours: user.hours || '',
        photo: user.photo || ''
      });
      fetchReviews();
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
        const [reviewsRes, usersRes] = await Promise.all([
            fetch('http://localhost:8000/reviews'),
            fetch('http://localhost:8000/users')
        ]);
        const reviewsData = await reviewsRes.json();
        const usersData = await usersRes.json();

        if (Array.isArray(reviewsData)) {
            // Φιλτράρισμα reviews για τον συγκεκριμένο κτηνίατρο
            const myReviews = reviewsData
                .filter(r => r.vetId == user.id)
                .map(review => {
                    const owner = usersData.find(u => u.id == review.ownerId);
                    return {
                        ...review,
                        ownerName: owner ? owner.fullName : 'Άγνωστος'
                    };
                });

            if (myReviews.length > 0) {
                const totalRating = myReviews.reduce((acc, r) => acc + Number(r.rating), 0);
                const avg = (totalRating / myReviews.length).toFixed(1); // π.χ. 4.8
                setAverageRating(avg);
                setTotalReviewsCount(myReviews.length);
            } else {
                setAverageRating(0);
                setTotalReviewsCount(0);
            }

            // Ταξινόμηση και εμφάνιση των 2 πιο πρόσφατων
            myReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
            setRecentReviews(myReviews.slice(0, 2));
        }
    } catch (error) {
        console.error(error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    if (isEditing) fileInputRef.current.click();
  };

  const handleSave = async () => {
    if (!user || !user.id) return;
    try {
      await fetch(`http://localhost:8000/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const primaryColor = '#1976d2'; 
  const cardStyle = {
      boxShadow: '0 8px 24px rgba(149, 157, 165, 0.2)',
      borderRadius: '20px',
      border: '1px solid rgba(0,0,0,0.05)',
      height: '100%',
      overflow: 'visible'
  };

  const iconBoxStyle = {
      bgcolor: `${primaryColor}15`,
      p: 1,
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      mr: 2,
      color: primaryColor
  };

  return (
    <VetLayout>
      <Box sx={{ maxWidth: '100%', margin: '0 auto', p: 1 }}>
        
        {/* Header με Back Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ mr: 2, bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', '&:hover': { bgcolor: '#f5f5f5' } }}>
                <ArrowBackIcon sx={{ color: '#333' }} />
            </IconButton>
            <Typography variant="h5" fontWeight="800" sx={{ color: '#1a1a1a' }}>Το Προφίλ Μου</Typography>
        </Box>

        {/* --- MAIN LAYOUT (FLEXBOX) --- */}
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3, alignItems: 'stretch' }}>
            
            {/* --- LEFT COLUMN: CARD --- */}
            <Box sx={{ flex: '0 0 320px', minWidth: 0 }}> 
                <Card sx={cardStyle}>
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
                        
                        {/* Avatar */}
                        <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                            <Box sx={{ 
                                p: 0.5, 
                                borderRadius: '50%', 
                                border: `2px dashed ${primaryColor}`,
                                display: 'inline-block'
                            }}>
                                <Avatar 
                                    src={formData.photo} 
                                    sx={{ 
                                        width: 140, height: 140, 
                                        bgcolor: '#f5f5f5', 
                                        cursor: isEditing ? 'pointer' : 'default',
                                        border: '4px solid white',
                                        boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                                    }}
                                    onClick={handleAvatarClick}
                                >
                                    {!formData.photo && <EditIcon sx={{ fontSize: 40, color: '#ccc' }} />}
                                </Avatar>
                            </Box>
                            {isEditing && (
                                <Box sx={{ position: 'absolute', bottom: 10, right: 10, bgcolor: primaryColor, borderRadius: '50%', p: 1, border: '3px solid white', boxShadow: 1 }}>
                                    <PhotoCameraIcon sx={{ color: 'white', fontSize: 20 }} />
                                </Box>
                            )}
                        </Box>

                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>{formData.fullName || 'Όνομα Χρήστη'}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{formData.specialty || 'Ειδικότητα'}</Typography>

                        <Divider sx={{ mb: 3, opacity: 0.6 }} />

                        {/* Contact Info */}
                        <Stack spacing={2.5} sx={{ textAlign: 'left' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ ...iconBoxStyle, width: 36, height: 36 }}> <PhoneIcon fontSize="small" /> </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" display="block">Τηλέφωνο</Typography>
                                    {isEditing ? <TextField size="small" fullWidth variant="standard" name="phone" value={formData.phone} onChange={handleChange} /> : <Typography variant="body2" fontWeight="500">{formData.phone || '-'}</Typography>}
                                </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ ...iconBoxStyle, width: 36, height: 36 }}> <EmailIcon fontSize="small" /> </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" display="block">Email</Typography>
                                    {isEditing ? <TextField size="small" fullWidth variant="standard" name="email" value={formData.email} onChange={handleChange} /> : <Typography variant="body2" fontWeight="500" sx={{ wordBreak: 'break-all' }}>{formData.email || '-'}</Typography>}
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ ...iconBoxStyle, width: 36, height: 36 }}> <LocationOnIcon fontSize="small" /> </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" display="block">Διεύθυνση</Typography>
                                    {isEditing ? <TextField size="small" fullWidth variant="standard" name="address" value={formData.address} onChange={handleChange} /> : <Typography variant="body2" fontWeight="500">{formData.address || '-'}</Typography>}
                                </Box>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>

            {/* --- RIGHT COLUMN: INFO --- */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Card sx={cardStyle}>
                    <CardContent sx={{ p: 4 }}>
                        
                        {/* Header Section */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                            <Box sx={{ width: '100%' }}>
                                {isEditing ? (
                                    <>
                                        <TextField fullWidth name="fullName" label="Ονοματεπώνυμο" value={formData.fullName} onChange={handleChange} sx={{ mb: 2 }} />
                                        <TextField fullWidth name="specialty" label="Ειδικότητα" value={formData.specialty} onChange={handleChange} />
                                    </>
                                ) : (
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Typography variant="h3" fontWeight="800" sx={{ color: '#2c3e50', fontSize: '2rem' }}>
                                                {formData.fullName}
                                            </Typography>
                                            <VerifiedUserIcon sx={{ ml: 1, color: primaryColor }} />
                                        </Box>
                                        <Typography variant="h6" sx={{ color: primaryColor, fontWeight: '500', opacity: 0.9 }}>
                                            {formData.specialty}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                            
                            <Box sx={{ ml: 3 }}>
                                {!isEditing ? (
                                    <Button 
                                        variant="outlined" 
                                        startIcon={<EditIcon />} 
                                        onClick={() => setIsEditing(true)} 
                                        sx={{ 
                                            borderRadius: '50px', 
                                            textTransform: 'none', 
                                            px: 3, 
                                            fontWeight: 'bold',
                                            borderColor: '#e0e0e0',
                                            color: '#555',
                                            '&:hover': { borderColor: primaryColor, color: primaryColor, bgcolor: `${primaryColor}08` }
                                        }}
                                    >
                                        Επεξεργασία
                                    </Button>
                                ) : (
                                    <Stack direction="row" spacing={1}>
                                        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} sx={{ borderRadius: '50px', textTransform: 'none', boxShadow: 'none' }}>Αποθήκευση</Button>
                                        <Button variant="outlined" color="error" startIcon={<CancelIcon />} onClick={() => setIsEditing(false)} sx={{ borderRadius: '50px', textTransform: 'none' }}>Ακύρωση</Button>
                                    </Stack>
                                )}
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 4, opacity: 0.6 }} />

                        {/* Βιογραφικό */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Σχετικά με τον Γιατρό</Typography>
                            {isEditing ? (
                                <TextField multiline rows={4} fullWidth name="bio" value={formData.bio} onChange={handleChange} placeholder="Γράψε το βιογραφικό σου..." variant="outlined" sx={{ bgcolor: '#f9f9f9' }} />
                            ) : (
                                <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
                                    {formData.bio || 'Δεν έχει προστεθεί βιογραφικό.'}
                                </Typography>
                            )}
                        </Box>

                        {/* Σπουδές */}
                        <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start' }}>
                            <Box sx={iconBoxStyle}> <SchoolIcon /> </Box>
                            <Box sx={{ width: '100%' }}>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>Σπουδές & Πιστοποιήσεις</Typography>
                                {isEditing ? (
                                    <TextField multiline rows={3} fullWidth name="education" value={formData.education} onChange={handleChange} variant="outlined" sx={{ bgcolor: '#f9f9f9' }} />
                                ) : (
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: 'text.secondary', lineHeight: 1.6 }}>
                                        {formData.education || '-'}
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        {/* Ώρες */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <Box sx={iconBoxStyle}> <AccessTimeIcon /> </Box>
                            <Box sx={{ width: '100%' }}>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>Ωράριο Λειτουργίας</Typography>
                                {isEditing ? (
                                    <TextField multiline rows={2} fullWidth name="hours" value={formData.hours} onChange={handleChange} variant="outlined" sx={{ bgcolor: '#f9f9f9' }} />
                                ) : (
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: 'text.secondary', fontWeight: 500 }}>
                                        {formData.hours || '-'}
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                    </CardContent>
                </Card>
            </Box>

        </Box>

        {/* --- REVIEWS SECTION --- */}
        <Box sx={{ mt: 3 }}>
            <Card sx={cardStyle}>
                <CardContent sx={{ p: 4 }}>
                    
                    {/* Τίτλος με Μέσο Όρο */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ ...iconBoxStyle, color: '#fbc02d', bgcolor: '#fff9c4' }}> <StarIcon /> </Box>
                            
                            <Box>
                                <Typography variant="h6" fontWeight="bold">Τελευταίες Αξιολογήσεις</Typography>
                                
                                {/* ΕΔΩ ΜΠΗΚΕ Ο ΜΕΣΟΣ ΟΡΟΣ */}
                                {Number(totalReviewsCount) > 0 && (
                                     <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                         <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a1a1a', mr: 1, lineHeight: 1 }}>
                                             {averageRating}
                                         </Typography>
                                         <Rating value={Number(averageRating)} precision={0.5} readOnly size="small" sx={{ mr: 1 }} />
                                         <Typography variant="caption" color="text.secondary">
                                             ({totalReviewsCount} αξιολογήσεις)
                                         </Typography>
                                     </Box>
                                )}
                            </Box>
                        </Box>

                        <Button variant="text" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/vet-reviews')} sx={{ fontWeight: 'bold', textTransform: 'none', fontSize: '0.95rem' }}>
                            Προβολή όλων
                        </Button>
                    </Box>

                    {recentReviews.length > 0 ? (
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            {recentReviews.map((review) => (
                                <Paper key={review.id} sx={{ p: 3, borderRadius: '16px', bgcolor: '#f8f9fa', border: '1px solid #eee', boxShadow: 'none' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '1rem' }}>{review.ownerName}</Typography>
                                        <Rating value={Number(review.rating)} readOnly size="small" />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', lineHeight: 1.6 }}>"{review.comment}"</Typography>
                                </Paper>
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                            Δεν υπάρχουν ακόμη αξιολογήσεις.
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Box>

      </Box>
    </VetLayout>
  );
};

export default VetProfile;