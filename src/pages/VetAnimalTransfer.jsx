import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, IconButton, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VetLayout from '../components/VetLayout';
import { useAuth } from '../context/AuthContext';

const VetAnimalTransfer = () => {
  const { microchip } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    transferDate: '',
    newOwnerName: '',
    newOwnerAddress: '',
    newOwnerPhone: '',
    newOwnerEmail: '',
    previousOwnerName: '',
    previousOwnerContact: '',
    notes: ''
  });

  useEffect(() => {
    const fetchAnimal = async () => {
      try {
        const res = await fetch(`http://localhost:8000/pets?microchip=${microchip}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAnimal(data[0]);
          setFormData(prev => ({
            ...prev,
            previousOwnerName: data[0].ownerName || ''
          }));
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
      if (draft.type === 'transfer') {
        setFormData({
          transferDate: draft.transferDate || '',
          newOwnerName: draft.newOwnerName || '',
          newOwnerAddress: draft.newOwnerAddress || '',
          newOwnerPhone: draft.newOwnerPhone || '',
          newOwnerEmail: draft.newOwnerEmail || '',
          previousOwnerName: draft.previousOwnerName || '',
          previousOwnerContact: draft.previousOwnerContact || '',
          notes: draft.notes || ''
        });
      }
      localStorage.removeItem('loadedDraft');
    }
  }, [microchip]);

  const handleSubmit = async () => {
    if (!formData.transferDate || !formData.newOwnerName) {
      alert('Παρακαλώ συμπληρώστε τα υποχρεωτικά πεδία');
      return;
    }

    const record = {
      microchip,
      petId: animal.id,
      type: 'transfer',
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
          body: JSON.stringify({ ownerName: formData.newOwnerName })
        });
        
        alert('Η μεταβίβαση καταχωρήθηκε επιτυχώς!');
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
      type: 'transfer',
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
            Μεταβίβαση: {animal.name} - {microchip}
          </Typography>
        </Box>

        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Στοιχεία Νέου Ιδιοκτήτη</Typography>
          
          <TextField
            fullWidth
            required
            label="Ημερομηνία Μεταβίβασης"
            type="date"
            value={formData.transferDate}
            onChange={(e) => setFormData({...formData, transferDate: e.target.value})}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            required
            label="Όνομα Νέου Ιδιοκτήτη"
            value={formData.newOwnerName}
            onChange={(e) => setFormData({...formData, newOwnerName: e.target.value})}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Διεύθυνση"
            value={formData.newOwnerAddress}
            onChange={(e) => setFormData({...formData, newOwnerAddress: e.target.value})}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Τηλέφωνο"
            value={formData.newOwnerPhone}
            onChange={(e) => setFormData({...formData, newOwnerPhone: e.target.value})}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.newOwnerEmail}
            onChange={(e) => setFormData({...formData, newOwnerEmail: e.target.value})}
            sx={{ mb: 3 }}
          />

          <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>Στοιχεία Προηγούμενου Ιδιοκτήτη</Typography>

          <TextField
            fullWidth
            label="Όνομα Προηγούμενου Ιδιοκτήτη"
            value={formData.previousOwnerName}
            onChange={(e) => setFormData({...formData, previousOwnerName: e.target.value})}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Στοιχεία Επικοινωνίας"
            value={formData.previousOwnerContact}
            onChange={(e) => setFormData({...formData, previousOwnerContact: e.target.value})}
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

export default VetAnimalTransfer;
