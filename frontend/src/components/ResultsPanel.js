import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

function ResultsPanel({ results, loading, error }) {
  const { darkMode } = useContext(ThemeContext);

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
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
        <div className="flex flex-col items-center justify-center h-full py-12">
          <svg className="h-16 w-16 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ready to Generate Tests</h3>
          <p className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Fill out the form on the left and click "Generate Test Script" to create and run automated tests.
          </p>
        </div>
      </div>
    );
  }

  const { testScript, runResults } = results;

  return (
    <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
      <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Test Results
      </h2>

      <div className="space-y-6">
        {/* Console Output */}
        <div>
          <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Console Output
          </h3>
          <div className={`rounded-md overflow-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`} style={{ maxHeight: '200px' }}>
            <pre className={`p-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
              {runResults?.stdout || 'No output available'}
              {runResults?.stderr && (
                <span className="text-red-500">
                  \n\n{runResults.stderr}
                </span>
              )}
            </pre>
          </div>
        </div>

        {/* Test Script */}
        <div>
          <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Generated Test Script
          </h3>
          <div className="rounded-md overflow-auto" style={{ maxHeight: '300px' }}>
            <SyntaxHighlighter 
              language="python" 
              style={darkMode ? vscDarkPlus : vs}
              showLineNumbers
              wrapLines
            >
              {testScript}
            </SyntaxHighlighter>
          </div>
        </div>

        {/* Download Links */}
        <div className="flex flex-col sm:flex-row gap-4">
          {runResults?.report_url && (
            <a
              href={`http://localhost:8000${runResults.report_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download HTML Report
            </a>
          )}

          {runResults?.test_script_url && (
            <a
              href={`http://localhost:8000${runResults.test_script_url}`}
              download="test_script.py"
              className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Test Script
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultsPanel;