import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { Sun, Moon, TestTube2 } from 'lucide-react';

const Header = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <header className="border-b border-gray-200/80 dark:border-gray-700/80 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center space-x-2">
        <TestTube2 size={28} className="text-indigo-600"/>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          AutoTestGenie
        </h1>
        </div>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200/70 dark:hover:bg-gray-700/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Header;