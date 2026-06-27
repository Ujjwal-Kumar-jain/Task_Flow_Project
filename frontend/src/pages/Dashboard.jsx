import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api';

function Dashboard({ searchQuery }) {
  const [boards, setBoards] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Project Board');
  const [editingBoard, setEditingBoard] = useState(null);
  const [sortBy, setSortBy] = useState('Recent');
  const [viewMode, setViewMode] = useState('grid');
  const location = useLocation();

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

  // Handle hash scrolling
  useEffect(() => {
    if (location.hash === '#boards') {
      setTimeout(() => {
        const el = document.getElementById('boards');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location]);

  const handleCreateOrUpdateBoard = async (e) => {
    e.preventDefault();
    try {
      if (editingBoard) {
        await api.put(`/boards/${editingBoard._id}`, { title, description, category });
      } else {
        await api.post('/boards', { title, description, category });
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
    setCategory('Project Board');
    setEditingBoard(null);
    setShowForm(false);
  };

  const openEditForm = (board, e) => {
    e.preventDefault();
    setEditingBoard(board);
    setTitle(board.title);
    setDescription(board.description || '');
    setCategory(board.category || 'Project Board');
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

  // Processing Data
  const query = searchQuery || '';
  let processedBoards = boards.filter(b => b.title.toLowerCase().includes(query.toLowerCase()));
  
  if (sortBy === 'Recent') {
    processedBoards = processedBoards.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortBy === 'Alphabetical') {
    processedBoards = processedBoards.sort((a, b) => a.title.localeCompare(b.title));
  }

  // Stats
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const totalTasks = tasks.length;
  
  const inProgPct = totalTasks ? Math.round((inProgressTasks / totalTasks) * 100) : 0;
  const donePct = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Render tiny SVG sparklines
  const Sparkline = ({ color }) => (
    <svg className="w-16 h-6 mt-2" viewBox="0 0 100 30" preserveAspectRatio="none">
      <path d="M0,20 C20,30 40,0 60,15 C80,30 100,10 100,10" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );

  return (
    <div className="w-full max-w-7xl mx-auto pb-12 transition-colors duration-200">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-indigo-900/40 dark:to-blue-900/30 rounded-3xl p-10 mb-8 relative overflow-hidden shadow-sm border border-indigo-100/50 dark:border-indigo-800/30 flex items-center justify-between">
        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white mb-2 flex items-center gap-3">
            My Boards 🌊
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg">Manage your projects and tasks in one place.</p>
          <button 
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900/50 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            New Board
          </button>
        </div>
        
        {/* Abstract Decorative Graphics (mimicking the 3D screenshot) */}
        <div className="hidden lg:flex absolute right-0 top-0 bottom-0 w-1/2 justify-end items-center opacity-80 select-none pointer-events-none">
          <div className="w-[400px] h-[300px] bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-slate-700/50 shadow-2xl relative rotate-3 translate-x-12">
            <div className="absolute top-4 left-4 w-32 h-6 bg-slate-200/50 dark:bg-slate-700/50 rounded-full"></div>
            <div className="absolute top-16 left-4 right-4 h-24 bg-indigo-100/50 dark:bg-indigo-900/30 rounded-xl"></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 bg-blue-400/80 rounded-2xl flex items-center justify-center -translate-y-12 translate-x-8 shadow-xl">
               <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <div className="absolute top-4 left-0 w-12 h-12 bg-purple-400/80 rounded-xl flex items-center justify-center -translate-x-6 shadow-xl">
               <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
          </div>
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
              <div className="mb-4">
                <label className="block font-medium text-slate-700 dark:text-slate-300 text-sm mb-1.5">Category Tag</label>
                <input type="text" className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Project Board" value={category} onChange={e => setCategory(e.target.value)} />
              </div>
              <div className="mb-6">
                <label className="block font-medium text-slate-700 dark:text-slate-300 text-sm mb-1.5">Description (Optional)</label>
                <textarea className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Brief details about this project..." value={description} rows="3" onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="flex justify-between items-center mt-2">
                {editingBoard && (
                  <button type="button" onClick={(e) => handleDelete(editingBoard._id, e)} className="text-rose-500 hover:text-rose-600 font-bold text-sm">Delete Board</button>
                )}
                <div className="flex gap-3 ml-auto">
                  <button type="button" onClick={resetForm} className="px-5 py-2.5 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-sm transition-all">{editingBoard ? 'Update' : 'Create'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Total Boards */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex justify-between items-center transition-colors">
          <div className="flex gap-4 items-center">
            <div className="bg-purple-50 dark:bg-purple-900/30 text-purple-500 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Boards</p>
              <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">{boards.length}</h3>
              <p className="text-xs font-bold text-emerald-500">+2 this month</p>
            </div>
          </div>
          <div className="hidden xl:block"><Sparkline color="#a855f7" /></div>
        </div>

        {/* Total Tasks */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex justify-between items-center transition-colors">
          <div className="flex gap-4 items-center">
            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-500 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Tasks</p>
              <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">{totalTasks}</h3>
              <p className="text-xs font-bold text-emerald-500">+12 this week</p>
            </div>
          </div>
          <div className="hidden xl:block"><Sparkline color="#3b82f6" /></div>
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex justify-between items-center transition-colors">
          <div className="flex gap-4 items-center">
            <div className="bg-orange-50 dark:bg-orange-900/30 text-orange-500 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">In Progress</p>
              <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">{inProgressTasks}</h3>
              <p className="text-xs font-bold text-slate-400">{inProgPct}% of total</p>
            </div>
          </div>
          <div className="hidden xl:block"><Sparkline color="#f97316" /></div>
        </div>

        {/* Completed */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex justify-between items-center transition-colors">
          <div className="flex gap-4 items-center">
            <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Completed</p>
              <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">{completedTasks}</h3>
              <p className="text-xs font-bold text-slate-400">{donePct}% of total</p>
            </div>
          </div>
          <div className="hidden xl:block"><Sparkline color="#10b981" /></div>
        </div>
      </div>

      {/* Controls Row */}
      <div id="boards" className="flex justify-end items-center mb-6 scroll-mt-24">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
            Sort by:
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option>Recent</option>
              <option>Alphabetical</option>
            </select>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded shadow-sm transition-colors ${viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded shadow-sm transition-colors ${viewMode === 'list' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Boards Grid */}
      {processedBoards.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl">
          <p className="text-slate-500 dark:text-slate-400 font-medium">No boards match your search.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8' : 'flex flex-col gap-4'}>
          {processedBoards.map((board, index) => {
            // Cycle through some nice gradients for the wavy tops
            const gradients = [
              'from-indigo-100 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/20',
              'from-emerald-100 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/20',
              'from-amber-100 to-orange-50 dark:from-amber-900/40 dark:to-orange-900/20',
            ];
            const iconColors = [
              'bg-indigo-500 text-white',
              'bg-emerald-500 text-white',
              'bg-amber-500 text-white',
            ];
            const bgClass = gradients[index % gradients.length];
            const iconClass = iconColors[index % iconColors.length];

            return (
              <div key={board._id} className={`group bg-white dark:bg-slate-800 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-slate-700 relative ${viewMode === 'grid' ? 'flex flex-col h-full' : 'flex flex-col md:flex-row items-start md:items-center p-2 pr-2 md:pr-4'}`}>
                
                {/* Wavy Background Decoration / List Icon */}
                {viewMode === 'grid' ? (
                  <div className={`h-32 bg-gradient-to-br ${bgClass} relative`}>
                    <svg className="absolute bottom-0 w-full h-12 text-white dark:text-slate-800" preserveAspectRatio="none" viewBox="0 0 1440 320" fill="currentColor">
                      <path d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,144C672,128,768,128,864,149.3C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                    
                    {/* Icon */}
                    <div className={`absolute top-6 left-6 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${iconClass}`}>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        {index % 3 === 0 ? <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> : 
                         index % 3 === 1 ? <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /> : 
                         <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />}
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className={`hidden md:flex w-14 h-14 rounded-xl items-center justify-center shrink-0 ml-2 shadow-sm ${iconClass}`}>
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      {index % 3 === 0 ? <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> : 
                       index % 3 === 1 ? <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /> : 
                       <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />}
                    </svg>
                  </div>
                )}

                <Link to={`/board/${board._id}`} className={`flex-grow cursor-pointer ${viewMode === 'grid' ? 'p-6 pt-2 flex flex-col' : 'p-4 md:pl-6 md:pr-4 flex items-center w-full'}`}>
                  {viewMode === 'grid' ? (
                    <>
                      <h2 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{board.title}</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed mb-4 flex-grow">{board.description || 'No description provided.'}</p>
                      <div className="mb-6">
                        <span className="inline-block bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs font-bold px-3 py-1 rounded-full">
                          {board.category || 'Project Board'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex-grow flex flex-col md:flex-row md:items-center justify-between w-full gap-2 md:gap-4">
                      <div className="flex-1 max-w-full md:max-w-[40%]">
                        <h2 className="text-lg font-extrabold text-slate-800 dark:text-white tracking-tight line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{board.title}</h2>
                      </div>
                      <div className="flex-1 hidden lg:block">
                        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-1">{board.description || 'No description'}</p>
                      </div>
                      <div className="shrink-0 w-32 hidden sm:block">
                        <span className="inline-block bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold px-2 py-1 rounded-full">
                          {board.category || 'Project Board'}
                        </span>
                      </div>
                    </div>
                  )}
                </Link>

                {/* Footer with Menu */}
                <div className={`${viewMode === 'grid' ? 'px-6 py-4 border-t border-gray-50 dark:border-slate-800/50 flex justify-end' : 'p-4 md:pr-2 flex w-full md:w-auto justify-end border-t border-gray-50 dark:border-0'} items-center bg-white dark:bg-slate-800 z-10 shrink-0 gap-4`}>
                  
                  {/* 3 Dots Menu */}
                  <div className="relative">
                    <button onClick={(e) => { e.preventDefault(); openEditForm(board, e); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                    </button>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}
      
      {/* Footer message mimicking the screenshot */}
      <div className="mt-12 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl p-6 text-center">
         <p className="font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2">
           ✨ Stay organized. Stay productive. <span className="text-indigo-600 dark:text-indigo-400">Achieve more.</span> ✨
         </p>
      </div>

    </div>
  );
}

export default Dashboard;
