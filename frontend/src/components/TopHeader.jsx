function TopHeader({ user, isDark, toggleTheme, searchQuery, setSearchQuery, toggleSidebar }) {
  return (
    <header className="bg-slate-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0 z-40 transition-colors duration-200">
      
      {/* Left: Greeting */}
      <div className="flex-1 flex items-center gap-4">
        <button 
          onClick={toggleSidebar} 
          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Toggle Sidebar"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <h2 className="text-slate-700 dark:text-slate-200 font-medium text-lg hidden sm:block">
          Welcome, <span className="font-bold">{user?.name}</span> 👋
        </h2>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 flex justify-center max-w-xl">
        <div className="relative w-full">
          <svg className="w-5 h-5 absolute left-4 top-2.5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search tasks, boards, and projects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-white pl-12 pr-4 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex-1 flex justify-end items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-white dark:hover:bg-slate-800 transition-all bg-transparent"
          aria-label="Toggle Dark Mode"
        >
          {isDark ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>
        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold shadow-sm">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>

    </header>
  );
}

export default TopHeader;
