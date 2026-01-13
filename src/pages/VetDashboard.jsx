import { Typography, Grid, Card, CardActionArea, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VetLayout from '../components/VetLayout'; 

import PetsIcon from '@mui/icons-material/Pets';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';

const VetDashboard = () => {
  const navigate = useNavigate();
  
  const quickActions = [
    { 
      text: 'Το Προφίλ Μου', 
      icon: <PersonIcon />, 
      path: '/vet-profile', 
      desc: 'Επεξεργασία προσωπικού προφίλ' 
    },
    { 
      text: 'Τα Ραντεβού Μου', 
      icon: <CalendarMonthIcon />, 
      path: '/vet-appointments', 
      desc: 'Επιβεβαίωση Ραντεβού Ασθενών' 
    },
    { 
      text: 'Ώρες Εργασίας', 
      icon: <AccessTimeIcon />, 
      path: '/vet-hours', 
      desc: 'Δες τις δεσμευμένες και τις ελεύθερες ώρες της ημέρας' 
    },
    { 
      text: 'Αξιολογήσεις', 
      icon: <StarIcon />, 
      path: '/vet-reviews', 
      desc: 'Αξιολογήσεις Ασθενών' 
    },
    { 
      text: 'Κατοικίδια', 
      icon: <PetsIcon />, 
      path: '/vet-pets', 
      desc: 'Καταγραφή νέων κατοικιδίων και ενημέρωση υφιστάμενων' 
    }
  ];

  return (
    <VetLayout> 
        
        <Box sx={{ mb: 6 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Ιατρείο
            </Typography>
            <Typography variant="body1" color="text.secondary">
                Διαχειρίσου το ιατρείο, τα ραντεβού και τους ασθενείς σου εύκολα.
            </Typography>
        </Box>

        <Grid container spacing={4}>
            {quickActions.map((item) => (
                <Grid item xs={12} sm={6} md={6} lg={4} key={item.text}> 
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

    </VetLayout>
  );
};

export default VetDashboard;