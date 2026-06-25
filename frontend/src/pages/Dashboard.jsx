import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function Dashboard({ searchQuery }) {
  const [boards, setBoards] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingBoard, setEditingBoard] = useState(null);

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

  // Search filter
  const query = searchQuery || '';
  const processedBoards = boards.filter(b => b.title.toLowerCase().includes(query.toLowerCase()));

  // Task Stats
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const totalTasks = tasks.length;
  
  // Percentages for Task Breakdown
  const todoCount = tasks.filter(t => t.status === 'To Do').length;
  const todoPct = totalTasks ? Math.round((todoCount / totalTasks) * 100) : 0;
  const inProgPct = totalTasks ? Math.round((inProgressTasks / totalTasks) * 100) : 0;
  const donePct = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Most recent board for Project Completion
  const latestBoard = boards.length > 0 ? boards[0] : null;
  const latestBoardTasks = latestBoard ? tasks.filter(t => t.board === latestBoard._id) : [];
  const latestCompleted = latestBoardTasks.filter(t => t.status === 'Done').length;
  const latestPct = latestBoardTasks.length > 0 ? Math.round((latestCompleted / latestBoardTasks.length) * 100) : 0;

  return (
    <div className="w-full pb-12 transition-colors duration-200">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            My Boards ✨
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your projects and tasks in one place.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900/50 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          New Board
        </button>
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
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-sm transition-all">{editingBoard ? 'Update Board' : 'Save Board'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-start gap-4 transition-colors">
          <div className="bg-fuchsia-50 dark:bg-fuchsia-900/30 text-fuchsia-500 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Boards</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{boards.length}</h3>
            <p className="text-xs font-semibold text-emerald-500 mt-1">+2 this month</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-start gap-4 transition-colors">
          <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-500 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Tasks</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{totalTasks}</h3>
            <p className="text-xs font-semibold text-emerald-500 mt-1">+12 this week</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-start justify-between transition-colors">
          <div className="flex gap-4">
            <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-500 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">In Progress</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{inProgressTasks}</h3>
              <p className="text-xs font-semibold text-slate-400 mt-1">{inProgPct}% of total</p>
            </div>
          </div>
          <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-start justify-between transition-colors">
          <div className="flex gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Completed</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{completedTasks}</h3>
              <p className="text-xs font-semibold text-slate-400 mt-1">{donePct}% of total</p>
            </div>
          </div>
          <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
        </div>
      </div>

      {/* Overview Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Task Breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Task Breakdown
            </h3>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{totalTasks} Total</span>
          </div>
          
          {/* Stacked Progress Bar */}
          <div className="h-6 w-full rounded-full bg-slate-100 dark:bg-slate-700 flex overflow-hidden mb-6">
            <div style={{ width: `${todoPct}%` }} className="bg-slate-400 dark:bg-slate-500 h-full transition-all duration-500"></div>
            <div style={{ width: `${inProgPct}%` }} className="bg-amber-400 dark:bg-amber-500 h-full transition-all duration-500 border-l-2 border-white dark:border-slate-800"></div>
            <div style={{ width: `${donePct}%` }} className="bg-emerald-400 dark:bg-emerald-500 h-full transition-all duration-500 border-l-2 border-white dark:border-slate-800"></div>
          </div>
          
          <div className="flex justify-between text-center px-4">
            <div>
              <div className="flex items-center gap-1.5 justify-center mb-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <div className="w-2 h-2 rounded-full bg-slate-400"></div> To Do
              </div>
              <div className="text-xl font-extrabold text-slate-800 dark:text-white">{todoPct}%</div>
              <div className="text-xs font-semibold text-slate-400">{todoCount} tasks</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 justify-center mb-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div> In Progress
              </div>
              <div className="text-xl font-extrabold text-slate-800 dark:text-white">{inProgPct}%</div>
              <div className="text-xs font-semibold text-slate-400">{inProgressTasks} tasks</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 justify-center mb-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div> Done
              </div>
              <div className="text-xl font-extrabold text-slate-800 dark:text-white">{donePct}%</div>
              <div className="text-xs font-semibold text-slate-400">{completedTasks} tasks</div>
            </div>
          </div>
        </div>

        {/* Project Completion */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              Project Completion
            </h3>
            
            {latestBoard ? (
              <>
                <h4 className="font-bold text-slate-800 dark:text-white mb-1">{latestBoard.title}</h4>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">{latestBoardTasks.length} total tasks</p>
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2.5 mb-4 text-xs flex rounded-full bg-indigo-50 dark:bg-indigo-900/30">
                    <div style={{ width: `${latestPct}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-500"></div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{latestPct}%</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-slate-500 font-medium">Create a board to track progress.</p>
            )}
          </div>
        </div>
        
      </div>

      {/* Boards Display */}
      {processedBoards.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl">
          <p className="text-slate-500 dark:text-slate-400 font-medium">No boards match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedBoards.map((board, index) => {
            return (
              <Link key={board._id} to={`/board/${board._id}`} className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all flex flex-col h-full min-h-[220px] p-6 relative">
                
                {/* Board Icon */}
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>
                </div>

                {/* Actions Menu */}
                <div className="absolute top-6 right-6 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => openEditForm(board, e)}
                    className="text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 p-1.5 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button 
                    onClick={(e) => handleDelete(board._id, e)}
                    className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-1.5 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>

                <div className="flex-grow flex flex-col">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">{board.title}</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm line-clamp-2 leading-relaxed">{board.description || 'No description provided.'}</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
