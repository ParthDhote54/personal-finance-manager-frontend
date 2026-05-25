import React, { useState, useContext } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(formData.username, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  const inputClass = "w-full h-12 bg-AppBg border border-CardBorder rounded-xl px-4 text-TextMain focus:outline-none focus:ring-4 focus:ring-Primary/10 focus:border-Primary shadow-sm transition-all";

  return (
    <div className="min-h-screen bg-AppBg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-Primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-Secondary/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-CardBg border border-CardBorder rounded-3xl p-10 shadow-2xl relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-Primary flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-Primary/30">
            L
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-2 text-TextMain tracking-tight">Welcome Back</h1>
        <p className="text-TextMuted text-center mb-8">Sign in to Ledgerly</p>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-Expense/10 border border-Expense/20 text-Expense p-3 rounded-xl mb-6 text-sm text-center font-medium"
          >
            {error}
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1.5 ml-1">Email</label>
            <input 
              type="email" 
              name="username" 
              placeholder="name@example.com" 
              required 
              value={formData.username} 
              onChange={handleChange} 
              className={inputClass} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1.5 ml-1">Password</label>
            <input 
              type="password" 
              name="password" 
              placeholder="••••••••" 
              required 
              value={formData.password} 
              onChange={handleChange} 
              className={inputClass} 
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-Primary hover:bg-opacity-90 text-white font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-Primary/20 mt-6 disabled:opacity-70 flex justify-center items-center h-[52px]"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        
        <div className="text-center text-sm text-TextMuted mt-8">
          Don't have an account? <NavLink to="/register" className="text-Primary font-semibold hover:underline ml-1">Create Account</NavLink>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
