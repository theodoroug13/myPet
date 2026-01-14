import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, IconButton, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VetLayout from '../components/VetLayout';
import { useAuth } from '../context/AuthContext';

const VetAnimalFound = () => {
  const { microchip } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    foundDate: '',
    foundLocation: '',
    finderName: '',
    finderPhone: '',
    condition: '',
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

    // Load draft if exists
    const loadedDraft = localStorage.getItem('loadedDraft');
    if (loadedDraft) {
      const draft = JSON.parse(loadedDraft);
      if (draft.type === 'found') {
        setFormData({
          foundDate: draft.foundDate || '',
          foundLocation: draft.foundLocation || '',
          finderName: draft.finderName || '',
          finderPhone: draft.finderPhone || '',
          condition: draft.condition || '',
          notes: draft.notes || ''
        });
      }
      localStorage.removeItem('loadedDraft');
    }
  }, [microchip]);

  const handleSubmit = async () => {
    if (!formData.foundDate || !formData.foundLocation) {
      alert('Παρακαλώ συμπληρώστε τα υποχρεωτικά πεδία');
      return;
    }

    const record = {
      microchip,
      petId: animal.id,
      type: 'found',
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
        alert('Η δήλωση εύρεσης καταχωρήθηκε επιτυχώς!');
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
      type: 'found',
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
            Εύρεση: {animal.name} - {microchip}
          </Typography>
        </Box>

        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <TextField
            fullWidth
            required
            label="Ημερομηνία Εύρεσης"
            type="date"
            value={formData.foundDate}
            onChange={(e) => setFormData({...formData, foundDate: e.target.value})}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 3 }}
          />
          
          <TextField
            fullWidth
            required
            label="Τοποθεσία Εύρεσης"
            value={formData.foundLocation}
            onChange={(e) => setFormData({...formData, foundLocation: e.target.value})}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Όνομα Ευρέτη"
            value={formData.finderName}
            onChange={(e) => setFormData({...formData, finderName: e.target.value})}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Τηλέφωνο Ευρέτη"
            value={formData.finderPhone}
            onChange={(e) => setFormData({...formData, finderPhone: e.target.value})}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Κατάσταση Ζώου"
            value={formData.condition}
            onChange={(e) => setFormData({...formData, condition: e.target.value})}
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

export default VetAnimalFound;
