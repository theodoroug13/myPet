import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  Tabs,
  Tab,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

import OwnerLayout from "../components/OwnerLayout";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";

const greekDate = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = String(iso).slice(0, 10).split("-");
  if (!y || !m || !d) return "—";
  return `${d}/${m}/${y}`;
};

const typeLabel = (t) => {
  switch (t) {
    case "lost":
      return "Απώλεια";
    case "transfer":
      return "Μεταβίβαση";
    case "resolved":
      return <Chip size="small" color="info" label="Βρέθηκε" />;

    default:
      return "—";
  }
};

const statusChip = (s) => {
  switch (s) {
    case "draft":
      return <Chip size="small" label="Πρόχειρο" />;
    case "submitted":
      return <Chip size="small" color="warning" label="Υποβλήθηκε" />;
    case "approved":
      return <Chip size="small" color="success" label="Εγκρίθηκε" />;
    case "rejected":
      return <Chip size="small" color="error" label="Απορρίφθηκε" />;
    case "resolved":
      return <Chip size="small" color="success" label="Ολοκληρώθηκε" />;
    default:
      return <Chip size="small" label={s || "—"} />;
  }
};

const emptyForm = (firstPetId = "") => ({
  id: null,
  petId: firstPetId,
  type: "lost",
  // common
  contactPhone: "",
  notes: "",
  // lost
  lastSeenDate: "",
  lastSeenLocation: "",
  // found
  foundDate: "",
  foundLocation: "",
  // transfer
  newOwnerName: "",
  newOwnerPhone: "",
  newOwnerEmail: "",
});

