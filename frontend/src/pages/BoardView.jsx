import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

function BoardView() {
  const { id } = useParams();
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  
  // Task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('To Do');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [estimatedEffort, setEstimatedEffort] = useState('');
  
  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  // Edit Task State
  const [editingTask, setEditingTask] = useState(null);

  const fetchBoardAndTasks = async () => {
    try {
      const boardRes = await api.get(`/boards/${id}`);
      setBoard(boardRes.data);
      const tasksRes = await api.get(`/tasks/board/${id}`);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error('Error fetching data', err);
    }
  };

  useEffect(() => {
    fetchBoardAndTasks();
  }, [id]);

  const handleCreateOrUpdateTask = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, { title, description, status, priority, dueDate, estimatedEffort });
      } else {
        await api.post(`/tasks`, { title, description, status, priority, dueDate, estimatedEffort, boardId: id });
      }
      resetForm();
      fetchBoardAndTasks();
    } catch (err) {
      console.error('Error saving task', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        fetchBoardAndTasks();
      } catch (err) {
        console.error('Error deleting task', err);
      }
    }
  };

  const updateTaskStatus = async (task, newStatus) => {
    try {
      await api.put(`/tasks/${task._id}`, { status: newStatus });
      fetchBoardAndTasks();
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const handleSuggestEstimate = async () => {
    if (!title) return alert("Please enter a title first so the AI knows what the task is about.");
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const res = await api.post('/tasks/suggest-estimate', { title, description });
      if (res.data) {
        setAiSuggestion(res.data);
      }
    } catch (err) {
      console.error('AI Error', err);
      alert('Could not get AI suggestion. Check if API key is valid.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (aiSuggestion) {
      if (aiSuggestion.suggestedDueDate) setDueDate(aiSuggestion.suggestedDueDate);
      if (aiSuggestion.estimatedEffort) setEstimatedEffort(aiSuggestion.estimatedEffort);
      setAiSuggestion(null); // hide the suggestion box after accepting
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('To Do');
    setPriority('Medium');
    setDueDate('');
    setEstimatedEffort('');
    setAiSuggestion(null);
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const openEditForm = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setPriority(task.priority);
    setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    setEstimatedEffort(task.estimatedEffort || '');
    setAiSuggestion(null);
    setShowTaskForm(true);
  };

  if (!board) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
    </div>
  );

  const columns = ['To Do', 'In Progress', 'Done'];

  return (
    <div className="w-full pb-12 transition-colors duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-gray-200 dark:border-slate-800 pb-6">
        <div>
          <Link to="/dashboard" className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm flex items-center gap-1 mb-2 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Boards
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">{board.title}</h1>
          {board.description && <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">{board.description}</p>}
        </div>
        <button 
          onClick={() => { resetForm(); setShowTaskForm(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          New Task
        </button>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{editingTask ? 'Edit Task' : 'Create a new task'}</h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            {/* AI Suggestion Box */}
            {aiSuggestion && (
              <div className="mb-6 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    AI Suggestion
                  </h4>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setAiSuggestion(null)} className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">Ignore</button>
                    <button type="button" onClick={handleAcceptSuggestion} className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg transition-colors">Accept</button>
                  </div>
                </div>
                <div className="text-sm text-indigo-700 dark:text-indigo-200 space-y-1">
                  <p><strong>Estimate:</strong> {aiSuggestion.estimatedEffort}</p>
                  <p><strong>Due Date:</strong> {aiSuggestion.suggestedDueDate}</p>
                  <p className="text-xs mt-2 italic opacity-80">{aiSuggestion.reasoning}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateOrUpdateTask}>
              <div className="mb-4">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 text-sm mb-1.5">Title</label>
                <input type="text" className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="mb-4">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 text-sm mb-1.5">Description</label>
                <textarea className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" rows="3" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 text-sm mb-1.5">Status</label>
                  <select className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 text-sm mb-1.5">Priority</label>
                  <select className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" value={priority} onChange={e => setPriority(e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 text-sm mb-1.5">Due Date</label>
                  <input type="date" className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 [color-scheme:light] dark:[color-scheme:dark]" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 text-sm mb-1.5">Estimated Effort</label>
                  <input type="text" placeholder="e.g. 2 hours" className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" value={estimatedEffort} onChange={e => setEstimatedEffort(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-50 dark:border-slate-700/50">
                <button type="button" onClick={handleSuggestEstimate} disabled={aiLoading || !title} className="text-xs font-bold flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-4 py-2 rounded-xl disabled:opacity-50 transition-colors">
                  {aiLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  )}
                  AI Suggest Estimate
                </button>
                <div className="flex gap-3">
                  <button type="button" onClick={resetForm} className="px-5 py-2.5 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm">
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col);
          // Colorful borders for columns
          const borderColor = col === 'To Do' ? 'border-indigo-400 dark:border-indigo-500' : col === 'In Progress' ? 'border-amber-400 dark:border-amber-500' : 'border-emerald-400 dark:border-emerald-500';
          
          return (
            <div key={col} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 min-h-[500px]">
              <div className={`flex justify-between items-center mb-4 pb-2 border-b-2 ${borderColor}`}>
                <h3 className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-sm">{col}</h3>
                <span className="bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">{colTasks.length}</span>
              </div>
              
              <div className="space-y-4">
                {colTasks.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm font-medium border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
                    Drop items here
                  </div>
                ) : (
                  colTasks.map(task => (
                    <div key={task._id} className="group bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md dark:hover:shadow-black/40 transition-all relative">
                      
                      {/* Priority Badge */}
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          task.priority === 'High' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' :
                          task.priority === 'Medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}>
                          {task.priority}
                        </span>
                        
                        {/* Action Buttons (visible on hover) */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button onClick={() => openEditForm(task)} className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button onClick={() => handleDeleteTask(task._id)} className="text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>

                      <h4 className="font-bold text-slate-800 dark:text-white mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{task.title}</h4>
                      {task.description && (
                        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-2 leading-relaxed">{task.description}</p>
                      )}
                      
                      {task.estimatedEffort && (
                        <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-xs font-medium mb-2">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {task.estimatedEffort}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 mt-2 pt-4 border-t border-gray-50 dark:border-slate-700/50">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                        </div>
                        
                        {/* Quick move buttons */}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {col !== 'To Do' && (
                            <button onClick={() => updateTaskStatus(task, 'To Do')} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded text-[10px] font-bold uppercase transition-colors">Todo</button>
                          )}
                          {col !== 'In Progress' && (
                            <button onClick={() => updateTaskStatus(task, 'In Progress')} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 rounded text-[10px] font-bold uppercase transition-colors">Prog</button>
                          )}
                          {col !== 'Done' && (
                            <button onClick={() => updateTaskStatus(task, 'Done')} className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 rounded text-[10px] font-bold uppercase transition-colors">Done</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BoardView;
