import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function Register({ setUser }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { name, email, password });
      // Redirect to login page so they can manually log in
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center pt-16 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-indigo-50 dark:border-slate-700 transition-colors duration-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Create an account</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Start managing your tasks effectively.</p>
        </div>
        
        {error && <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-semibold p-3 rounded-lg mb-6 text-sm border border-rose-200 dark:border-rose-800/50 text-center">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
            <input 
              type="text" 
              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-800 dark:text-white" 
              placeholder="e.g. John Doe"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-800 dark:text-white" 
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
            <input 
              type="password" 
              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-800 dark:text-white" 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold py-3 rounded-xl transition-all shadow-md mt-2">
            Create Account
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account? <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Log in here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
