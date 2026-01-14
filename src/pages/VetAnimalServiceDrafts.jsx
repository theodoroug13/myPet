import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VetLayout from '../components/VetLayout';

const VetAnimalServiceDrafts = () => {
  const { microchip } = useParams();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState(null);
  const [drafts, setDrafts] = useState([]);

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
    };
    fetchAnimal();

    // Load drafts from localStorage
    const allDrafts = JSON.parse(localStorage.getItem('animalServiceDrafts') || '[]');
    const animalDrafts = allDrafts.filter(d => d.microchip === microchip);
    setDrafts(animalDrafts);
  }, [microchip]);

  const handleDelete = (draftId) => {
    if (!window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το πρόχειρο;')) return;
    
    const allDrafts = JSON.parse(localStorage.getItem('animalServiceDrafts') || '[]');
    const updated = allDrafts.filter(d => d.id !== draftId);
    localStorage.setItem('animalServiceDrafts', JSON.stringify(updated));
    
    setDrafts(drafts.filter(d => d.id !== draftId));
  };

  const handleLoad = (draft) => {
    localStorage.setItem('loadedDraft', JSON.stringify(draft));
    
    const typeRoutes = {
      'found': `/vet/animal-services/found/${microchip}`,
      'medical_action': `/vet/animal-services/medical-action/${microchip}`,
      'lost': `/vet/animal-services/lost/${microchip}`,
      'transfer': `/vet/animal-services/update-transfer/${microchip}`,
      'foster': `/vet/animal-services/update-foster/${microchip}`,
      'adoption': `/vet/animal-services/adoption/${microchip}`
    };
    
    navigate(typeRoutes[draft.type] || -1);
  };

  const getTypeLabel = (type) => {
    const labels = {
      'found': 'Εύρεση',
      'medical_action': 'Ιατρική πράξη',
      'lost': 'Απώλεια',
      'transfer': 'Μεταβίβαση',
      'foster': 'Αναδοχή',
      'adoption': 'Υιοθεσία'
    };
    return labels[type] || type;
  };

  if (!animal) {
    return (
      <VetLayout>
        <Box sx={{ p: 4 }}>
          <Typography>Φόρτωση...</Typography>
        </Box>
      </VetLayout>
    );
  }

  return (
    <VetLayout>
      <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">
            Πρόχειρες Ενημερώσεις: {animal.name} - {microchip}
          </Typography>
        </Box>

        {drafts.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Typography>Δεν υπάρχουν αποθηκευμένα πρόχειρα για αυτό το ζώο.</Typography>
          </Paper>
        ) : (
          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Τύπος</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Ημερομηνία Αποθήκευσης</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Ενέργειες</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {drafts.map((draft) => (
                    <TableRow key={draft.id} hover>
                      <TableCell>{getTypeLabel(draft.type)}</TableCell>
                      <TableCell>{new Date(draft.savedAt).toLocaleString('el-GR')}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleLoad(draft)} color="primary" size="small" title="Φόρτωση">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(draft.id)} color="error" size="small" title="Διαγραφή">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    </VetLayout>
  );
};

export default VetAnimalServiceDrafts;
