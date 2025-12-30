import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, TextField, Grid, Card, CardContent, Avatar, Divider, Stack, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VetLayout from '../components/VetLayout';
import { useAuth } from '../context/AuthContext';

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

const VetProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  
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
    }
  }, [user]);

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
    if (isEditing) {
      fileInputRef.current.click();
    }
  };

  const handleSave = async () => {
    if (!user || !user.id) return;

    try {
      const response = await fetch(`http://localhost:8000/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setIsEditing(false);
        alert("Οι αλλαγές αποθηκεύτηκαν επιτυχώς!");
      } else {
        alert("Προέκυψε σφάλμα κατά την αποθήκευση.");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Αδυναμία σύνδεσης με τον server.");
    }
  };

  return (
    <VetLayout>
      <Box sx={{ maxWidth: 1100, margin: '0 auto' }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: '#f5f5f5', '&:hover': { bgcolor: '#e0e0e0' } }}>
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Το Προφίλ Μου</Typography>
                    <Typography variant="body1" color="text.secondary">
                        Διαχειρίσου τις πληροφορίες που βλέπουν οι ιδιοκτήτες.
                    </Typography>
                </Box>
            </Box>
            
            {!isEditing ? (
                <Button 
                    variant="contained" 
                    startIcon={<EditIcon />} 
                    onClick={() => setIsEditing(true)}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                >
                    Επεξεργασία
                </Button>
            ) : (
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => setIsEditing(false)}>
                        Ακύρωση
                    </Button>
                    <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
                        Αποθήκευση
                    </Button>
                </Stack>
            )}
        </Box>

        <Grid container spacing={4}>
            
            <Grid item xs={12} md={4}>
                <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 3, height: '100%' }}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
                        
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            accept="image/*"
                            onChange={handleFileChange}
                        />

                        <Box sx={{ position: 'relative' }}>
                            <Avatar 
                                src={formData.photo} 
                                sx={{ 
                                    width: 120, 
                                    height: 120, 
                                    mb: 2, 
                                    bgcolor: '#f0f0f0', 
                                    color: '#ccc',
                                    cursor: isEditing ? 'pointer' : 'default',
                                    border: isEditing ? '2px dashed #1976d2' : 'none',
                                    '&:hover': { opacity: isEditing ? 0.7 : 1 }
                                }}
                                onClick={handleAvatarClick}
                            >
                                {!formData.photo && <EditIcon sx={{ fontSize: 40 }} />}
                            </Avatar>
                            {isEditing && (
                                <Box 
                                    sx={{ 
                                        position: 'absolute', 
                                        bottom: 16, 
                                        right: 0, 
                                        bgcolor: 'primary.main', 
                                        borderRadius: '50%', 
                                        p: 0.5,
                                        pointerEvents: 'none'
                                    }}
                                >
                                    <PhotoCameraIcon sx={{ color: 'white', fontSize: 16 }} />
                                </Box>
                            )}
                        </Box>

                        {isEditing && (
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                                Πάτα την εικόνα για αλλαγή
                            </Typography>
                        )}
                        
                        {isEditing ? (
                            <TextField fullWidth name="fullName" label="Ονοματεπώνυμο" value={formData.fullName} onChange={handleChange} sx={{ mb: 2 }} />
                        ) : (
                            <Typography variant="h5" fontWeight="bold" textAlign="center">{formData.fullName}</Typography>
                        )}
                        
                        {isEditing ? (
                            <TextField fullWidth name="specialty" label="Ειδικότητα" value={formData.specialty} onChange={handleChange} sx={{ mb: 2 }} />
                        ) : (
                            <Typography variant="body1" color="primary" fontWeight="500" gutterBottom>{formData.specialty}</Typography>
                        )}

                        <Divider sx={{ width: '100%', my: 3 }} />

                        <Box sx={{ width: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <PhoneIcon color="action" sx={{ mr: 2 }} />
                                {isEditing ? (
                                    <TextField size="small" fullWidth name="phone" label="Τηλέφωνο" value={formData.phone} onChange={handleChange} />
                                ) : (
                                    <Typography>{formData.phone}</Typography>
                                )}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <EmailIcon color="action" sx={{ mr: 2 }} />
                                {isEditing ? (
                                    <TextField size="small" fullWidth name="email" label="Email" value={formData.email} onChange={handleChange} />
                                ) : (
                                    <Typography sx={{ wordBreak: 'break-word' }}>{formData.email}</Typography>
                                )}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <LocationOnIcon color="action" sx={{ mr: 2 }} />
                                {isEditing ? (
                                    <TextField size="small" fullWidth name="address" label="Διεύθυνση" value={formData.address} onChange={handleChange} />
                                ) : (
                                    <Typography>{formData.address}</Typography>
                                )}
                            </Box>
                        </Box>

                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={8}>
                <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 3, p: 2, height: '100%' }}>
                    <CardContent>
                        
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Σχετικά με τον Κτηνίατρο</Typography>
                        {isEditing ? (
                            <TextField multiline rows={4} fullWidth name="bio" value={formData.bio} onChange={handleChange} placeholder="Γράψε το βιογραφικό σου..." />
                        ) : (
                            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.6 }}>
                                {formData.bio}
                            </Typography>
                        )}

                        <Divider sx={{ my: 4 }} />

                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6" fontWeight="bold">Σπουδές</Typography>
                            </Box>
                            
                            {isEditing ? (
                                <TextField multiline rows={3} fullWidth name="education" value={formData.education} onChange={handleChange} />
                            ) : (
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', color: 'text.secondary' }}>
                                    {formData.education}
                                </Typography>
                            )}
                        </Box>

                        <Divider sx={{ my: 4 }} />

                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6" fontWeight="bold">Ώρες Ιατρείου</Typography>
                            </Box>

                            {isEditing ? (
                                <TextField multiline rows={2} fullWidth name="hours" value={formData.hours} onChange={handleChange} />
                            ) : (
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', color: 'text.secondary', fontWeight: 500 }}>
                                    {formData.hours}
                                </Typography>
                            )}
                        </Box>

                    </CardContent>
                </Card>
            </Grid>
        </Grid>
      </Box>
    </VetLayout>
  );
};

export default VetProfile;