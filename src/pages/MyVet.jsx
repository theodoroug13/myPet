import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Divider,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import LinkIcon from "@mui/icons-material/Link";
import { useNavigate } from "react-router-dom";

import OwnerLayout from "../components/OwnerLayout";
import EmptyState from "../components/EmptyState";
import { useAuth, useSearchParams } from "../context/AuthContext";

const vetLabel = (v) =>
  `${v?.fullName || "-"}${v?.specialty ? ` — ${v.specialty}` : ""}`;

function uniq(arr) {
  return Array.from(new Set((arr || []).filter(Boolean).map(String)));
}

export default function MyVet() {
  
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const returnTo = sp.get("returnTo") || "";
  const petIdFromQuery = sp.get("petId") || "";

  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [pets, setPets] = useState([]);
  const [vets, setVets] = useState([]);

  // Search filters
  const [qName, setQName] = useState("");
  const [qLocation, setQLocation] = useState("");
  const [qSpecialty, setQSpecialty] = useState("");

  // Dialogs
  const [bookDlg, setBookDlg] = useState({ open: false, vet: null });
  const [linkDlg, setLinkDlg] = useState({ open: false, vet: null });
  const [dlgPetId, setDlgPetId] = useState("");

  // Favorites (localStorage)
  const favKey = useMemo(() => (user ? `myvet:favs:${user.id}` : "myvet:favs"), [user]);
  const [favIds, setFavIds] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(favKey);
      setFavIds(raw ? JSON.parse(raw) : []);
    } catch {
      setFavIds([]);
    }
  }, [favKey]);

  const saveFavs = (next) => {
    setFavIds(next);
    try {
      localStorage.setItem(favKey, JSON.stringify(next));
    } catch { }
  };

  const toggleFav = (vetId) => {
    const id = String(vetId);
    const has = favIds.includes(id);
    const next = has ? favIds.filter((x) => x !== id) : [...favIds, id];
    saveFavs(next);
  };

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const [petsRes, usersRes] = await Promise.all([
        fetch("http://localhost:8000/pets"),
        fetch("http://localhost:8000/users"),
      ]);

      const petsData = await petsRes.json();
      const usersData = await usersRes.json();

      const myPets = Array.isArray(petsData)
        ? petsData.filter((p) => String(p.ownerId) === String(user.id))
        : [];
      const vetUsers = Array.isArray(usersData)
        ? usersData.filter((u) => u.role === "vet")
        : [];

      setPets(myPets);
      setVets(vetUsers);
    } catch (e) {
      console.error(e);
      setError("Απέτυχε η φόρτωση δεδομένων.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const vetsById = useMemo(() => {
    const m = {};
    (vets || []).forEach((v) => (m[String(v.id)] = v));
    return m;
  }, [vets]);

  // 1) Οι κτηνίατροί μου: unique vets που προκύπτουν από τα pets μου
  const myVetIds = useMemo(() => {
    const ids = [];
    (pets || []).forEach((p) => {
      if (p.registeredVetId) ids.push(String(p.registeredVetId));
      if (Array.isArray(p.linkedVetIds)) ids.push(...p.linkedVetIds.map(String));
    });
    return uniq(ids);
  }, [pets]);

  const myVets = useMemo(() => {
    return myVetIds.map((id) => vetsById[id]).filter(Boolean);
  }, [myVetIds, vetsById]);

  // mapping: vetId -> pets που τον έχουν linked/registered
  const vetToPets = useMemo(() => {
    const map = {};
    (myVetIds || []).forEach((id) => (map[String(id)] = []));
    (pets || []).forEach((p) => {
      const ids = uniq([p.registeredVetId, ...(p.linkedVetIds || [])]);
      ids.forEach((vid) => {
        if (!map[String(vid)]) map[String(vid)] = [];
        map[String(vid)].push(p);
      });
    });
    return map;
  }, [pets, myVetIds]);

  // 2) Directory results (search)
  const searchResults = useMemo(() => {
    const name = qName.trim().toLowerCase();
    const loc = qLocation.trim().toLowerCase();
    const spec = qSpecialty.trim().toLowerCase();

    return (vets || []).filter((v) => {
      const vName = (v.fullName || "").toLowerCase();
      const vLoc = (v.address || "").toLowerCase();
      const vSpec = (v.specialty || "").toLowerCase();

      if (name && !vName.includes(name)) return false;
      if (loc && !vLoc.includes(loc)) return false;
      if (spec && !vSpec.includes(spec)) return false;
      return true;
    });
  }, [vets, qName, qLocation, qSpecialty]);

  const sortedSearchResults = useMemo(() => {
    // favorites first (nice menu like figma), then alphabetical
    return [...searchResults].sort((a, b) => {
      const af = favIds.includes(String(a.id)) ? 0 : 1;
      const bf = favIds.includes(String(b.id)) ? 0 : 1;
      if (af !== bf) return af - bf;
      return (a.fullName || "").localeCompare(b.fullName || "");
    });
  }, [searchResults, favIds]);

  const openBook = (vet) => {
    setDlgPetId(pets[0]?.id ? String(pets[0].id) : "");
    setBookDlg({ open: true, vet });
  };

  const openLink = (vet) => {
    setDlgPetId(pets[0]?.id ? String(pets[0].id) : "");
    setLinkDlg({ open: true, vet });
  };

  const closeDialogs = () => {
    setBookDlg({ open: false, vet: null });
    setLinkDlg({ open: false, vet: null });
    setDlgPetId("");
  };

