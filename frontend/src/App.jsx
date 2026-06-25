import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BoardView from './pages/BoardView';
import Tasks from './pages/Tasks';
import { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Check saved theme or system preference
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <Router>
      <div className={`flex h-screen overflow-hidden transition-colors duration-200 ${isDark ? 'dark bg-slate-900 text-white' : 'bg-[#F8F9FC] text-slate-800'}`}>
        
        {/* Sidebar only shows when logged in */}
        {user && <Sidebar user={user} setUser={setUser} isOpen={isSidebarOpen} />}
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          
          {/* TopHeader only shows when logged in */}
          {user && (
            <TopHeader 
              user={user} 
              isDark={isDark} 
              toggleTheme={toggleTheme} 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
          )}

          {/* Scrollable Page Content */}
          <main className="flex-1 overflow-y-auto w-full p-8">
            <Routes>
              <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
              <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />} />
              <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register setUser={setUser} />} />
              <Route path="/dashboard" element={user ? <Dashboard searchQuery={searchQuery} /> : <Navigate to="/login" />} />
              <Route path="/board/:id" element={user ? <BoardView /> : <Navigate to="/login" />} />
              <Route path="/tasks" element={user ? <Tasks /> : <Navigate to="/login" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
