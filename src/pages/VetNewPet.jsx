import React, { useEffect, useMemo, useState } from "react";
import { Box,Typography,TextField,Button,IconButton,MenuItem,CircularProgress,Paper,Tabs,Tab,Divider,Alert,Chip,Autocomplete,InputAdornment,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";

import VetLayout from "../components/VetLayout";
import { useAuth } from "../context/AuthContext";

const pad2 = (n) => String(n).padStart(2, "0");
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
const isFutureDate = (iso) => iso && new Date(iso + "T00:00:00") > new Date(todayISO() + "T00:00:00");
const mkId = (prefix) => `${prefix}${Date.now()}`;

export default function VetNewPet() {
  const navigate = useNavigate();
  const { user } = useAuth();
  useEffect(() => {
  const id = localStorage.getItem('targetDraftId');
  if (id) {
    setTargetDraftId(id);
    localStorage.removeItem('targetDraftId');
  }
}, []);


  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState([]); // vetOwnerLinks for this vet
  const [registeredOwners, setRegisteredOwners] = useState([]); // owners for links only
  const [petsAll, setPetsAll] = useState([]);
  const [lostPetsAll, setLostPetsAll] = useState([]);
  const [drafts, setDrafts] = useState([]);


  const [ownerTab, setOwnerTab] = useState(0);

  // Registered owner selection (via autocomplete)
  const [selectedOwnerId, setSelectedOwnerId] = useState("");

  // New owner lookup (by email/phone/username)
  const [lookupKey, setLookupKey] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [lookupMatches, setLookupMatches] = useState([]); // if multiple matches
  const [lookupOwner, setLookupOwner] = useState(null); // chosen owner from matches

  // Extra info for first-time registration to vet
  const [newOwnerAddress, setNewOwnerAddress] = useState("");
  const [newOwnerNotes, setNewOwnerNotes] = useState("");


  const [form, setForm] = useState({
    typeSelect: "",
    otherType: "",
    name: "",
    microchip: "",
    breed: "",
    birthDate: "",
    weight: "",
  });

  // Draft
  const [draftId, setDraftId] = useState("");
  const [savingDraft, setSavingDraft] = useState(false);

  // Submit lock
  const [saving, setSaving] = useState(false);

  // Inline errors
  const [errors, setErrors] = useState({});


  const registeredOwnerIdSet = useMemo(() => {
    const s = new Set();
    (links || []).forEach((l) => s.add(String(l.ownerId)));
    return s;
  }, [links]);

  const effectiveOwnerId = useMemo(() => {
    return ownerTab === 0 ? selectedOwnerId : lookupOwner ? String(lookupOwner.id) : "";
  }, [ownerTab, selectedOwnerId, lookupOwner]);

  const typeOptionsFromDb = useMemo(() => {
    // “όλα τα ζώα του database” = union of types from pets + lostPets
    const s = new Set();
    (petsAll || []).forEach((p) => p?.type && s.add(String(p.type)));
    (lostPetsAll || []).forEach((lp) => lp?.type && s.add(String(lp.type)));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [petsAll, lostPetsAll]);

  const effectivePetType = useMemo(() => {
    if (form.typeSelect === "Other") return form.otherType.trim();
    return form.typeSelect;
  }, [form.typeSelect, form.otherType]);

  const lastDraft = useMemo(() => (drafts?.length ? drafts[0] : null), [drafts]);
  const [targetDraftId, setTargetDraftId] = useState("");
 
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      typeSelect: prev.typeSelect || (typeOptionsFromDb[0] || "Dog"),
    }));
  
  }, [typeOptionsFromDb.length]);


  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [linksRes, petsRes, lostRes, draftsRes] = await Promise.all([
        fetch(`http://localhost:8000/vetOwnerLinks?vetId=${encodeURIComponent(String(user.id))}`),
        fetch("http://localhost:8000/pets"),
        fetch("http://localhost:8000/lostPets"),
        fetch(`http://localhost:8000/petDrafts?vetId=${encodeURIComponent(String(user.id))}&_sort=updatedAt&_order=desc`),
      ]);

      const linksData = await linksRes.json();
      const pets = await petsRes.json();
      const lost = await lostRes.json();
      const draftsData = await draftsRes.json();

      const safeLinks = Array.isArray(linksData) ? linksData : [];
      setLinks(safeLinks);

      setPetsAll(Array.isArray(pets) ? pets : []);
      setLostPetsAll(Array.isArray(lost) ? lost : []);
      setDrafts(Array.isArray(draftsData) ? draftsData : []);

      if (safeLinks.length > 0) {
        const idsParams = safeLinks
          .map((l) => `id=${encodeURIComponent(String(l.ownerId))}`)
          .join("&");
        const ownersRes = await fetch(`http://localhost:8000/users?role=owner&${idsParams}`);
        const ownersData = await ownersRes.json();
        setRegisteredOwners(Array.isArray(ownersData) ? ownersData : []);
      } else {
        setRegisteredOwners([]);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

useEffect(() => {
  if (targetDraftId && drafts.length > 0) {
    const targetDraft = drafts.find(d => d.id === targetDraftId);
    if (targetDraft) loadDraft(targetDraft);
    setTargetDraftId("");  // Clear after load
  }
}, [drafts, targetDraftId]);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "vet") return;
    fetchAll();
    
  }, [user?.id]);

 
  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Lookup owner globally, but WITHOUT showing a global list
  const lookupOwnerByKey = async () => {
    const key = lookupKey.trim();
    setLookupError("");
    setLookupMatches([]);
    setLookupOwner(null);

    if (!key) {
      setLookupError("Γράψε email ή τηλέφωνο για αναζήτηση.");
      return;
    }

    setLookupLoading(true);
    try {
      // 1) exact email
      let res = await fetch(`http://localhost:8000/users?role=owner&email=${encodeURIComponent(key)}`);
      let data = await res.json();

      // 2) exact phone
      if (!Array.isArray(data) || data.length === 0) {
        res = await fetch(`http://localhost:8000/users?role=owner&phone=${encodeURIComponent(key)}`);
        data = await res.json();
      }

      // 3) exact username (fallback)
      if (!Array.isArray(data) || data.length === 0) {
        res = await fetch(`http://localhost:8000/users?role=owner&username=${encodeURIComponent(key)}`);
        data = await res.json();
      }

      // 4) fuzzy fallback (q searches many fields)
      if (!Array.isArray(data) || data.length === 0) {
        res = await fetch(`http://localhost:8000/users?role=owner&q=${encodeURIComponent(key)}`);
        data = await res.json();
      }

      const matches = Array.isArray(data) ? data : [];

      if (matches.length === 0) {
        setLookupError("Δεν βρέθηκε κηδεμόνας με αυτά τα στοιχεία.");
      } else if (matches.length === 1) {
        const o = matches[0];
        setLookupOwner(o);

        // if already registered to this vet, suggest switching
        if (registeredOwnerIdSet.has(String(o.id))) {
          setLookupError("Ο κηδεμόνας είναι ήδη εγγεγραμμένος σε εσένα — πήγαινε στο tab “Εγγεγραμμένοι”.");
        }
      } else {
        // multiple matches: show a small autocomplete
        setLookupMatches(matches);
      }
    } catch (e) {
      console.error(e);
      setLookupError("Σφάλμα αναζήτησης. Δοκίμασε ξανά.");
    }
    setLookupLoading(false);
  };

  const registerOwnerToVet = async () => {
    setErrors((prev) => ({ ...prev, ownerId: "", newOwnerAddress: "" }));

    if (!lookupOwner) {
      setErrors((prev) => ({ ...prev, ownerId: "Κάνε πρώτα αναζήτηση και επίλεξε κηδεμόνα." }));
      return;
    }
    if (registeredOwnerIdSet.has(String(lookupOwner.id))) {
      // already registered
      setOwnerTab(0);
      setSelectedOwnerId(String(lookupOwner.id));
      return;
    }
    if (!newOwnerAddress.trim()) {
      setErrors((prev) => ({ ...prev, newOwnerAddress: "Συμπλήρωσε διεύθυνση κηδεμόνα." }));
      return;
    }

    try {
      const payload = {
        id: mkId("vol"),
        vetId: String(user.id),
        ownerId: String(lookupOwner.id),
        ownerAddress: newOwnerAddress.trim(),
        notes: newOwnerNotes.trim(),
        createdAt: todayISO(),
      };

      const res = await fetch("http://localhost:8000/vetOwnerLinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create vetOwnerLink");

      await fetchAll();
      setOwnerTab(0);
      setSelectedOwnerId(String(lookupOwner.id));
      setNewOwnerAddress("");
      setNewOwnerNotes("");
      setLookupKey("");
      setLookupMatches([]);
      setLookupOwner(null);
      setLookupError("");
    } catch (e) {
      console.error(e);
      alert("Αποτυχία εγγραφής κηδεμόνα στον κτηνίατρο. Δοκίμασε ξανά.");
    }
  };

  const validateForDraft = () => {
    const e = {};
    if (!effectiveOwnerId) e.ownerId = "Διάλεξε/βρες κηδεμόνα για να αποθηκευτεί πρόχειρο.";
    if (ownerTab === 1 && lookupOwner && !registeredOwnerIdSet.has(String(lookupOwner.id)) && !newOwnerAddress.trim()) {
      e.newOwnerAddress = "Χρειάζεται διεύθυνση (για εγγραφή στον κτηνίατρο) όταν πας με νέο κηδεμόνα.";
    }
    setErrors((prev) => ({ ...prev, ...e }));
    return Object.keys(e).length === 0;
  };

  const validateForSubmit = async () => {
    const e = {};

    if (!effectiveOwnerId) e.ownerId = "Διάλεξε/βρες κηδεμόνα.";

    // if new owner flow and not registered yet -> require address
    if (ownerTab === 1 && lookupOwner && !registeredOwnerIdSet.has(String(lookupOwner.id))) {
      if (!newOwnerAddress.trim()) e.newOwnerAddress = "Συμπλήρωσε διεύθυνση κηδεμόνα (για εγγραφή).";
    }

    if (!form.typeSelect) e.typeSelect = "Διάλεξε είδος ζώου.";
    if (form.typeSelect === "Other" && !form.otherType.trim()) e.otherType = "Γράψε τι ζώο είναι.";

    if (!form.name.trim()) e.name = "Συμπλήρωσε όνομα κατοικιδίου.";

    if (!form.microchip.trim()) e.microchip = "Συμπλήρωσε microchip.";
    if (form.microchip.trim() && form.microchip.trim().length < 5) e.microchip = "Το microchip φαίνεται πολύ μικρό.";

    if (!form.birthDate) e.birthDate = "Συμπλήρωσε ημερομηνία γέννησης.";
    if (form.birthDate && isFutureDate(form.birthDate)) e.birthDate = "Η ημερομηνία γέννησης δεν μπορεί να είναι στο μέλλον.";

    const w = Number(form.weight);
    if (Number.isNaN(w) || w <= 0 || w > 500) e.weight = "Βάλε σωστό βάρος (0–500kg).";

    // unique microchip check
    if (!e.microchip) {
      const micro = form.microchip.trim();
      const res = await fetch(`http://localhost:8000/pets?microchip=${encodeURIComponent(micro)}`);
      const found = await res.json();
      if (Array.isArray(found) && found.length > 0) {
        e.microchip = "Υπάρχει ήδη κατοικίδιο με αυτό το microchip.";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveDraft = async () => {
    if (savingDraft) return;
    const ok = validateForDraft();
    if (!ok) return;

    setSavingDraft(true);
    try {
      const payload = {
        vetId: String(user.id),
        ownerId: String(effectiveOwnerId),
        // store these for later context
        ownerLookupKey: lookupKey.trim(),
        ownerAddress: ownerTab === 1 ? newOwnerAddress.trim() : "",
        notes: ownerTab === 1 ? newOwnerNotes.trim() : "",
        typeSelect: form.typeSelect,
        otherType: form.otherType,
        type: effectivePetType || "",
        name: form.name,
        microchip: form.microchip,
        breed: form.breed,
        birthDate: form.birthDate,
        weight: form.weight,
        updatedAt: new Date().toISOString(),
      };

      let res;
      if (draftId) {
        res = await fetch(`http://localhost:8000/petDrafts/${draftId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("http://localhost:8000/petDrafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: mkId("d"), ...payload }),
        });
      }

      if (!res.ok) throw new Error("Failed to save draft");
      await fetchAll();
    } catch (e) {
      console.error(e);
      alert("Αποτυχία αποθήκευσης πρόχειρου. Δοκίμασε ξανά.");
    }
    setSavingDraft(false);
  };

  const loadDraft = async (d) => {
    if (!d) return;
    setDraftId(String(d.id));
    setErrors({});

    // If owner is already registered => go tab 0 and select
    if (registeredOwnerIdSet.has(String(d.ownerId))) {
      setOwnerTab(0);
      setSelectedOwnerId(String(d.ownerId));
    } else {
      // new owner flow
      setOwnerTab(1);
      setLookupKey(d.ownerLookupKey || "");
      setNewOwnerAddress(d.ownerAddress || "");
      setNewOwnerNotes(d.notes || "");

      // fetch owner by id to show it (no global list)
      try {
        const res = await fetch(`http://localhost:8000/users/${encodeURIComponent(String(d.ownerId))}`);
        const o = await res.json();
        if (o?.id) setLookupOwner(o);
      } catch (e) {
        console.error(e);
      }
    }

    setForm({
      typeSelect: d.typeSelect || d.type || (typeOptionsFromDb[0] || "Dog"),
      otherType: d.otherType || "",
      name: d.name || "",
      microchip: d.microchip || "",
      breed: d.breed || "",
      birthDate: d.birthDate || "",
      weight: d.weight || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const ok = await validateForSubmit();
    if (!ok) return;

    setSaving(true);
    try {
      // if new owner flow and not registered yet -> register first
      if (ownerTab === 1 && lookupOwner && !registeredOwnerIdSet.has(String(lookupOwner.id))) {
        await registerOwnerToVet();
      }

      const payload = {
        id: mkId("p"),
        ownerId: String(effectiveOwnerId),
        name: form.name.trim(),
        type: effectivePetType,
        microchip: form.microchip.trim(),
        status: "approved",
        birthDate: form.birthDate,
        breed: form.breed.trim(),
        weight: String(form.weight).trim(),
        registeredVetId: String(user.id),
        linkedVetIds: [String(user.id)],
      };

      const res = await fetch("http://localhost:8000/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create pet");

      // clean draft after submit
      if (draftId) {
        await fetch(`http://localhost:8000/petDrafts/${draftId}`, { method: "DELETE" });
      }

      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("Αποτυχία καταχώρησης. Δοκίμασε ξανά.");
    }
    setSaving(false);
  };


  if (!user) {
    return (
      <VetLayout>
        <Typography sx={{ p: 3 }}>Πρέπει να κάνεις login.</Typography>
      </VetLayout>
    );
  }
  if (user.role !== "vet") {
    return (
      <VetLayout>
        <Typography sx={{ p: 3 }}>Δεν έχεις πρόσβαση.</Typography>
      </VetLayout>
    );
  }

  return (
    <VetLayout>
      <Box sx={{ p: 4, maxWidth: 900, mx: "auto" }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
          Καταχώρηση νέου κατοικιδίου
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {lastDraft && (
              <Alert
                severity="info"
                sx={{ mb: 2 }}
                action={
                  <Button size="small" onClick={() => loadDraft(lastDraft)}>
                    ΦΟΡΤΩΣΗ ΠΡΟΧΕΙΡΟΥ
                  </Button>
                }
              >
                Υπάρχει αποθηκευμένο πρόχειρο (τελευταία ενημέρωση:{" "}
                {new Date(lastDraft.updatedAt).toLocaleString()}).
              </Alert>
            )}

            <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Κηδεμόνας
              </Typography>

              <Tabs value={ownerTab} onChange={(_, v) => setOwnerTab(v)} sx={{ mb: 2 }}>
                <Tab label="Εγγεγραμμένοι" />
                <Tab label="Νέος κηδεμόνας (πρώτη φορά)" />
              </Tabs>

              {ownerTab === 0 ? (
                <>
                  {registeredOwners.length === 0 ? (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      Δεν υπάρχουν εγγεγραμμένοι κηδεμόνες για αυτόν τον κτηνίατρο. Πήγαινε στο tab “Νέος κηδεμόνας”.
                    </Alert>
                  ) : null}

                  <Autocomplete
                    options={registeredOwners}
                    value={
                      registeredOwners.find((o) => String(o.id) === String(selectedOwnerId)) || null
                    }
                    onChange={(_, o) => setSelectedOwnerId(o ? String(o.id) : "")}
                    getOptionLabel={(o) =>
                      `${o.fullName || ""} (${o.username || ""}) — ${o.email || "-"} — ${o.phone || "-"}`
                    }
                    isOptionEqualToValue={(a, b) => String(a.id) === String(b.id)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Αναζήτηση κηδεμόνα"
                        placeholder="Γράψε όνομα, email ή τηλέφωνο..."
                        error={!!errors.ownerId}
                        helperText={errors.ownerId || " "}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment position="start">
                                <SearchIcon />
                              </InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                        fullWidth
                      />
                    )}
                  />
                </>
              ) : (
                <>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
                    <TextField
                      label="Email ή Τηλέφωνο κηδεμόνα"
                      value={lookupKey}
                      onChange={(e) => setLookupKey(e.target.value)}
                      fullWidth
                      sx={{ flex: 1, minWidth: 260 }}
                    />
                    <Button
                      variant="contained"
                      onClick={lookupOwnerByKey}
                      disabled={lookupLoading}
                    >
                      {lookupLoading ? "Αναζήτηση..." : "Αναζήτηση"}
                    </Button>
                  </Box>

                  {lookupError ? <Alert severity="info" sx={{ mb: 2 }}>{lookupError}</Alert> : null}

                  {lookupMatches.length > 1 && (
                    <Autocomplete
                      options={lookupMatches}
                      value={lookupOwner}
                      onChange={(_, o) => setLookupOwner(o)}
                      getOptionLabel={(o) =>
                        `${o.fullName || ""} (${o.username || ""}) — ${o.email || "-"} — ${o.phone || "-"}`
                      }
                      isOptionEqualToValue={(a, b) => String(a.id) === String(b.id)}
                      renderInput={(params) => (
                        <TextField {...params} label="Επιλογή κηδεμόνα από αποτελέσματα" fullWidth />
                      )}
                      sx={{ mb: 2 }}
                    />
                  )}

                  {lookupOwner && (
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
                      <Chip label={`Βρέθηκε: ${lookupOwner.fullName} (${lookupOwner.username})`} />
                      {registeredOwnerIdSet.has(String(lookupOwner.id)) ? (
                        <Chip color="success" label="Ήδη εγγεγραμμένος σε εσένα" />
                      ) : (
                        <Chip color="warning" label="Δεν είναι εγγεγραμμένος σε εσένα" />
                      )}
                    </Box>
                  )}

                  <TextField
                    label="Διεύθυνση κηδεμόνα (για εγγραφή στον κτηνίατρο)"
                    value={newOwnerAddress}
                    onChange={(e) => setNewOwnerAddress(e.target.value)}
                    error={!!errors.newOwnerAddress}
                    helperText={errors.newOwnerAddress || " "}
                    fullWidth
                    sx={{ mb: 2 }}
                    disabled={!lookupOwner || registeredOwnerIdSet.has(String(lookupOwner?.id))}
                  />

                  <TextField
                    label="Σημειώσεις (προαιρετικό)"
                    value={newOwnerNotes}
                    onChange={(e) => setNewOwnerNotes(e.target.value)}
                    fullWidth
                    disabled={!lookupOwner || registeredOwnerIdSet.has(String(lookupOwner?.id))}
                  />

                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={registerOwnerToVet}
                      disabled={!lookupOwner}
                    >
                      Εγγραφή κηδεμόνα
                    </Button>
                  </Box>

                  {errors.ownerId ? <Alert severity="warning" sx={{ mt: 2 }}>{errors.ownerId}</Alert> : null}
                </>
              )}
            </Paper>

            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Στοιχεία κατοικιδίου
              </Typography>

              <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  select
                  label="Είδος ζώου"
                  value={form.typeSelect}
                  onChange={(e) => setField("typeSelect", e.target.value)}
                  error={!!errors.typeSelect}
                  helperText={errors.typeSelect || " "}
                  fullWidth
                >
                  <MenuItem value="" disabled>
                    Επιλέξτε είδος...
                  </MenuItem>

                  {typeOptionsFromDb.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}

                  <MenuItem value="Other">Other</MenuItem>
                </TextField>

                {form.typeSelect === "Other" && (
                  <TextField
                    label="Γράψε τι ζώο είναι"
                    value={form.otherType}
                    onChange={(e) => setField("otherType", e.target.value)}
                    error={!!errors.otherType}
                    helperText={errors.otherType || " "}
                    fullWidth
                  />
                )}

                <Divider />

                <TextField
                  label="Όνομα Κατοικιδίου"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name || " "}
                  fullWidth
                />

                <TextField
                  label="Αριθμός Microchip"
                  value={form.microchip}
                  onChange={(e) => setField("microchip", e.target.value)}
                  error={!!errors.microchip}
                  helperText={errors.microchip || " "}
                  fullWidth
                />

                <TextField
                  label="Φυλή"
                  value={form.breed}
                  onChange={(e) => setField("breed", e.target.value)}
                  fullWidth
                />

                <TextField
                  label="Ημερομηνία Γέννησης"
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => setField("birthDate", e.target.value)}
                  error={!!errors.birthDate}
                  helperText={errors.birthDate || " "}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />

                <TextField
                  label="Βάρος (kg)"
                  type="number"
                  value={form.weight}
                  onChange={(e) => setField("weight", e.target.value)}
                  error={!!errors.weight}
                  helperText={errors.weight || " "}
                  inputProps={{ min: 0, step: 0.1, max: 500 }}
                  fullWidth
                />

                <Divider />

                <Box sx={{ display: "flex", gap: 2, justifyContent: "space-between", flexWrap: "wrap" }}>
                  <Chip label={draftId ? `Draft: ${draftId}` : "No draft"} variant="outlined" />

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={saveDraft}
                      disabled={savingDraft || !effectiveOwnerId}
                    >
                      {savingDraft ? "Αποθήκευση..." : "Προσωρινή αποθήκευση"}
                    </Button>

                    <Button type="submit" variant="contained" disabled={saving}>
                      {saving ? "Καταχώρηση..." : "Καταχώρηση"}
                    </Button>
                  </Box>
                </Box>

                {errors.ownerId && <Alert severity="warning">{errors.ownerId}</Alert>}
              </Box>
            </Paper>
          </>
        )}
      </Box>
    </VetLayout>
  );
}
