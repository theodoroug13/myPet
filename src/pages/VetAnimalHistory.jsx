import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Grid, IconButton, CircularProgress } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VetLayout from '../components/VetLayout';

const VetAnimalHistory = () => {
  const { microchip } = useParams();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, [microchip]);

  // Fetch medical history entries saved via the website (animal-services collection)
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://localhost:8000/animal-services?microchip=${microchip}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          // sort newest first by timestamp or actionDate
          const sorted = data.slice().sort((a, b) => {
            const ad = new Date(b.timestamp || b.actionDate || 0).getTime();
            const bd = new Date(a.timestamp || a.actionDate || 0).getTime();
            return ad - bd;
          });
          setHistory(sorted);
        }
      } catch (e) {
        console.error('Error fetching history:', e);
      }
    };
    fetchHistory();
  }, [microchip]);

  const handlePrint = () => {
    window.print();
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

  // Separate history by type
// Πιο γενικά sections - δείξε ΟΛΑ τα medical + άλλα χρήσιμα
const medicalActions = history.filter(h => 
  h.type === 'medical_action' || 
  ['Εμβόλιο', 'Εμβολιασμός', 'Εξέταση', 'Check up'].includes(h.actionType)
);

const otherHistory = history.filter(h => 
  ['found', 'lost'].includes(h.type) || 
  h.actionType?.includes('Επέμβαση')
);

// Στο JSX: Άλλαξε headers σε "Ιατρικές Πράξεις" + "Άλλες Καταγραφές"


  return (
    <VetLayout>
      <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
        </Box>

        {/* Owner Information Section */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '2px solid #333' }}>
          <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
            Πληροφορίες κατικοιδίου:
          </Typography>
          
          <Grid container spacing={5}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Όνομα κατικοιδίου:
                </Typography>
                <Box sx={{ 
                  border: '1px solid #ddd', 
                  borderRadius: 1, 
                  width: 525,
                  p: 1.5, 
                  bgcolor: '#fafafa' 
                }}>
                  <Typography>{animal.name || '-'}</Typography>
                </Box>
              </Box>

              <Box >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Ημερομηνία Γέννησης:
                </Typography>
                <Box sx={{ 
                  border: '1px solid #ddd', 
                  borderRadius: 1, 
                  p: 1.5, 
                  bgcolor: '#fafafa' 
                }}>
                  <Typography>
                    {animal.birthDate 
                      ? new Date(animal.birthDate).toLocaleDateString('el-GR') 
                      : '-'}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Αριθμός microchip:
                </Typography>
                <Box sx={{ 
                  border: '1px solid #ddd', 
                  borderRadius: 1, 
                  p: 1.5, 
                  width:525,
                  bgcolor: '#fafafa' 
                }}>
                  <Typography>{microchip}</Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Ράτσα:
                </Typography>
                <Box sx={{ 
                  border: '1px solid #ddd', 
                  borderRadius: 1, 
                  p: 1.5, 
                  bgcolor: '#fafafa' 
                }}>
                  <Typography>{animal.breed || animal.type || '-'}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Medical Actions Section */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '2px solid #333', position: 'relative' }}>
          <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
            Ιατρικές πράξεις
          </Typography>

          {/* medicalAction */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Ιατρικές Πράξεις:
            </Typography>
            {medicalActions.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Δεν υπάρχουν καταγεγραμμένες ιατρικές πράξεις
              </Typography>
            ) : (
              medicalActions.map((vaccine, idx) => (
                <Box 
                  key={vaccine.id || idx} 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    p: 1.5,
                    mb: 1,
                    bgcolor: '#f9f9f9',
                    borderRadius: 1,
                    border: '1px solid #eee'
                  }}
                >
                  <Typography variant="body2">
                    {vaccine.description || vaccine.notes || 'DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px', textAlign: 'right' }}>
                    {vaccine.timestamp || vaccine.actionDate
                      ? new Date(vaccine.timestamp || vaccine.actionDate).toLocaleDateString('el-GR')
                      : '-'}
                  </Typography>
                </Box>
              ))
            )}
          </Box>

          {/* otherHistory */}
          <Box sx={{ pb: 6 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Άλλες Καταγραφές:
            </Typography>
            {otherHistory.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Δεν υπάρχουν άλλες καταγεγραμμένες ενέργειες
              </Typography>
            ) : (
              otherHistory.map((intervention, idx) => (
                <Box 
                  key={intervention.id || idx}
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    p: 1.5,
                    mb: 1,
                    bgcolor: '#f9f9f9',
                    borderRadius: 1,
                    border: '1px solid #eee'
                  }}
                >
                  <Typography variant="body2">
                    {intervention.description || intervention.notes || '-'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px', textAlign: 'right' }}>
                    {intervention.timestamp || intervention.actionDate
                      ? new Date(intervention.timestamp || intervention.actionDate).toLocaleDateString('el-GR')
                      : '-'}
                  </Typography>
                </Box>
              ))
            )}
          </Box>

          {/* Print Button */}
          <Box sx={{ 
            position: 'absolute', 
            bottom: 16, 
            right: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <IconButton 
              onClick={handlePrint}
              sx={{ 
                border: '2px solid #333',
                borderRadius: 1,
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
            >
              <PrintIcon />
            </IconButton>
            <Typography variant="caption" sx={{ mt: 0.5 }}>
              Εκτύπωση
            </Typography>
          </Box>
        </Paper>
      </Box>
    </VetLayout>
  );
};

export default VetAnimalHistory;
