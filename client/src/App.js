import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Outlet } from 'react-router-dom';
import { LanguageContext } from './contexts/languageContext';
import { useState } from 'react';

function App() {
  const [isCzech, setIsCzech] = useState(false);

  return (
    <LanguageContext.Provider value={{ isCzech, setIsCzech }}>
      <Outlet />
    </LanguageContext.Provider>
  );
}

export default App;
