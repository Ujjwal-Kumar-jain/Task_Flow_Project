import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingBoard, setEditingBoard] = useState(null);
  
  // New states for Sort and View Mode
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');

  const fetchBoards = async () => {
    try {
      const res = await api.get('/boards');
      setBoards(res.data);
    } catch (err) {
      console.error('Error fetching boards', err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks', err);
    }
  };

  useEffect(() => {
    fetchBoards();
    fetchTasks();
  }, []);

  const handleCreateOrUpdateBoard = async (e) => {
    e.preventDefault();
    try {
      if (editingBoard) {
        await api.put(`/boards/${editingBoard._id}`, { title, description });
      } else {
        await api.post('/boards', { title, description });
      }
      resetForm();
      fetchBoards();
    } catch (err) {
      console.error('Error saving board', err);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEditingBoard(null);
    setShowForm(false);
  };

  const openEditForm = (board, e) => {
    e.preventDefault();
    setEditingBoard(board);
    setTitle(board.title);
    setDescription(board.description || '');
    setShowForm(true);
  };

  const handleDelete = async (id, e) => {
    e.preventDefault(); 
    if (window.confirm('Are you sure you want to delete this board?')) {
      try {
        await api.delete(`/boards/${id}`);
        fetchBoards();
      } catch (err) {
        console.error('Error deleting board', err);
      }
    }
  };

  // Search logic
  let processedBoards = boards.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));

  // Sorting logic
  processedBoards.sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
    if (sortBy === 'oldest') return new Date(a.createdAt || Date.now()) - new Date(b.createdAt || Date.now());
    if (sortBy === 'az') return a.title.localeCompare(b.title);
    if (sortBy === 'za') return b.title.localeCompare(a.title);
    return 0;
  });

  const activeTasks = tasks.filter(t => t.status === 'To Do').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;

  // Decorative colors for cards - tweaked for dark mode support
  const colors = [
    { bg: 'from-indigo-100 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/20', text: 'text-indigo-600 dark:text-indigo-400' },
    { bg: 'from-emerald-100 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
    { bg: 'from-amber-100 to-orange-50 dark:from-amber-900/40 dark:to-orange-900/20', text: 'text-amber-600 dark:text-amber-400' },
    { bg: 'from-pink-100 to-rose-50 dark:from-pink-900/40 dark:to-rose-900/20', text: 'text-pink-600 dark:text-pink-400' },
    { bg: 'from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/20', text: 'text-blue-600 dark:text-blue-400' }
  ];

  return (
    <div className="w-full pb-12 transition-colors duration-200">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50/50 to-blue-50 dark:from-indigo-900/30 dark:via-purple-900/20 dark:to-blue-900/30 rounded-3xl p-10 mb-8 relative overflow-hidden border border-indigo-100/50 dark:border-indigo-800/30 mt-6">
        {/* Decorative background blur */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/40 dark:bg-purple-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 right-40 w-80 h-80 bg-indigo-200/40 dark:bg-indigo-600/10 rounded-full blur-3xl -mb-20"></div>

        <div className="relative z-10 max-w-xl">
          <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-3">
            My Boards <span className="text-4xl">🌊</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-300 text-lg mb-8">Manage your projects and tasks in one place.</p>
          <button 
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900/50 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            New Board
          </button>
        </div>
      </div>

      {/* New Board Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">{editingBoard ? 'Edit Board' : 'Create a new board'}</h3>
            <form onSubmit={handleCreateOrUpdateBoard}>
              <div className="mb-4">
                <label className="block font-medium text-slate-700 dark:text-slate-300 text-sm mb-1.5">Title</label>
                <input type="text" className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Marketing Campaign" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="mb-6">
                <label className="block font-medium text-slate-700 dark:text-slate-300 text-sm mb-1.5">Description (Optional)</label>
                <textarea className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Brief details about this project..." value={description} rows="3" onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={resetForm} className="px-5 py-2.5 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-xl shadow-sm transition-all">{editingBoard ? 'Update Board' : 'Save Board'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 transition-colors">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 w-12 h-12 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Boards</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{boards.length}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 transition-colors">
          <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 w-12 h-12 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Tasks</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{activeTasks}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 transition-colors">
          <div className="bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 w-12 h-12 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">In Progress</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{inProgressTasks}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 transition-colors">
          <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 w-12 h-12 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Completed</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{completedTasks}</h3>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-72">
          <svg className="w-5 h-5 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            placeholder="Search boards..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3">
          {/* Sorting Dropdown */}
          <div className="relative bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm transition-colors">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-transparent w-full text-sm text-slate-600 dark:text-slate-300 pl-4 pr-10 py-2.5 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl"
            >
              <option value="recent">Sort by: Recent</option>
              <option value="oldest">Sort by: Oldest</option>
              <option value="az">Sort by: A-Z</option>
              <option value="za">Sort by: Z-A</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {/* View Mode Toggles */}
          <div className="flex bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm p-1 transition-colors">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 dark:bg-indigo-500 text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
              title="Grid View"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-600 dark:bg-indigo-500 text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
              title="List View"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Boards Display */}
      {processedBoards.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl">
          <p className="text-slate-500 dark:text-slate-400 font-medium">No boards found.</p>
        </div>
      ) : (
        viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedBoards.map((board, index) => {
              const { bg, text } = colors[index % colors.length];
              
              return (
                <Link key={board._id} to={`/board/${board._id}`} className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900 hover:-translate-y-1 transition-all overflow-hidden flex flex-col h-full min-h-[280px]">
                  
                  {/* Wavy/Gradient Top Area */}
                  <div className={`h-24 bg-gradient-to-br ${bg} relative flex items-start p-5`}>
                    <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-2 rounded-xl shadow-sm ${text}`}>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-grow flex flex-col">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">{board.title}</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm line-clamp-2 leading-relaxed">{board.description || 'No description provided.'}</p>
                    
                    <div className="mt-4 flex">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${bg} ${text}`}>
                        Project Board
                      </span>
                    </div>

                    <div className="mt-auto pt-5 flex justify-between items-center border-t border-gray-50 dark:border-slate-700/50">
                      <div className="flex -space-x-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 border-2 border-white dark:border-slate-800 z-20 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-300">JS</div>
                        <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900 border-2 border-white dark:border-slate-800 z-10 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-300">AB</div>
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 z-0 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">+2</div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={(e) => openEditForm(board, e)}
                          className="text-slate-300 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-indigo-400 p-1 rounded-full transition-colors"
                          title="Edit board"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button 
                          onClick={(e) => handleDelete(board._id, e)}
                          className="text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 p-1 rounded-full transition-colors"
                          title="Delete board"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          /* List View */
          <div className="flex flex-col gap-4">
            {processedBoards.map((board, index) => {
              const { bg, text } = colors[index % colors.length];
              
              return (
                <Link key={board._id} to={`/board/${board._id}`} className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900 transition-all flex items-center p-4">
                  
                  <div className={`shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${bg} flex items-center justify-center mr-5`}>
                    <svg className={`w-7 h-7 ${text}`} fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>
                  </div>

                  <div className="flex-grow flex flex-col justify-center pr-4">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{board.title}</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-1 mt-0.5">{board.description || 'No description provided.'}</p>
                  </div>
                  
                  <div className="hidden md:flex flex-col items-end mr-6">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Created</span>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {board.createdAt ? new Date(board.createdAt).toLocaleDateString() : '—'}
                    </span>
                  </div>

                  <div className="shrink-0 flex items-center gap-4 border-l border-gray-100 dark:border-slate-700/50 pl-6 py-2">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 border-2 border-white dark:border-slate-800 z-20 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300">JS</div>
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 border-2 border-white dark:border-slate-800 z-10 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-300">AB</div>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => openEditForm(board, e)}
                        className="text-slate-300 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-indigo-400 p-1.5 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors ml-2"
                        title="Edit board"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button 
                        onClick={(e) => handleDelete(board._id, e)}
                        className="text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 p-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                        title="Delete board"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )
      )}
    </div>
  );
}

export default Dashboard;
