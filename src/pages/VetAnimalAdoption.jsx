import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, IconButton, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VetLayout from '../components/VetLayout';
import { useAuth } from '../context/AuthContext';

const VetAnimalAdoption = () => {
  const { microchip } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    adoptionDate: '',
    adopterName: '',
    adopterAddress: '',
    adopterPhone: '',
    adopterEmail: '',
    adoptionFee: '',
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
      if (draft.type === 'adoption') {
        setFormData({
          adoptionDate: draft.adoptionDate || '',
          adopterName: draft.adopterName || '',
          adopterAddress: draft.adopterAddress || '',
          adopterPhone: draft.adopterPhone || '',
          adopterEmail: draft.adopterEmail || '',
          adoptionFee: draft.adoptionFee || '',
          notes: draft.notes || ''
        });
      }
      localStorage.removeItem('loadedDraft');
    }
  }, [microchip]);

  const handleSubmit = async () => {
    if (!formData.adoptionDate || !formData.adopterName) {
      alert('Παρακαλώ συμπληρώστε τα υποχρεωτικά πεδία');
      return;
    }

    const record = {
      microchip,
      petId: animal.id,
      type: 'adoption',
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
        // Update pet's owner in database
        await fetch(`http://localhost:8000/pets/${animal.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ownerName: formData.adopterName })
        });
        
        alert('Η υιοθεσία καταχωρήθηκε επιτυχώς!');
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
      type: 'adoption',
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
            Υιοθεσία: {animal.name} - {microchip}
          </Typography>
        </Box>

        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <TextField
            fullWidth
            required
            label="Ημερομηνία Υιοθεσίας"
            type="date"
            value={formData.adoptionDate}
            onChange={(e) => setFormData({...formData, adoptionDate: e.target.value})}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            required
            label="Όνομα Υιοθέτη"
            value={formData.adopterName}
            onChange={(e) => setFormData({...formData, adopterName: e.target.value})}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Διεύθυνση"
            value={formData.adopterAddress}
            onChange={(e) => setFormData({...formData, adopterAddress: e.target.value})}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Τηλέφωνο"
            value={formData.adopterPhone}
            onChange={(e) => setFormData({...formData, adopterPhone: e.target.value})}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.adopterEmail}
            onChange={(e) => setFormData({...formData, adopterEmail: e.target.value})}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Κόστος Υιοθεσίας (€)"
            type="number"
            value={formData.adoptionFee}
            onChange={(e) => setFormData({...formData, adoptionFee: e.target.value})}
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

export default VetAnimalAdoption;