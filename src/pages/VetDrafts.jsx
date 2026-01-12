import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Chip, CircularProgress,
  IconButton, Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VetLayout from "../components/VetLayout";
import { useAuth } from "../context/AuthContext";

export default function VetDrafts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState({});

  const fetchDrafts = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/petDrafts?vetId=${user.id}&_sort=updatedAt&_order=desc`);
      const data = await res.json();
      setDrafts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDrafts();
  }, [user?.id]);

const loadDraft = async (draftId) => {
  localStorage.setItem('targetDraftId', draftId); 
  navigate("/vet/new-pet");
};
  const deleteDraft = async (draftId) => {
    if (!confirm("Διέγραψε αυτό το πρόχειρο;")) return;
    setDeleting(prev => ({ ...prev, [draftId]: true }));
    try {
      await fetch(`http://localhost:8000/petDrafts/${draftId}`, { method: "DELETE" });
      await fetchDrafts();
    } catch (e) {
      console.error(e);
      alert("Σφάλμα διαγραφής");
    }
    setDeleting(prev => ({ ...prev, [draftId]: false }));
  };

  if (!user || user.role !== "vet") {
    return <VetLayout><Typography>Δεν έχεις πρόσβαση.</Typography></VetLayout>;
  }

  return (
    <VetLayout>
      <Box sx={{ p: 4, maxWidth: 1200, mx: "auto" }}>
        <Typography variant="h4" sx={{ mb: 3 }}>Πρόχειρες Καταχωρήσεις Κατοικιδίων</Typography>
        
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : drafts.length === 0 ? (
          <Alert severity="info">
            Δεν υπάρχουν πρόχειρες καταχωρήσεις. Δημιούργησε μία από <Button onClick={() => navigate("/vet/new-pet")}>Νέο Κατοικίδιο</Button>.
          </Alert>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ημερομηνία</TableCell>
                  <TableCell>Κηδεμόνας</TableCell>
                  <TableCell>Κατοικίδιο</TableCell>
                  <TableCell>Microchip</TableCell>
                  <TableCell sx={{ textAlign: "right" }}>Ενέργειες</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {drafts.map((draft) => (
                  <TableRow key={draft.id} hover>
                    <TableCell>
                      {new Date(draft.updatedAt).toLocaleString('el-GR')}
                      <Chip label="Πρόχειρο" size="small" sx={{ ml: 1 }} />
                    </TableCell>
                    <TableCell>{draft.ownerLookupKey || 'Νέος'}</TableCell>
                    <TableCell>{draft.name || 'Χωρίς όνομα'}</TableCell>
                    <TableCell>{draft.microchip}</TableCell>
                    <TableCell sx={{ textAlign: "right" }}>
                      <IconButton onClick={() => loadDraft(draft.id)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => deleteDraft(draft.id)} 
                        disabled={deleting[draft.id]}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </VetLayout>
  );
}
