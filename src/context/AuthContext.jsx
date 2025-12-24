import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Έλεγχος αν υπάρχει αποθηκευμένος χρήστης (για να μην χάνεται το login στο refresh)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username, password) => {
    try {
      const res = await fetch(`http://localhost:8000/users?username=${username}`);
      const data = await res.json();

      if (data.length > 0) {
        if (data[0].password === password) {
          setUser(data[0]);
          localStorage.setItem('user', JSON.stringify(data[0]));
          return { success: true };
        }
      }
      return { success: false, message: "Λάθος όνομα χρήστη ή κωδικός" };
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