import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function TopHeader({ user, setUser, isDark, toggleTheme, searchQuery, setSearchQuery }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'All Boards', path: '/dashboard#boards' },
    { name: 'Tasks', path: '/tasks' }
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between sticky top-0 z-40 transition-colors duration-200">
      
      {/* Left: Logo & Links */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <nav className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-2 flex flex-col z-50">
              {navItems.map(item => {
                const isActive = (location.pathname === item.path && item.name !== 'All Boards') || (item.name === 'Dashboard' && location.pathname.startsWith('/board'));
                
                const handleClick = (e) => {
                  if (item.name === 'All Boards' && location.pathname === '/dashboard') {
                    const el = document.getElementById('boards');
                    if (el) {
                      e.preventDefault();
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                  setIsMenuOpen(false);
                };

                return (
                  <Link 
                    key={item.name}
                    to={item.path}
                    onClick={handleClick}
                    className={`px-4 py-2.5 text-sm font-semibold transition-colors mx-2 rounded-lg ${isActive ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-slate-700/50'}`}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          )}
        </div>

        <Link to="/dashboard" className="flex items-center gap-1.5 sm:gap-2">
          <div className="bg-indigo-500 text-white p-1 sm:p-1.5 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <span className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white tracking-tight">TaskFlow</span>
        </Link>
      </div>

      {/* Right: Search, Theme, Profile */}
      <div className="flex items-center gap-2 sm:gap-5">
        
        {/* Search */}
        <div className="relative hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-48 lg:w-64 pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-700 dark:text-slate-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-slate-800 rounded-full transition-colors"
          title="Toggle Dark Mode"
        >
          {isDark ? (
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>
        
        {/* Profile */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-5 border-l border-gray-200 dark:border-slate-700">
          <div className="hidden sm:block text-right">
            <p className="text-sm text-slate-500 dark:text-slate-400">Welcome, <span className="font-bold text-slate-800 dark:text-white">{user?.name}</span> 👋</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="px-2 sm:px-4 py-1.5 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg text-sm font-bold transition-colors flex items-center justify-center" title="Logout">
          <svg className="w-4 h-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <span className="hidden sm:inline">Logout</span>
        </button>
        
      </div>
    </header>
  );
}

export default TopHeader;