export default function MyDiloseis() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [pets, setPets] = useState([]);
  const [declarations, setDeclarations] = useState([]);


  const [foundReports, setFoundReports] = useState([]);

  // tabs: 0=Όλες, 1=Πρόχειρα, 2=Υποβληθείσες, 3=Ολοκληρωμένες
  const [tab, setTab] = useState(0);

  // dialog create/edit
  const [dlgOpen, setDlgOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [formErrors, setFormErrors] = useState({});


  const [reportsDlg, setReportsDlg] = useState({ open: false, decl: null });

  const petsById = useMemo(() => {
    const m = {};
    (pets || []).forEach((p) => (m[String(p.id)] = p));
    return m;
  }, [pets]);

  const myDeclarations = useMemo(() => {
    return (declarations || []).filter((d) => String(d.ownerId) === String(user?.id));
  }, [declarations, user]);

  const completedCount = useMemo(() => {
    return myDeclarations.filter((d) => d.status === "approved" || d.status === "rejected" || d.status === "resolved")
      .length;
  }, [myDeclarations]);

  const filtered = useMemo(() => {
    if (tab === 1) return myDeclarations.filter((d) => d.status === "draft");
    if (tab === 2) return myDeclarations.filter((d) => d.status === "submitted");
    if (tab === 3) return myDeclarations.filter((d) => d.status === "approved" || d.status === "rejected" || d.status === "resolved");
    return myDeclarations;
  }, [myDeclarations, tab]);


  const foundByMicrochip = useMemo(() => {
    const m = {};
    (foundReports || []).forEach((r) => {
      const key = String(r.microchip || "");
      if (!key) return;
      if (!m[key]) m[key] = [];
      m[key].push(r);
    });

    Object.values(m).forEach((arr) =>
      arr.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
    );

    return m;
  }, [foundReports]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const [petsRes, declRes, foundRes] = await Promise.all([
        fetch("http://localhost:8000/pets"),
        fetch("http://localhost:8000/declarations"),
        fetch("http://localhost:8000/foundReports"),
      ]);

      const petsData = await petsRes.json();
      const declData = await declRes.json();
      const foundData = await foundRes.json();

      const myPets = Array.isArray(petsData)
        ? petsData.filter((p) => String(p.ownerId) === String(user.id))
        : [];

      setPets(myPets);
      setDeclarations(Array.isArray(declData) ? declData : []);
      setFoundReports(Array.isArray(foundData) ? foundData : []);
    } catch (e) {
      console.error(e);
      setError("Απέτυχε η φόρτωση δεδομένων.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const validate = (data, mode /* 'draft' | 'submit' */) => {
    const errs = {};

    if (!data.petId) errs.petId = "Διάλεξε κατοικίδιο.";
    if (!data.type) errs.type = "Διάλεξε τύπο δήλωσης.";

    // Draft: μόνο τα βασικά
    if (mode === "draft") return errs;

    // Submit: απαιτούμενα ανά τύπο
    if (!data.contactPhone?.trim()) errs.contactPhone = "Βάλε τηλέφωνο επικοινωνίας.";

    if (data.type === "lost") {
      if (!data.lastSeenDate) errs.lastSeenDate = "Βάλε ημερομηνία απώλειας.";
      if (!data.lastSeenLocation?.trim()) errs.lastSeenLocation = "Βάλε τοποθεσία/περιοχή.";
    }



    if (data.type === "transfer") {
      if (!data.newOwnerName?.trim()) errs.newOwnerName = "Βάλε όνομα νέου κηδεμόνα.";
      if (!data.newOwnerPhone?.trim()) errs.newOwnerPhone = "Βάλε τηλέφωνο νέου κηδεμόνα.";
    }

    return errs;
  };

  const openNew = () => {
    const firstPetId = pets[0]?.id ? String(pets[0].id) : "";
    setForm(emptyForm(firstPetId));
    setFormErrors({});
    setDlgOpen(true);
  };

  const openEditDraft = (decl) => {
    setForm({
      id: decl.id,
      petId: String(decl.petId || ""),
      type: decl.type || "lost",
      contactPhone: decl.contactPhone || "",
      notes: decl.notes || "",
      lastSeenDate: decl.lastSeenDate || "",
      lastSeenLocation: decl.lastSeenLocation || "",
      newOwnerName: decl.newOwnerName || "",
      newOwnerPhone: decl.newOwnerPhone || "",
      newOwnerEmail: decl.newOwnerEmail || "",
    });
    setFormErrors({});
    setDlgOpen(true);
  };

  const closeDlg = () => {
    setDlgOpen(false);
    setFormErrors({});
  };

  const up = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const saveDeclaration = async (mode /* 'draft' | 'submit' */) => {
    if (!user) return;

    const errs = validate(form, mode);
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const pet = petsById[String(form.petId)];
    if (!pet) return;

    setSaving(true);
    setError("");

    const payload = {
      petType: pet.type,
      ownerId: String(user.id),
      petId: String(pet.id),
      petName: pet.name,
      microchip: pet.microchip,
      type: form.type,
      status: mode === "submit" ? "submitted" : "draft",
      date: new Date().toISOString(),

      contactPhone: form.contactPhone?.trim() || "",
      notes: form.notes?.trim() || "",

      lastSeenDate: form.lastSeenDate || "",
      lastSeenLocation: form.lastSeenLocation?.trim() || "",

      foundDate: form.foundDate || "",
      foundLocation: form.foundLocation?.trim() || "",

      newOwnerName: form.newOwnerName?.trim() || "",
      newOwnerPhone: form.newOwnerPhone?.trim() || "",
      newOwnerEmail: form.newOwnerEmail?.trim() || "",
    };

    try {
      if (form.id) {
        const res = await fetch(`http://localhost:8000/declarations/${encodeURIComponent(form.id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("PATCH failed");
        const updated = await res.json();
        setDeclarations((prev) => prev.map((d) => (String(d.id) === String(updated.id) ? updated : d)));
      } else {
        const res = await fetch("http://localhost:8000/declarations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("POST failed");
        const created = await res.json();
        setDeclarations((prev) => [created, ...prev]);
      }

      closeDlg();
    } catch (e) {
      console.error(e);
      setError("Δεν μπόρεσα να αποθηκεύσω τη δήλωση. Δοκίμασε ξανά.");
    }

    setSaving(false);
  };
  const deleteDeclaration = async (decl) => {
    if (!decl?.id) return;
    if (decl.status !== "draft") return;

    const ok = window.confirm("Θες σίγουρα να διαγράψεις αυτή τη δήλωση;");
    if (!ok) return;

    setSaving(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:8000/declarations/${encodeURIComponent(decl.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("DELETE failed");

      setDeclarations((prev) => prev.filter((x) => String(x.id) !== String(decl.id)));
    } catch (e) {
      console.error(e);
      setError("Δεν μπόρεσα να διαγράψω τη δήλωση. Δοκίμασε ξανά.");
    }
    setSaving(false);
  };


  const resolveDeclaration = async (declId) => {
    if (!declId) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`http://localhost:8000/declarations/${encodeURIComponent(declId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved", resolvedAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error("PATCH resolve failed");
      const updated = await res.json();

      setDeclarations((prev) => prev.map((d) => (String(d.id) === String(updated.id) ? updated : d)));
      setReportsDlg({ open: false, decl: null });
    } catch (e) {
      console.error(e);
      setError("Δεν μπόρεσα να ολοκληρώσω τη δήλωση. Δοκίμασε ξανά.");
    }

    setSaving(false);
  };

  const markFound = async (decl) => {
    if (!decl?.id) return;
    if (decl.type !== "lost") return;

    const ok = window.confirm("Να σημειωθεί ως 'Βρέθηκε' και να κλείσει η δήλωση;");
    if (!ok) return;

    setSaving(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:8000/declarations/${encodeURIComponent(decl.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved", resolvedAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error("PATCH failed");
      const updated = await res.json();

      setDeclarations((prev) => prev.map((x) => (String(x.id) === String(updated.id) ? updated : x)));
    } catch (e) {
      console.error(e);
      setError("Δεν μπόρεσα να ενημερώσω τη δήλωση. Δοκίμασε ξανά.");
    }
    setSaving(false);
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

  const activeDecl = reportsDlg.decl;
  const activeReports =
    activeDecl?.type === "lost" ? foundByMicrochip[String(activeDecl.microchip || "")] || [] : [];

  return (
    <OwnerLayout>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <IconButton onClick={() => navigate("/owner-dashboard")}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={900}>
            Δηλώσεις
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Δήλωσε την απώλεια του κατοικιδίου σου.
          </Typography>
        </Box>

        <Button variant="outlined" onClick={fetchData} disabled={loading || saving}>
          Ανανέωση
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openNew}
          disabled={loading || saving || pets.length === 0}
        >
          Νέα δήλωση
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
          description="Για να κάνεις δήλωση, πρέπει να υπάρχει κατοικίδιο στον λογαριασμό σου."
          actionLabel="Πήγαινε στα κατοικίδια"
          onAction={() => navigate("/owner-pets")}
        />
      ) : (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1 }}>
            <Tab label={`Όλες (${myDeclarations.length})`} />
            <Tab label={`Πρόχειρα (${myDeclarations.filter((d) => d.status === "draft").length})`} />
            <Tab label={`Υποβληθείσες (${myDeclarations.filter((d) => d.status === "submitted").length})`} />
            <Tab label={`Ολοκληρωμένες (${completedCount})`} />
          </Tabs>

          <Divider sx={{ mb: 2 }} />

          {filtered.length === 0 ? (
            <Alert severity="info">Δεν υπάρχουν δηλώσεις σε αυτή την κατηγορία.</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><b>Ημερομηνία</b></TableCell>
                    <TableCell><b>Κατοικίδιο</b></TableCell>
                    <TableCell><b>Τύπος</b></TableCell>
                    <TableCell><b>Τοποθεσία</b></TableCell>
                    <TableCell><b>Αναφορές</b></TableCell>
                    <TableCell><b>Status</b></TableCell>
                    <TableCell align="right"><b>Ενέργειες</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered
                    .slice()
                    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
                    .map((d) => {
                      const loc =
                        d.type === "lost"
                          ? d.lastSeenLocation
                          : d.type === "found"
                            ? d.foundLocation
                            : "—";

                      const reports =
                        d.type === "lost" ? foundByMicrochip[String(d.microchip || "")] || [] : [];

                      return (
                        <TableRow key={d.id}>
                          <TableCell>{greekDate(d.date)}</TableCell>
                          <TableCell>
                            <Typography fontWeight={800}>{d.petName || "—"}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {d.microchip || "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>{typeLabel(d.type)}</TableCell>
                          <TableCell>{loc || "—"}</TableCell>

                          <TableCell>
                            {d.type !== "lost" ? (
                              <Typography variant="caption" color="text.secondary">—</Typography>
                            ) : (
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip
                                  size="small"
                                  variant={reports.length ? "filled" : "outlined"}
                                  color={reports.length ? "success" : "default"}
                                  label={`Βρέθηκαν: ${reports.length}`}
                                />
                                <Button
                                  size="small"
                                  disabled={reports.length === 0}
                                  onClick={() => setReportsDlg({ open: true, decl: d })}
                                >
                                  Δες
                                </Button>
                              </Stack>
                            )}
                          </TableCell>

                          <TableCell>{statusChip(d.status)}</TableCell>

                          <TableCell align="right">
                            {d.status === "draft" ? (
                              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                                <Button size="small" startIcon={<EditIcon />} onClick={() => openEditDraft(d)}>
                                  Επεξεργασία
                                </Button>

                                <Button size="small" color="error" onClick={() => deleteDeclaration(d)}>
                                  Διαγραφή
                                </Button>
                              </Box>
                            ) : d.type === "lost" && (d.status === "submitted" || d.status === "approved") ? (
                              <Button size="small" color="success" onClick={() => markFound(d)}>
                                Βρέθηκε το κατοικίδιο
                              </Button>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                —
                              </Typography>
                            )}
                          </TableCell>


                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* DIALOG: reports for lost */}
      <Dialog
        open={reportsDlg.open}
        onClose={() => setReportsDlg({ open: false, decl: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Αναφορές εύρεσης</DialogTitle>
        <DialogContent dividers>
          {!activeDecl ? (
            <Alert severity="info">Δεν υπάρχει ενεργή δήλωση.</Alert>
          ) : (
            <Stack spacing={2}>
              <Box>
                <Typography fontWeight={900}>
                  {activeDecl.petName || "Κατοικίδιο"} — {activeDecl.microchip || "—"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Δήλωση: {typeLabel(activeDecl.type)} • {greekDate(activeDecl.date)}
                </Typography>
              </Box>

              {activeReports.length === 0 ? (
                <Alert severity="info">Δεν υπάρχουν αναφορές “Βρήκα” για αυτό το microchip.</Alert>
              ) : (
                <Stack spacing={1.5}>
                  {activeReports.map((r) => (
                    <Paper key={r.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                      <Stack spacing={0.5}>
                        <Typography fontWeight={800}>
                          {greekDate(r.foundDate)} • {r.foundLocation || "—"}
                        </Typography>

                        <Typography variant="body2">
                          Finder: <b>{r.finderName || "—"}</b> •{" "}
                          {r.finderPhone ? (
                            <Button
                              size="small"
                              component="a"
                              href={`tel:${String(r.finderPhone).replace(/\s/g, "")}`}
                              sx={{ ml: 1 }}
                            >
                              Κλήση: {r.finderPhone}
                            </Button>
                          ) : (
                            "—"
                          )}
                        </Typography>

                        {r.comments ? (
                          <Typography variant="body2" color="text.secondary">
                            Σχόλια: {r.comments}
                          </Typography>
                        ) : null}

                        <Typography variant="caption" color="text.secondary">
                          Καταχώρηση: {greekDate(r.createdAt)} • status: {r.status || "—"}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}

              <Alert severity="warning">
                Αν έχεις επικοινωνήσει και λύθηκε, μπορείς να σημάνεις τη δήλωση ως <b>Ολοκληρώθηκε</b>.
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportsDlg({ open: false, decl: null })}>Κλείσιμο</Button>
          <Button
            variant="contained"
            disabled={!activeDecl || saving}
            onClick={() => resolveDeclaration(activeDecl.id)}
          >
            Ολοκληρώθηκε
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG: create/edit */}
      <Dialog open={dlgOpen} onClose={closeDlg} maxWidth="sm" fullWidth>
        <DialogTitle>{form.id ? "Επεξεργασία πρόχειρου" : "Νέα δήλωση"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              select
              label="Κατοικίδιο"
              value={form.petId}
              onChange={up("petId")}
              fullWidth
              error={!!formErrors.petId}
              helperText={formErrors.petId || " "}
            >
              {pets.map((p) => (
                <MenuItem key={p.id} value={String(p.id)}>
                  {p.name} — {p.microchip}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Τύπος δήλωσης"
              value={form.type}
              onChange={up("type")}
              fullWidth
              error={!!formErrors.type}
              helperText={formErrors.type || " "}
            >
              <MenuItem value="lost">Απώλεια</MenuItem>
              
            
            </TextField>

            <TextField
              label="Τηλέφωνο επικοινωνίας"
              value={form.contactPhone}
              onChange={up("contactPhone")}
              fullWidth
              error={!!formErrors.contactPhone}
              helperText={formErrors.contactPhone || "Συμπλήρωσε κινητό/τηλέφωνο."}
            />

            {form.type === "lost" ? (
              <>
                <TextField
                  type="date"
                  label="Ημερομηνία απώλειας"
                  value={form.lastSeenDate}
                  onChange={up("lastSeenDate")}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  error={!!formErrors.lastSeenDate}
                  helperText={formErrors.lastSeenDate || " "}
                />
                <TextField
                  label="Περιοχή/Τοποθεσία που χάθηκε"
                  value={form.lastSeenLocation}
                  onChange={up("lastSeenLocation")}
                  fullWidth
                  error={!!formErrors.lastSeenLocation}
                  helperText={formErrors.lastSeenLocation || " "}
                />
              </>
            ) : null}

            {form.type === "found" ? (
              <>
                <TextField
                  type="date"
                  label="Ημερομηνία εύρεσης"
                  value={form.foundDate}
                  onChange={up("foundDate")}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  error={!!formErrors.foundDate}
                  helperText={formErrors.foundDate || " "}
                />
                <TextField
                  label="Περιοχή/Τοποθεσία που βρέθηκε"
                  value={form.foundLocation}
                  onChange={up("foundLocation")}
                  fullWidth
                  error={!!formErrors.foundLocation}
                  helperText={formErrors.foundLocation || " "}
                />
              </>
            ) : null}

            {form.type === "transfer" ? (
              <>
                <TextField
                  label="Όνομα νέου κηδεμόνα"
                  value={form.newOwnerName}
                  onChange={up("newOwnerName")}
                  fullWidth
                  error={!!formErrors.newOwnerName}
                  helperText={formErrors.newOwnerName || " "}
                />
                <TextField
                  label="Τηλέφωνο νέου κηδεμόνα"
                  value={form.newOwnerPhone}
                  onChange={up("newOwnerPhone")}
                  fullWidth
                  error={!!formErrors.newOwnerPhone}
                  helperText={formErrors.newOwnerPhone || " "}
                />
                <TextField
                  label="Email νέου κηδεμόνα (προαιρετικό)"
                  value={form.newOwnerEmail}
                  onChange={up("newOwnerEmail")}
                  fullWidth
                />
              </>
            ) : null}

            <TextField
              label="Σημειώσεις (προαιρετικό)"
              value={form.notes}
              onChange={up("notes")}
              fullWidth
              multiline
              minRows={2}
            />

            <Alert severity="info">
              Μπορείς να κάνεις <b>πρόχειρη αποθήκευση</b> και να υποβάλεις αργότερα.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDlg}>Άκυρο</Button>
          <Button startIcon={<SaveIcon />} disabled={saving} onClick={() => saveDeclaration("draft")}>
            Αποθήκευση πρόχειρου
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            disabled={saving}
            onClick={() => saveDeclaration("submit")}
          >
            Υποβολή
          </Button>
        </DialogActions>
      </Dialog>
    </OwnerLayout>
  );
}
