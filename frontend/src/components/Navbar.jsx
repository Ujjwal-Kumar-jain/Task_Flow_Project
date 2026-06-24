import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, setUser, isDark, toggleTheme }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 text-slate-800 dark:text-white px-6 md:px-12 lg:px-20 py-3 sticky top-0 z-50 transition-colors duration-200">
      <div className="w-full flex justify-between items-center">
        
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-indigo-500 text-white rounded-md w-7 h-7 flex items-center justify-center font-bold text-lg leading-none shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">TaskFlow</span>
        </Link>

        {/* Right: User actions */}
        <div>
          {user ? (
            <div className="flex items-center gap-5">
              <button 
                onClick={toggleTheme}
                className="text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors p-1"
                aria-label="Toggle Dark Mode"
              >
                {isDark ? (
                  // Sun icon for Dark Mode
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  // Moon icon for Light Mode
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              
              <div className="flex items-center gap-3 border-l border-gray-200 dark:border-slate-700 pl-5">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Welcome, <span className="text-slate-800 dark:text-slate-200 font-bold">{user.name}</span> 👋
                </span>
                <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <button onClick={handleLogout} className="bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors border border-indigo-100 dark:border-slate-600 shadow-sm ml-2">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-4 items-center">
              <button 
                onClick={toggleTheme}
                className="text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors p-1"
                aria-label="Toggle Dark Mode"
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>
              <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">Login</Link>
              <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors shadow-sm">Register</Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
