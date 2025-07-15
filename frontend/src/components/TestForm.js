import React, { useState, useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { Editor } from '@monaco-editor/react';
import axios from 'axios';
import { ChevronDown } from 'lucide-react';

const HowItWorks = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { darkMode } = useContext(ThemeContext);

  return (
    <div className={`mb-6 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <button
        className="w-full flex justify-between items-center p-4 text-left font-semibold"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>How This Works</span>
        <ChevronDown className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-4 pt-0 text-sm text-gray-600 dark:text-gray-300">
          <p className="mb-2">This tool automates the generation of Selenium test scripts based on your inputs:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>URL:</strong> The web page you want to test.</li>
            <li><strong>User Actions:</strong> The steps to perform on the page (e.g., filling forms, clicking buttons).</li>
            <li><strong>Page HTML Code:</strong> The HTML source of the page to be tested. This helps the AI understand the page structure.</li>
          </ul>
          <p className="mt-2">The backend uses an AI model to generate a Python script with Selenium, which then runs in a containerized environment to test your web page.</p>
        </div>
      )}
    </div>
  );
};

function TestForm({ setResults, setLoading, setError }) {
  const { darkMode } = useContext(ThemeContext);
  const [url, setUrl] = useState('');
  const [actions, setActions] = useState('');
  const [htmlCode, setHtmlCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('url', url);
      formData.append('actions', actions);
      formData.append('html_code', htmlCode);

      // Send request to generate test script
      const response = await axios.post('http://localhost:8000/generate-test', formData, {
        responseType: 'blob',
      });

      // Convert blob to text
      const testScript = await response.data.text();

      // Run the test script
      const runFormData = new FormData();
      runFormData.append('test_script', testScript);

      const runResponse = await axios.post('http://localhost:8000/run-test', runFormData);

      setResults({
        testScript,
        runResults: runResponse.data,
      });
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-2xl shadow-lg transition-shadow duration-300 ${darkMode ? 'bg-gray-800/50 shadow-indigo-500/10' : 'bg-white/50 shadow-gray-900/10'}`}>
      <div className="p-8">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Create Your Test Script</h2>
        <HowItWorks />
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-sm font-semibold mb-2">URL</label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg transition-colors duration-300 ${darkMode ? 'bg-gray-700/50 border-gray-600 focus:ring-indigo-400' : 'bg-gray-50 border-gray-300 focus:ring-indigo-500'} focus:border-transparent focus:ring-2`}
              placeholder="https://example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="actions" className="block text-sm font-semibold mb-2">User Actions</label>
            <textarea
              id="actions"
              value={actions}
              onChange={(e) => setActions(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg transition-colors duration-300 ${darkMode ? 'bg-gray-700/50 border-gray-600 focus:ring-indigo-400' : 'bg-gray-50 border-gray-300 focus:ring-indigo-500'} focus:border-transparent focus:ring-2`}
              rows="4"
              placeholder="e.g., Fill in username with 'testuser' and password with 'password123'"
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="html-code" className="block text-sm font-semibold mb-2">Page HTML Code</label>
            <div className={`mt-1 border rounded-lg overflow-hidden ${darkMode ? 'border-gray-600' : 'border-gray-300'}`} style={{ height: '300px' }}>
              <Editor
                height="100%"
                defaultLanguage="html"
                value={htmlCode}
                onChange={setHtmlCode}
                theme={darkMode ? 'vs-dark' : 'light'}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  lineNumbers: 'off',
                  glyphMargin: false,
                  folding: false,
                  lineDecorationsWidth: 0,
                  lineNumbersMinChars: 0
                }}
              />
            </div>
          </div>
          <div className="pt-4">
            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 ${darkMode ? 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30' : 'bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/40'}`}
            >
              Generate Test Script
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TestForm;