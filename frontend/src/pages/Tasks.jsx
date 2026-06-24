import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching all tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const updateTaskStatus = async (task, newStatus) => {
    try {
      await api.put(`/tasks/${task._id}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  return (
    <div className="w-full pb-12 transition-colors duration-200">
      <div className="flex justify-between items-end mb-8 border-b border-gray-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">All Tasks</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">A high-level view of everything on your plate.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
          <p className="text-gray-500 dark:text-slate-500 font-medium">You don't have any tasks across any boards yet.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="p-4">Task Title</th>
                <th className="p-4">Status</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Due Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task._id} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{task.title}</div>
                    {task.description && <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">{task.description}</div>}
                  </td>
                  <td className="p-4">
                    <select 
                      value={task.status} 
                      onChange={(e) => updateTaskStatus(task, e.target.value)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        task.status === 'Done' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50' : 
                        task.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50' : 
                        'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
                      }`}
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                      task.priority === 'High' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' :
                      task.priority === 'Medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-4 text-right">
                    <Link to={`/board/${task.board}`} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition-colors">
                      View Board →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Tasks;
