import { Box, Container, Typography, Grid, Card, CardContent, CardActionArea, Divider, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import OwnerMenu from '../components/OwnerMenu';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Icons για τις κάρτες
import PetsIcon from '@mui/icons-material/Pets';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import EditNoteIcon from '@mui/icons-material/EditNote';

const Dashboard = () => {
  const navigate = useNavigate();

  
  const quickActions = [
    { 
      text: 'Τα Κατοικίδιά μου', 
      icon: <PetsIcon />, 
      path: '/my-pets', 
      desc: 'Δες τα στοιχεία και το βιβλιάριο υγείας των κατοικιδίων σου.' 
    },
    { 
      text: 'Ραντεβού', 
      icon: <CalendarMonthIcon />, 
      path: '/appointments', 
      desc: 'Κλείσε νέο ραντεβού ή δες τα επερχόμενα.' 
    },
    { 
      text: 'Ο Κτηνίατρός μου', 
      icon: <MedicalServicesOutlinedIcon/>, 
      path: '/veterinarian', 
      desc: 'Βρες τον κατάλληλο κτηνίατρο για το κατοικίδιό σου.' 
    },
    { 
      text: 'Δηλώσεις', 
      icon: <EditNoteIcon />, 
      path: '/diloseis', 
      desc: 'Δες τις δηλώσεις σου, ή κάνε μια νέα δήλωση απώλειας ή εύρεσης.' 
    }
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '90vh', bgcolor: '#f4f6f8' }}>
      
      
      <OwnerMenu />

      
      <Box component="main" sx={{ flexGrow: 1, p: 4, overflowY: 'auto' }}>
        <Container maxWidth="lg">
            
            <Box sx={{ mb: 6 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Αρχική
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Διαχειρίσου εύκολα την υγεία και την καθημερινότητα των αγαπημένων σου φίλων.
                </Typography>
            </Box>

            
            <Grid container spacing={4}>
                {quickActions.map((item) => (
                    <Grid item xs={12} sm={6} md={6} lg={3} key={item.text}>
                        <Card sx={{ 
                            height: '100%', 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
                            borderRadius: 3,
                            transition: '0.3s',
                            '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }
                        }}>
                            <CardActionArea 
                                onClick={() => navigate(item.path)} 
                                sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}
                            >
                                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: '50%', mb: 2 }}>
                                    {item.icon}
                                </Box>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    {item.text}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {item.desc}
                                </Typography>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            
            <Box sx={{ mt: 10, mb: 4 }}>
                <Divider sx={{ mb: 6 }} />
                
                <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <InfoOutlinedIcon color="action" />
                            Πώς λειτουργεί το Dashboard;
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemText 
                                    primary="1. Καταχώρηση Ζώου" 
                                    secondary="Ξεκίνα πατώντας 'Τα Ζώα μου' για να δημιουργήσεις την ψηφιακή ταυτότητα του κατοικιδίου σου." 
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText 
                                    primary="2. Ιατρικός Φάκελος" 
                                    secondary="Όλα τα δεδομένα υγείας αποθηκεύονται αυτόματα στο ιστορικό μόλις τα καταχωρήσει ο κτηνίατρος." 
                                />
                            </ListItem>
                        </List>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <Box sx={{ 
                            height: 250, 
                            bgcolor: '#eaeef2', 
                            borderRadius: 4, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            border: '2px dashed #ccc'
                        }}>
                            <Typography variant="button" color="text.secondary">
                                [Γράφημα ή Εικόνα Status]
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;