import React, { useState, useContext } from 'react';
import { ThemeContext } from './contexts/ThemeContext';
import Header from './components/Header';
import TestForm from './components/TestForm';
import ResultsPanel from './components/ResultsPanel';

function App() {
  const { darkMode } = useContext(ThemeContext);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TestForm 
            setResults={setResults} 
            setLoading={setLoading} 
            setError={setError} 
          />
          <ResultsPanel 
            results={results} 
            loading={loading} 
            error={error} 
          />
        </div>
      </main>
      <footer className={`py-6 text-center ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
        <p>© {new Date().getFullYear()} AutoTestGenie. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;