const goToAppointment = (vetId, petId) => {
  const target = returnTo || "/owner-appointments/new";
  const url = new URL(target, window.location.origin);

  url.searchParams.set("vetId", String(vetId));
  if (petId) url.searchParams.set("petId", String(petId));

  navigate(url.pathname + url.search);
};


  const patchPet = async (petId, patch) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:8000/pets/${encodeURIComponent(petId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("PATCH failed");
      const updated = await res.json();
      setPets((prev) => prev.map((p) => (String(p.id) === String(updated.id) ? updated : p)));
    } catch (e) {
      console.error(e);
      setError("Δεν μπόρεσα να ενημερώσω το κατοικίδιο. Δοκίμασε ξανά.");
    }
    setSaving(false);
  };

  const confirmLink = async () => {
    const vet = linkDlg.vet;
    const pet = pets.find((p) => String(p.id) === String(dlgPetId));
    if (!vet || !pet) return;

    const nextLinked = uniq([...(pet.linkedVetIds || []), String(vet.id)]);
    await patchPet(pet.id, { linkedVetIds: nextLinked });
    closeDialogs();
  };

  if (!user) {
    return (
      <OwnerLayout>
        <Typography>Πρέπει να κάνεις login.</Typography>
      </OwnerLayout>
    );
  }

  if (user.role !== "owner") {
    return (
      <OwnerLayout>
        <Typography>Δεν έχεις πρόσβαση.</Typography>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout>
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 2, mb: 2 }}>
        <Typography variant="h5" fontWeight={900}>
          Ο Κτηνίατρός μου
        </Typography>
        <Button variant="outlined" onClick={fetchData} disabled={loading || saving}>
          Ανανέωση
        </Button>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : pets.length === 0 ? (
        <EmptyState
          title="Δεν έχεις κατοικίδια"
          description="Για να δεις/κλείσεις κτηνίατρο, πρέπει να υπάρχει κατοικίδιο στον λογαριασμό σου."
          actionLabel="Πήγαινε στα κατοικίδια"
          onAction={() => navigate("/owner-pets")}
        />
      ) : (
        <>
          {/* SECTION 1: My vets list */}
          <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
            <Typography fontWeight={900} sx={{ mb: 1 }}>
              Οι κτηνίατροί των κατοικιδίων μου
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Γρήγορο ραντεβού με έναν από τους ήδη συνδεδεμένους κτηνιάτρους.
            </Typography>

            {myVets.length === 0 ? (
              <Alert severity="info">
                Δεν βρέθηκαν συνδεδεμένοι κτηνίατροι στα κατοικίδιά σου.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {myVets.map((v) => {
                  const petsForVet = vetToPets[String(v.id)] || [];
                  return (
                    <Grid item xs={12} md={6} lg={4} key={v.id}>
                      <Card variant="outlined" sx={{ height: "100%" }}>
                        <CardContent>
                          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                            <Box>
                              <Typography fontWeight={900}>{v.fullName}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {v.specialty || "—"} {v.address ? `• ${v.address}` : ""}
                              </Typography>
                            </Box>

                            <IconButton onClick={() => toggleFav(v.id)} aria-label="favorite">
                              {favIds.includes(String(v.id)) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                            </IconButton>
                          </Box>

                          <Divider sx={{ my: 1.5 }} />

                          <Typography variant="caption" color="text.secondary">
                            Συνδέεται με:
                          </Typography>
                          <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                            {petsForVet.map((p) => (
                              <Chip
                                key={p.id}
                                size="small"
                                label={p.name}
                                variant="outlined"
                                onClick={() => navigate(`/owner-pets/${encodeURIComponent(p.id)}`)}
                              />
                            ))}
                          </Box>
                        </CardContent>

                        <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2, gap: 1, flexWrap: "wrap" }}>
                          <Button
                            size="small"
                            startIcon={<EventAvailableIcon />}
                            variant="contained"
                            onClick={() => openBook(v)}
                          >
                            Γρήγορο ραντεβού
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Paper>

          {/* SECTION 2: Search directory */}
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Typography fontWeight={900} sx={{ mb: 1 }}>
              Βρες άλλους κτηνιάτρους
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Αναζήτηση με όνομα"
                  value={qName}
                  onChange={(e) => setQName(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Τοποθεσία (π.χ. Κυψέλη)"
                  value={qLocation}
                  onChange={(e) => setQLocation(e.target.value)}
                  fullWidth
                  helperText="Χωρίς API: ψάχνει στο πεδίο address."
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Ειδικότητα (specialty)"
                  value={qSpecialty}
                  onChange={(e) => setQSpecialty(e.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>

            {sortedSearchResults.length === 0 ? (
              <Alert severity="info">Δεν βρέθηκαν κτηνίατροι με αυτά τα φίλτρα.</Alert>
            ) : (
              <Grid container spacing={2}>
                {sortedSearchResults.map((v) => (
                  <Grid item xs={12} md={6} lg={4} key={`dir-${v.id}`}>
                    <Card variant="outlined" sx={{ height: "100%" }}>
                      <CardContent>
                        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                          <Box>
                            <Typography fontWeight={900}>{v.fullName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {v.specialty || "—"} {v.address ? `• ${v.address}` : ""}
                            </Typography>
                          </Box>
                          <IconButton onClick={() => toggleFav(v.id)} aria-label="favorite">
                            {favIds.includes(String(v.id)) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                          </IconButton>
                        </Box>

                        <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                          {myVetIds.includes(String(v.id)) ? (
                            <Chip size="small" color="success" label="Στα δικά μου" />
                          ) : (
                            <Chip size="small" variant="outlined" label="Νέος" />
                          )}
                        </Box>
                      </CardContent>

                      <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2, gap: 1, flexWrap: "wrap" }}>
                        <Button onClick={() => goToAppointment(v.id, petIdFromQuery /* ή selectedPetId */)}>
                          ΚΛΕΙΣΕ ΡΑΝΤΕΒΟΥ
                        </Button>



                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>


          <Dialog open={bookDlg.open} onClose={closeDialogs} maxWidth="xs" fullWidth>
            <DialogTitle>Γρήγορο ραντεβού</DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <Typography fontWeight={800}>{vetLabel(bookDlg.vet)}</Typography>
                <TextField
                  select
                  label="Διάλεξε κατοικίδιο"
                  value={dlgPetId}
                  onChange={(e) => setDlgPetId(e.target.value)}
                  fullWidth
                >
                  {pets.map((p) => (
                    <MenuItem key={`pet-${p.id}`} value={String(p.id)}>
                      {p.name} — {p.microchip}
                    </MenuItem>
                  ))}
                </TextField>
                <Typography variant="body2" color="text.secondary">
                  Θα πας στη σελίδα “Νέο Ραντεβού” με προεπιλεγμένο κτηνίατρο.
                </Typography>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDialogs}>Άκυρο</Button>

              <Button
                variant="contained"
                onClick={() => {
                  if (!dlgPetId || !bookDlg.vet) return;
                  closeDialogs();
                  navigate(
                    `/owner-appointments/new?petId=${encodeURIComponent(dlgPetId)}&vetId=${encodeURIComponent(bookDlg.vet.id)}`
                  );
                }}
              >
                Συνέχεια
              </Button>

            </DialogActions>
          </Dialog>

          {/* LINK DIALOG */}
          <Dialog open={linkDlg.open} onClose={closeDialogs} maxWidth="xs" fullWidth>
            <DialogTitle>Σύνδεση κτηνιάτρου</DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <Typography fontWeight={800}>{vetLabel(linkDlg.vet)}</Typography>
                <TextField
                  select
                  label="Διάλεξε κατοικίδιο"
                  value={dlgPetId}
                  onChange={(e) => setDlgPetId(e.target.value)}
                  fullWidth
                >
                  {pets.map((p) => (
                    <MenuItem key={`pet2-${p.id}`} value={String(p.id)}>
                      {p.name} — {p.microchip}
                    </MenuItem>
                  ))}
                </TextField>
                <Typography variant="body2" color="text.secondary">
                  Θα προστεθεί στο linkedVetIds του κατοικιδίου.
                </Typography>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDialogs}>Άκυρο</Button>
              <Button variant="contained" disabled={saving} onClick={confirmLink}>
                Σύνδεση
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </OwnerLayout>
  );
}
