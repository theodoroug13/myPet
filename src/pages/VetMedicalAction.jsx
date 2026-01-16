import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, IconButton, MenuItem, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VetLayout from '../components/VetLayout';
import { useAuth } from '../context/AuthContext';

const VetMedicalAction = () => {
  const { microchip } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    actionDate: '',
    actionType: '',
    description: '',
    medication: '',
    dosage: '',
    nextAppointment: '',
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
      if (draft.type === 'medical_action') {
        setFormData({
          actionDate: draft.actionDate || '',
          actionType: draft.actionType || '',
          description: draft.description || '',
          medication: draft.medication || '',
          dosage: draft.dosage || '',
          nextAppointment: draft.nextAppointment || '',
          notes: draft.notes || ''
        });
      }
      localStorage.removeItem('loadedDraft');
    }
  }, [microchip]);

  const actionTypes = [
    'Εμβολιασμός',
    'Εξέταση',
    'Χειρουργείο',
    'Θεραπεία',
    'Προληπτικός Έλεγχος',
    'Άλλο'
  ];

const handleSubmit = async () => {
  if (!formData.actionDate || !formData.actionType) {
    alert('Παρακαλώ συμπληρώστε τα υποχρεωτικά πεδία');
    return;
  }

  const record = {
    microchip,
    type: 'medical_action',
    ...formData,
    vetId: user?.id,
    vetName: user?.name,
    timestamp: new Date().toISOString()
  };
  
  try {
    const res = await fetch('http://localhost:8000/animal-services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    
    if (res.ok) {
      alert('Η ιατρική πράξη καταχωρήθηκε επιτυχώς!');
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
      type: 'medical_action',
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
            Νέα Ιατρική Πράξη: {animal.name} - {microchip}
          </Typography>
        </Box>

        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <TextField
            fullWidth
            required
            label="Ημερομηνία Πράξης"
            type="date"
            value={formData.actionDate}
            onChange={(e) => setFormData({...formData, actionDate: e.target.value})}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            required
            select
            label="Τύπος Πράξης"
            value={formData.actionType}
            onChange={(e) => setFormData({...formData, actionType: e.target.value})}
            sx={{ mb: 3 }}
          >
            {actionTypes.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Περιγραφή Πράξης"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Φάρμακα/Θεραπεία"
            value={formData.medication}
            onChange={(e) => setFormData({...formData, medication: e.target.value})}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Δοσολογία"
            value={formData.dosage}
            onChange={(e) => setFormData({...formData, dosage: e.target.value})}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Επόμενο Ραντεβού"
            type="date"
            value={formData.nextAppointment}
            onChange={(e) => setFormData({...formData, nextAppointment: e.target.value})}
            InputLabelProps={{ shrink: true }}
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

export default VetMedicalAction;
