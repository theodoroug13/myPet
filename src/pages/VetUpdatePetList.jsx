import React, { useEffect, useState } from "react";
import {
  Box, Typography, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, CircularProgress,
  IconButton, TablePagination
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import VetLayout from "../components/VetLayout";
import { useAuth } from "../context/AuthContext";


export default function VetUpdatePetList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [owners, setOwners] = useState({});
  const [searchMicrochip, setSearchMicrochip] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);


  const fetchPets = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/pets?linkedVetIds=${user.id}`);
      const data = await res.json();
      const petsArray = Array.isArray(data) ? data : [];
      setPets(petsArray);

      // Fetch all unique owner IDs
      const ownerIds = [...new Set(petsArray.map(p => p.ownerId).filter(Boolean))];
      
      // Fetch owner details for each unique owner ID
      const ownerPromises = ownerIds.map(id => 
        fetch(`http://localhost:8000/users/${id}`).then(r => r.json())
      );
      const ownerData = await Promise.all(ownerPromises);
      
      // Create a map of ownerId -> fullName
      const ownerMap = {};
      ownerData.forEach(owner => {
        ownerMap[owner.id] = owner.fullName;
      });
      setOwners(ownerMap);

    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };


  useEffect(() => {
    fetchPets();
  }, [user?.id]);


  useEffect(() => {
    const filtered = pets.filter(pet =>
      !searchMicrochip || pet.microchip?.includes(searchMicrochip)
    );
    setFilteredPets(filtered);
    setPage(0);
  }, [pets, searchMicrochip]);


  const handleEdit = (microchip) => {
    navigate(`/vet/animal-services/${microchip}`);
  };


  if (!user || user.role !== "vet") {
    return (
      <VetLayout>
        <Typography sx={{ p: 4 }}>Δεν έχεις πρόσβαση.</Typography>
      </VetLayout>
    );
  }


  return (
    <VetLayout>
      <Box sx={{ p: 4, maxWidth: 1200, mx: "auto" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            mb: 3,
            color: 'black',
            fontWeight: 600,
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          Πίσω
        </Button>

        <Typography variant="h4" sx={{ mb: 3 }}>
          Ενημέρωση υφιστάμενου
        </Typography>

        {/* Search Bar */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <TextField
              fullWidth
              label="Αναζήτηση με microchip"
              value={searchMicrochip}
              onChange={(e) => setSearchMicrochip(e.target.value)}
              InputProps={{
                endAdornment: <SearchIcon color="action" />
              }}
            />
          </Box>
        </Paper>

        {/* Results Table */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredPets.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography>Δεν βρέθηκαν ζώα με αυτό το microchip</Typography>
          </Paper>
        ) : (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {filteredPets.length} ζώ{filteredPets.length === 1 ? 'ο' : 'α'}
            </Typography>
            <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead sx={{ bgcolor: "grey.50" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Microchip</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Όνομα</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Είδος</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Φυλή</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Κηδεμόνας</TableCell>
                      <TableCell sx={{ width: 80 }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPets
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((pet) => (
                        <TableRow key={pet.id} hover>
                          <TableCell><strong>{pet.microchip}</strong></TableCell>
                          <TableCell>{pet.name}</TableCell>
                          <TableCell>{pet.type}</TableCell>
                          <TableCell>{pet.breed || '-'}</TableCell>
                          <TableCell>{owners[pet.ownerId] || '-'}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            <IconButton
                              onClick={() => handleEdit(pet.microchip)}
                              size="small"
                              sx={{ color: "primary.main" }}
                            >
                              <ArrowForwardIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={filteredPets.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value));
                  setPage(0);
                }}
                labelRowsPerPage="Ζώα ανά σελίδα:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} από ${count}`
                }
              />
            </Paper>
          </>
        )}
      </Box>
    </VetLayout>
  );
}
