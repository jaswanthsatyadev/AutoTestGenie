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
    <div className={`min-h-screen flex flex-col font-sans antialiased ${darkMode ? 'bg-slate-900 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
      <Header />
        <main className="flex-grow px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="lg:sticky top-24">
                <TestForm 
                  setResults={setResults} 
                  setLoading={setLoading} 
                  setError={setError} 
                />
              </div>
              <div className="relative">
                  <ResultsPanel 
                    results={results} 
                    loading={loading} 
                    error={error} 
                  />
              </div>
            </div>
          </div>
        </main>
        <footer className={`bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm shadow-inner mt-auto py-5`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} AutoTestGenie. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;