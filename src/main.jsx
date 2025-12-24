import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
// import './index.css'; // Αν υπάρχει αυτό το αρχείο, κράτα το, αλλιώς σβήσε τη γραμμή

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>       {/* 1. Επιτρέπει την πλοήγηση (URL) */}
      <AuthProvider>      {/* 2. Επιτρέπει τη χρήση του Login παντού */}
        <App />           {/* 3. Η εφαρμογή μας */}
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);