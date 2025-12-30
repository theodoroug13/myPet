import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, IconButton, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VetLayout from '../components/VetLayout';
import { useAuth } from '../context/AuthContext';
import VetConfirmed from './VetConfirmed';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const VetAppointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [view, setView] = useState('menu'); 
  const [pendingApps, setPendingApps] = useState([]);

  useEffect(() => {
    if (user && view === 'pending') {
      fetch('http://localhost:8000/appointments')
        .then(res => res.json())
        .then(data => {
          const myPending = data.filter(app => app.vetId === user.id && app.status === 'pending');
          setPendingApps(myPending);
        });
    }
  }, [user, view]);

  const handleStatusChange = async (id, newStatus) => {
      await fetch(`http://localhost:8000/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setPendingApps(pendingApps.filter(app => app.id !== id));
  };

  if (view === 'menu') {
    return (
      <VetLayout>
        <Box sx={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
                <Typography variant="h4" fontWeight="bold" sx={{ ml: 2 }}>Διαχείριση Ραντεβού</Typography>
            </Box>

            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Card 
                        onClick={() => setView('confirmed')}
                        sx={{ cursor: 'pointer', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', '&:hover': { bgcolor: '#f0faff', transform: 'scale(1.02)' }, transition: '0.3s' }}
                    >
                        <Box>
                            <EventAvailableIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                            <Typography variant="h5" fontWeight="bold">Επιβεβαιωμένα</Typography>
                            <Typography color="text.secondary">Προβολή Ημερολογίου</Typography>
                        </Box>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card 
                        onClick={() => setView('pending')}
                        sx={{ cursor: 'pointer', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', '&:hover': { bgcolor: '#fff0f0', transform: 'scale(1.02)' }, transition: '0.3s' }}
                    >
                        <Box>
                            <PendingActionsIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
                            <Typography variant="h5" fontWeight="bold">Εκκρεμή</Typography>
                            <Typography color="text.secondary">Αιτήματα για Έγκριση</Typography>
                        </Box>
                    </Card>
                </Grid>
            </Grid>
        </Box>
      </VetLayout>
    );
  }

  if (view === 'confirmed') {
      return (
          <VetLayout>
              <Box sx={{ maxWidth: 1000, margin: '0 auto' }}>
                  <VetConfirmed onBack={() => setView('menu')} />
              </Box>
          </VetLayout>
      );
  }

  return (
    <VetLayout>
      <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <IconButton onClick={() => setView('menu')}><ArrowBackIcon /></IconButton>
            <Typography variant="h4" fontWeight="bold" sx={{ ml: 2 }}>Εκκρεμή Ραντεβού</Typography>
        </Box>

        {pendingApps.length > 0 ? (
            pendingApps.map((appt) => (
                <Card key={appt.id} sx={{ mb: 2, borderLeft: '6px solid orange' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6">{appt.date} - {appt.time}</Typography>
                            <Chip label="Εκκρεμεί" color="warning" size="small" />
                        </Box>
                        <Typography variant="body1" fontWeight="bold" sx={{ mt: 1 }}>{appt.petName} ({appt.details})</Typography>
                        <Typography variant="body2" color="text.secondary">Αιτία: {appt.reason}</Typography>
                        
                        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                            <Button variant="contained" color="success" onClick={() => handleStatusChange(appt.id, 'confirmed')} startIcon={<CheckCircleIcon />}>
                                Αποδοχή
                            </Button>
                            <Button variant="outlined" color="error" onClick={() => handleStatusChange(appt.id, 'cancelled')} startIcon={<CancelIcon />}>
                                Απόρριψη
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            ))
        ) : (
            <Typography color="text.secondary">Δεν υπάρχουν εκκρεμή αιτήματα.</Typography>
        )}
      </Box>
    </VetLayout>
  );
};

export default VetAppointments;