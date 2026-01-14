import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, IconButton, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VetLayout from '../components/VetLayout';
import { useAuth } from '../context/AuthContext';

const VetAnimalLost = () => {
  const { microchip } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    lostDate: '',
    lostLocation: '',
    circumstances: '',
    ownerContact: '',
    notes: ''
  });

  useEffect(() => {
    const fetchAnimal = async () => {
      try {
        const res = await fetch(`http://localhost:8000/pets?microchip=${microchip}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAnimal(data[0]);
        }
      } catch (e) {
        console.error('Error fetching animal:', e);
      }
      setLoading(false);
    };
    fetchAnimal();

    const loadedDraft = localStorage.getItem('loadedDraft');
    if (loadedDraft) {
      const draft = JSON.parse(loadedDraft);
      if (draft.type === 'lost') {
        setFormData({
          lostDate: draft.lostDate || '',
          lostLocation: draft.lostLocation || '',
          circumstances: draft.circumstances || '',
          ownerContact: draft.ownerContact || '',
          notes: draft.notes || ''
        });
      }
      localStorage.removeItem('loadedDraft');
    }
  }, [microchip]);

  const handleSubmit = async () => {
    if (!formData.lostDate || !formData.lostLocation) {
      alert('Παρακαλώ συμπληρώστε τα υποχρεωτικά πεδία');
      return;
    }

    const record = {
      microchip,
      petId: animal.id,
      type: 'lost',
      ...formData,
      vetId: user?.id,
      timestamp: new Date().toISOString()
    };
    
    try {
      const res = await fetch('http://localhost:8000/animal-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      
      if (res.ok) {
        alert('Η δήλωση απώλειας καταχωρήθηκε επιτυχώς!');
        navigate(-1);
      } else {
        alert('Σφάλμα κατά την αποθήκευση');
      }
    } catch (e) {
      console.error('Error saving:', e);
      alert('Σφάλμα σύνδεσης με τον server');
    }
  };

  const handleSaveDraft = () => {
    const draft = {
      id: Date.now(),
      microchip,
      type: 'lost',
      ...formData,
      savedAt: new Date().toISOString()
    };
    
    const drafts = JSON.parse(localStorage.getItem('animalServiceDrafts') || '[]');
    drafts.push(draft);
    localStorage.setItem('animalServiceDrafts', JSON.stringify(drafts));
    
    alert('Το πρόχειρο αποθηκεύτηκε!');
    navigate(-1);
  };

  if (loading) {
    return (
      <VetLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </VetLayout>
    );
  }

  if (!animal) {
    return (
      <VetLayout>
        <Box sx={{ p: 4 }}>
          <Typography>Δεν βρέθηκε ζώο με αυτό το microchip.</Typography>
        </Box>
      </VetLayout>
    );
  }

  return (
    <VetLayout>
      <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">
            Δήλωση Απώλειας: {animal.name} - {microchip}
          </Typography>
        </Box>

        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <TextField
            fullWidth
            required
            label="Ημερομηνία Απώλειας"
            type="date"
            value={formData.lostDate}
            onChange={(e) => setFormData({...formData, lostDate: e.target.value})}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            required
            label="Τοποθεσία Απώλειας"
            value={formData.lostLocation}
            onChange={(e) => setFormData({...formData, lostLocation: e.target.value})}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Περιστατικό Απώλειας"
            value={formData.circumstances}
            onChange={(e) => setFormData({...formData, circumstances: e.target.value})}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Στοιχεία Επικοινωνίας Ιδιοκτήτη"
            value={formData.ownerContact}
            onChange={(e) => setFormData({...formData, ownerContact: e.target.value})}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Σημειώσεις"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={handleSubmit} sx={{ flex: 1 }}>
              Υποβολή
            </Button>
            <Button variant="outlined" onClick={handleSaveDraft} sx={{ flex: 1 }}>
              Αποθήκευση Προχείρου
            </Button>
          </Box>
        </Paper>
      </Box>
    </VetLayout>
  );
};

export default VetAnimalLost;
