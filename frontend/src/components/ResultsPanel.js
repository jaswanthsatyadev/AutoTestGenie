import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

function ResultsPanel({ results, loading, error }) {
  const { darkMode } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = React.useState('Test Script');
  const [copied, setCopied] = React.useState(false);

  if (loading) {
    return (
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
        <div className="flex flex-col items-center justify-center h-full py-12">
          <svg className="animate-spin h-10 w-10 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Generating and running test script...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
        <div className="flex flex-col items-center justify-center h-full py-12">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4 w-full">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Please try again with different inputs.</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className={`rounded-2xl shadow-lg transition-shadow duration-300 ${darkMode ? 'bg-gray-800/50 shadow-indigo-500/10' : 'bg-white/50 shadow-gray-900/10'}`}>
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
           <svg className="h-16 w-16 text-indigo-400 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="text-2xl font-bold tracking-tight mb-2">Ready to Generate</h3>
          <p className={`max-w-md mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Fill out the form and click "Generate Test Script" to see the magic happen.
          </p>
        </div>
      </div>
    );
  }

  const { testScript, runResults } = results;

  const handleCopy = () => {
    const contentToCopy = activeTab === 'Test Script' ? testScript : runResults?.stdout;
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

 return (
    <div className={`rounded-2xl shadow-lg transition-shadow duration-300 ${darkMode ? 'bg-gray-800/50 shadow-indigo-500/10' : 'bg-white/50 shadow-gray-900/10'}`}>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Results</h2>
        </div>

        <div className="mb-6">
          <div className={`flex space-x-1 rounded-lg p-1 ${darkMode ? 'bg-gray-900/50' : 'bg-gray-200/80'}`}>
            {['Test Script', 'Console Output'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full rounded-md py-2.5 text-sm font-medium leading-5 transition-colors duration-300 ${activeTab === tab ? (darkMode ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700 shadow') : (darkMode ? 'text-gray-300 hover:bg-white/[0.12]' : 'text-gray-600 hover:bg-white/50')}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-900/80 rounded-lg text-white font-mono text-sm relative backdrop-blur-sm" style={{ minHeight: '300px', maxHeight: '50vh', overflow: 'auto'}}> 
          <button 
            onClick={handleCopy}
            className="absolute top-3 right-3 bg-gray-700/50 hover:bg-gray-600/50 text-white font-bold py-1 px-3 rounded-md text-xs transition-colors duration-300 z-10"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <div className="overflow-auto h-full w-full p-4">
            {activeTab === 'Test Script' ? (
              <SyntaxHighlighter language="python" style={darkMode ? vscDarkPlus : vs} showLineNumbers wrapLines customStyle={{background: 'transparent', padding: 0}}>
                {testScript}
              </SyntaxHighlighter>
            ) : (
              <pre className="whitespace-pre-wrap">
                {runResults?.stdout || 'No output available'}
                {runResults?.stderr && <span className="text-red-400">\n\n{runResults.stderr}</span>}
              </pre>
            )}
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a 
              href={`http://localhost:8000${runResults.report_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 text-center ${darkMode ? 'bg-green-600 hover:bg-green-500 shadow-lg shadow-green-600/30' : 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/40'} ${!runResults?.report_url ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              View Report
            </a>
            <a 
              href={`http://localhost:8000${runResults.test_script_url}`}
              download
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 text-center ${darkMode ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30' : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/40'} ${!runResults?.test_script_url ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Download Script
            </a>
        </div>
      </div>
    </div>

  );
}

export default ResultsPanel;