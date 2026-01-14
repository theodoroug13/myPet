import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, IconButton, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VetLayout from '../components/VetLayout';
import { useAuth } from '../context/AuthContext';

const VetAnimalFoster = () => {
  const { microchip } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fosterDate: '',
    fosterName: '',
    fosterAddress: '',
    fosterPhone: '',
    fosterEmail: '',
    fosterDuration: '',
    conditions: '',
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
      if (draft.type === 'foster') {
        setFormData({
          fosterDate: draft.fosterDate || '',
          fosterName: draft.fosterName || '',
          fosterAddress: draft.fosterAddress || '',
          fosterPhone: draft.fosterPhone || '',
          fosterEmail: draft.fosterEmail || '',
          fosterDuration: draft.fosterDuration || '',
          conditions: draft.conditions || '',
          notes: draft.notes || ''
        });
      }
      localStorage.removeItem('loadedDraft');
    }
  }, [microchip]);

  const handleSubmit = async () => {
    if (!formData.fosterDate || !formData.fosterName) {
      alert('Παρακαλώ συμπληρώστε τα υποχρεωτικά πεδία');
      return;
    }

    const record = {
      microchip,
      petId: animal.id,
      type: 'foster',
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
        alert('Η αναδοχή καταχωρήθηκε επιτυχώς!');
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
      type: 'foster',
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
            Αναδοχή: {animal.name} - {microchip}
          </Typography>
        </Box>

        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <TextField
            fullWidth
            required
            label="Ημερομηνία Αναδοχής"
            type="date"
            value={formData.fosterDate}
            onChange={(e) => setFormData({...formData, fosterDate: e.target.value})}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            required
            label="Όνομα Αναδόχου"
            value={formData.fosterName}
            onChange={(e) => setFormData({...formData, fosterName: e.target.value})}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Διεύθυνση"
            value={formData.fosterAddress}
            onChange={(e) => setFormData({...formData, fosterAddress: e.target.value})}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Τηλέφωνο"
            value={formData.fosterPhone}
            onChange={(e) => setFormData({...formData, fosterPhone: e.target.value})}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.fosterEmail}
            onChange={(e) => setFormData({...formData, fosterEmail: e.target.value})}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Διάρκεια Αναδοχής"
            value={formData.fosterDuration}
            onChange={(e) => setFormData({...formData, fosterDuration: e.target.value})}
            placeholder="π.χ. 6 μήνες"
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Όροι Αναδοχής"
            value={formData.conditions}
            onChange={(e) => setFormData({...formData, conditions: e.target.value})}
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

export default VetAnimalFoster;
