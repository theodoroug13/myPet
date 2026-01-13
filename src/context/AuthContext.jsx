import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

const login = async (identifier, password) => {
  try {
    const id = String(identifier || "").trim();

    // 1) δοκίμασε username
    let res = await fetch(`http://localhost:8000/users?username=${encodeURIComponent(id)}`);
    let data = await res.json();

    // 2) αν δεν βρήκε, δοκίμασε email (case-insensitive)
    if (!Array.isArray(data) || data.length === 0) {
      const idEmail = id.toLowerCase();
      res = await fetch(`http://localhost:8000/users?email=${encodeURIComponent(idEmail)}`);
      data = await res.json();
    }

    if (Array.isArray(data) && data.length > 0) {
      const u = data[0];

      if (String(u.password) === String(password)) {
        setUser(u);
        localStorage.setItem("user", JSON.stringify(u));
        return { success: true, user: u };
      }
    }

    return { success: false, message: "Λάθος email/username ή κωδικός" };
  } catch (error) {
    return { success: false, message: "Σφάλμα σύνδεσης με τον server" };
  }
};


  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);