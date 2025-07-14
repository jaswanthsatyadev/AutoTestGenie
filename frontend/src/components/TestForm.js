import React, { useState, useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { Editor } from '@monaco-editor/react';
import axios from 'axios';

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
    <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
      <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Generate Test Script
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="url" 
            className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
          >
            Web Page URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            required
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
          />
        </div>

        <div>
          <label 
            htmlFor="actions" 
            className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
          >
            Page Actions Description
          </label>
          <textarea
            id="actions"
            value={actions}
            onChange={(e) => setActions(e.target.value)}
            placeholder="Describe the actions to automate (e.g., 'Click login button, enter username and password, submit form')"
            required
            rows={4}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
          />
        </div>

        <div>
          <label 
            htmlFor="html-code" 
            className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
          >
            Page HTML Code
          </label>
          <div className="mt-1 border rounded-md overflow-hidden" style={{ height: '300px' }}>
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
              }}
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${darkMode ? 'focus:ring-offset-gray-800' : ''}`}
          >
            Generate Test Script
          </button>
        </div>
      </form>
    </div>
  );
}

export default TestForm;