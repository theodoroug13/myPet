import { Typography, Grid, Card, CardActionArea, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import OwnerLayout from '../components/OwnerLayout'; 


import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
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
      path: '/owner-pets', 
      desc: 'Δες τα στοιχεία και το βιβλιάριο υγείας των κατοικιδίων σου.' 
    },
    { 
      text: 'Ραντεβού', 
      icon: <CalendarMonthIcon />, 
      path: '/owner-appointments', 
      desc: 'Κλείσε νέο ραντεβού ή δες τα επερχόμενα.' 
    },
    { 
      text: 'Ο Κτηνίατρός μου', 
      icon: <MedicalServicesOutlinedIcon/>, 
      path: '/my-vet', 
      desc: 'Βρες τον κατάλληλο κτηνίατρο για το κατοικίδιό σου.' 
    },
    { 
      text: 'Δηλώσεις', 
      icon: <EditNoteIcon />, 
      path: '/my-diloseis', 
      desc: 'Δες τις δηλώσεις σου, ή κάνε μια νέα δήλωση απώλειας ή εύρεσης.' 
    },
    { 
      text: 'Βρήκα ένα χαμένο κατοικίδιο', 
      icon: <SearchOutlinedIcon />, 
      path: '/lost-pets', 
      desc: 'Βρήκες ένα ζωάκι; Δες τη λίστα με τα δηλωμένα χαμένα ζώα.' 
    }
  ];

  return (
    <OwnerLayout> 
        
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

    </OwnerLayout>
  );
};

export default Dashboard;