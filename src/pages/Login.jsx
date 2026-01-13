import { useState, useEffect, useMemo } from 'react';
import { Box, TextField, Button, Typography, Container, Alert, Tabs, Tab, MenuItem, Divider, CircularProgress } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const safeNext = (p) => (p && p.startsWith("/") ? p : "");
const normEmail = (s) => (s || "").trim().toLowerCase();

const normPhone = (s) => {
  let d = String(s || "").replace(/[^\d]/g, ""); // μόνο digits
  if (d.startsWith("30") && d.length === 12) d = d.slice(2); // +30XXXXXXXXXX -> XXXXXXXXXX
  return d;
};

const Login = () => {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const nextParam = sp.get("next") || "";

  const { user, login } = useAuth();

  const [tab, setTab] = useState(0); // 0 login, 1 signup
  const [loading, setLoading] = useState(false);

  // Login
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // Signup
  const [suRole, setSuRole] = useState("owner"); // owner | vet
  const [suUsername, setSuUsername] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suFullName, setSuFullName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPhone, setSuPhone] = useState("");

  // Vet-only
  const [suSpecialty, setSuSpecialty] = useState("");
  const [suAddress, setSuAddress] = useState("");
  const [suAfm, setSuAfm] = useState("");

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const redirectAfterLogin = (u) => {
    const role = u?.role;
    const fallback = role === "vet" ? "/vet-dashboard" : "/owner-dashboard";
    navigate(nextParam || fallback, { replace: true });
  };

  //  αν είναι ήδη logged-in, μην τον αφήνεις στη login page
  useEffect(() => {
    if (user) redirectAfterLogin(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const id = identifier.trim();
      if (!id) {
        setError("Βάλε email ή username.");
        setLoading(false);
        return;
      }
      if (!password) {
        setError("Βάλε κωδικό.");
        setLoading(false);
        return;
      }

      const result = await login(id, password); //  email ή username
      if (result?.success) {
        redirectAfterLogin(result.user);
      } else {
        setError(result?.message || "Λάθος στοιχεία.");
      }
    } catch (err) {
      console.error(err);
      setError("Αποτυχία σύνδεσης.");
    }

    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      //  basic required
      if (!suFullName.trim()) {
        setError("Βάλε ονοματεπώνυμο.");
        setLoading(false);
        return;
      }

      if (suUsername.trim().length < 3) {
        setError("Το username πρέπει να έχει τουλάχιστον 3 χαρακτήρες.");
        setLoading(false);
        return;
      }

      if (suPassword.length < 3) {
        setError("Ο κωδικός πρέπει να έχει τουλάχιστον 3 χαρακτήρες.");
        setLoading(false);
        return;
      }

      //  email required + valid
      const email = normEmail(suEmail);
      if (!email) {
        setError("Βάλε email.");
        setLoading(false);
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        setError("Βάλε έγκυρο email.");
        setLoading(false);
        return;
      }

      //  phone required + normalize
      const phone = normPhone(suPhone);
      if (!phone) {
        setError("Βάλε κινητό.");
        setLoading(false);
        return;
      }
      if (phone.length !== 10) {
        setError("Το κινητό πρέπει να έχει 10 ψηφία.");
        setLoading(false);
        return;
      }

      //  vet-only required
      if (suRole === "vet") {
        if (!suSpecialty.trim()) {
          setError("Βάλε ειδικότητα.");
          setLoading(false);
          return;
        }
        if (!suAddress.trim()) {
          setError("Βάλε διεύθυνση.");
          setLoading(false);
          return;
        }
        if (!suAfm.trim()) {
          setError("Βάλε ΑΦΜ.");
          setLoading(false);
          return;
        }
      }

      //  uniqueness checks (json-server δεν έχει unique)
      const allRes = await fetch("http://localhost:8000/users");
      const allUsers = await allRes.json();

      const usernameNorm = suUsername.trim().toLowerCase();

      const usernameTaken = (allUsers || []).some(
        (u) => String(u.username || "").trim().toLowerCase() === usernameNorm
      );
      if (usernameTaken) {
        setError("Υπάρχει ήδη χρήστης με αυτό το username.");
        setLoading(false);
        return;
      }

      const emailTaken = (allUsers || []).some((u) => normEmail(u.email) === email);
      if (emailTaken) {
        setError("Υπάρχει ήδη λογαριασμός με αυτό το email.");
        setLoading(false);
        return;
      }

      const phoneTaken = (allUsers || []).some((u) => normPhone(u.phone) === phone);
      if (phoneTaken) {
        setError("Υπάρχει ήδη λογαριασμός με αυτό το κινητό.");
        setLoading(false);
        return;
      }

      //  payload
      const payload = {
        username: suUsername.trim(),
        password: suPassword,
        role: suRole, // owner | vet
        fullName: suFullName.trim(),
        email,
        phone,
        ratingAvg: 0,
        ratingCount: 0,
        ...(suRole === "vet"
          ? {
            specialty: suSpecialty.trim(),
            address: suAddress.trim(),
            afm: suAfm.trim(),
          }
          : {}),
      };

      const createRes = await fetch("http://localhost:8000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!createRes.ok) throw new Error("POST /users failed");

      setInfo("Ο λογαριασμός δημιουργήθηκε! Γίνεται σύνδεση...");

      // auto-login (με username — δουλεύει σε κάθε περίπτωση)
      const result = await login(payload.username, payload.password);
      if (result?.success) {
        redirectAfterLogin(result.user);
      } else {
        // fallback: γύρνα στο login tab
        setTab(0);
        setIdentifier(payload.username);
        setPassword(payload.password);
        setInfo("Έγινε εγγραφή. Κάνε σύνδεση.");
      }
    } catch (err) {
      console.error(err);
      setError("Αποτυχία εγγραφής. Έλεγξε ότι τρέχει το json-server.");
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography component="h1" variant="h5" fontWeight={900}>
          {tab === 0 ? "Σύνδεση" : "Εγγραφή"}
        </Typography>

        <Tabs value={tab} onChange={(_, v) => { setTab(v); setError(""); setInfo(""); }} variant="fullWidth">
          <Tab label="Σύνδεση" />
          <Tab label="Εγγραφή" />
        </Tabs>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {info ? <Alert severity="success">{info}</Alert> : null}

        {tab === 0 ? (
          <Box component="form" onSubmit={handleLogin} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              required
              fullWidth
              label="Email ή Username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoFocus
            />

            <TextField
              required
              fullWidth
              label="Κωδικός"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button type="submit" fullWidth variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : "Είσοδος"}
            </Button>

            <Divider />
            <Typography variant="body2" color="text.secondary">
              Δεν έχεις λογαριασμό; Πήγαινε στην καρτέλα <b>Εγγραφή</b>.
            </Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSignup} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              select
              fullWidth
              label="Ρόλος"
              value={suRole}
              onChange={(e) => setSuRole(e.target.value)}
            >
              <MenuItem value="owner">Ιδιοκτήτης</MenuItem>
              <MenuItem value="vet">Κτηνίατρος</MenuItem>
            </TextField>

            <TextField
              required
              fullWidth
              label="Ονοματεπώνυμο"
              value={suFullName}
              onChange={(e) => setSuFullName(e.target.value)}
            />

            <TextField
              required
              fullWidth
              label="Username"
              value={suUsername}
              onChange={(e) => setSuUsername(e.target.value)}
            />

            <TextField
              required
              fullWidth
              label="Κωδικός"
              type="password"
              value={suPassword}
              onChange={(e) => setSuPassword(e.target.value)}
              helperText="Ελάχιστο 3 χαρακτήρες."
            />

            <TextField
              required
              fullWidth
              label="Email"
              value={suEmail}
              onChange={(e) => setSuEmail(e.target.value)}
            />

            <TextField
              required
              fullWidth
              label="Κινητό (10 ψηφία)"
              value={suPhone}
              onChange={(e) => setSuPhone(e.target.value)}
              helperText="π.χ. 69XXXXXXXX"
            />

            {suRole === "vet" ? (
              <>
                <TextField
                  required
                  fullWidth
                  label="Ειδικότητα"
                  value={suSpecialty}
                  onChange={(e) => setSuSpecialty(e.target.value)}
                />
                <TextField
                  required
                  fullWidth
                  label="Διεύθυνση"
                  value={suAddress}
                  onChange={(e) => setSuAddress(e.target.value)}
                />
                <TextField
                  required
                  fullWidth
                  label="ΑΦΜ"
                  value={suAfm}
                  onChange={(e) => setSuAfm(e.target.value)}
                />
              </>
            ) : null}

            <Button type="submit" fullWidth variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : "Δημιουργία λογαριασμού"}
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Login;
