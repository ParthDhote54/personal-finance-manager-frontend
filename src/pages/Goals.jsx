import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, X, Target as TargetIcon, PlusCircle, Trophy, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [fundingGoal, setFundingGoal] = useState(null);
  const [fundAmount, setFundAmount] = useState('');
  const [editingGoal, setEditingGoal] = useState(null);
  
  const [formData, setFormData] = useState({
    goalName: '',
    targetAmount: '',
    startDate: '',
    targetDate: '',
    description: ''
  });

  const fetchGoals = async () => {
    try {
      const res = await api.get('/api/goals', { withCredentials: true });
      setGoals(res.data);
    } catch (e) {
      console.error('Failed to fetch goals', e);
      toast.error("Failed to load goals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (Number(formData.targetAmount) <= 0) {
      toast.error("Target amount must be positive.");
      return;
    }
    
    if (new Date(formData.targetDate) < new Date(formData.startDate)) {
      toast.error("Target date cannot be earlier than start date.");
      return;
    }
    
    const payload = {
      goalName: formData.goalName,
      targetAmount: Number(formData.targetAmount),
      startDate: formData.startDate,
      targetDate: formData.targetDate,
      description: formData.description
    };
    
    const toastId = toast.loading(editingGoal ? "Updating goal..." : "Creating goal...");
    
    try {
      if (editingGoal) {
        await api.put(`/api/goals/${editingGoal.id}`, payload, { withCredentials: true });
        toast.success("Goal updated successfully!", { id: toastId });
      } else {
        await api.post('/api/goals', payload, { withCredentials: true });
        toast.success("Goal created successfully!", { id: toastId });
      }
      setFormData({ goalName: '', targetAmount: '', startDate: '', targetDate: '', description: '' });
      setEditingGoal(null);
      setIsModalOpen(false);
      fetchGoals();
    } catch (error) {
      console.error("GOAL SUBMIT ERROR:", error);
      toast.error(error.response?.data?.message || "Failed to save goal.", { id: toastId });
    }
  };

  const closeMainModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
    setFormData({ goalName: '', targetAmount: '', startDate: '', targetDate: '', description: '' });
  };

  const handleEditClick = (goal) => {
    setEditingGoal(goal);
    setFormData({
      goalName: goal.goalName,
      targetAmount: goal.targetAmount.toString(),
      startDate: goal.startDate,
      targetDate: goal.targetDate,
      description: goal.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure? The funds in this goal will be reverted to your income.")) {
      const toastId = toast.loading("Deleting goal...");
      try {
        await api.delete(`/api/goals/${id}`, { withCredentials: true });
        toast.success("Goal deleted. Funds reverted.", { id: toastId });
        fetchGoals();
      } catch (error) {
        console.error("DELETE GOAL ERROR:", error);
        toast.error("Failed to delete goal.", { id: toastId });
      }
    }
  };

  const handleFundClick = (goal) => {
    setFundingGoal(goal);
    setFundAmount('');
    setIsFundModalOpen(true);
  };

  const handleFundSubmit = async (e) => {
    e.preventDefault();
    if (Number(fundAmount) <= 0) {
      toast.error("Amount must be positive.");
      return;
    }

    const toastId = toast.loading("Adding funds...");
    try {
      await api.post(`/api/goals/${fundingGoal.id}/fund`, { amount: Number(fundAmount) }, { withCredentials: true });
      toast.success("Funds added successfully!", { id: toastId });
      setIsFundModalOpen(false);
      setFundingGoal(null);
      fetchGoals();
    } catch (error) {
      console.error("FUND GOAL ERROR:", error);
      toast.error(error.response?.data?.message || "Failed to add funds.", { id: toastId });
    }
  };

  const todayDate = new Date().toISOString().split("T")[0];
  
  const inputClass = "w-full h-12 bg-AppBg border border-CardBorder rounded-xl px-4 text-TextMain focus:outline-none focus:ring-4 focus:ring-Primary/10 focus:border-Primary shadow-sm transition-all";
  const labelClass = "block text-sm font-medium text-slate-500 mb-1.5";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-Primary"></div>
      </div>
    );
  }

  const activeGoals = goals.filter(g => !g.isAchieved);
  const achievedGoals = goals.filter(g => g.isAchieved);

  const renderGoalCard = (goal, index) => {
    const progress = Math.min(goal.progressPercentage || 0, 100);
    const isAchieved = goal.isAchieved;

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        key={goal.id} 
        className="bg-CardBg border border-CardBorder rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 group relative"
      >
        {isAchieved && (
          <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 z-10 border-2 border-CardBg">
            <Trophy size={12} /> Achieved!
          </div>
        )}
        <div className="flex justify-between items-start mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${isAchieved ? 'bg-emerald-500/10 text-emerald-500' : 'bg-Primary/10 text-Primary'}`}>
            <TargetIcon size={24} />
          </div>
          <div className="flex items-center gap-2">
            {!isAchieved && (
              <button 
                onClick={() => handleFundClick(goal)}
                className="text-Primary hover:text-indigo-400 bg-Primary/10 hover:bg-Primary/20 p-1.5 rounded-xl transition-colors flex items-center gap-1"
                title="Add Funds"
              >
                <PlusCircle size={18} />
              </button>
            )}
            <button
              onClick={() => handleEditClick(goal)}
              className="text-TextMuted hover:text-blue-500 bg-AppBg hover:bg-blue-500/10 p-1.5 rounded-xl transition-colors border border-CardBorder"
              title="Edit Goal"
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={() => handleDeleteClick(goal.id)}
              className="text-TextMuted hover:text-red-500 bg-AppBg hover:bg-red-500/10 p-1.5 rounded-xl transition-colors border border-CardBorder"
              title="Delete Goal"
            >
              <Trash2 size={18} />
            </button>
            <span className="bg-AppBg border border-CardBorder text-TextMuted text-xs px-2.5 py-1 rounded-full font-medium ml-1">
              {goal.targetDate}
            </span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-TextMain mb-1 pr-8 truncate">{goal.goalName}</h3>
        <p className="text-TextMuted text-sm mb-6 line-clamp-2 min-h-[40px]">
          {goal.description || "No description provided."}
        </p>
        
        <div className="mb-2 flex justify-between items-end">
          <div className="text-sm">
            <span className="text-TextMain font-bold">₹{(goal.currentProgress || 0).toFixed(2)}</span>
            <span className="text-TextMuted"> / ₹{goal.targetAmount.toFixed(2)}</span>
          </div>
          <span className={`font-bold text-lg ${isAchieved ? 'text-emerald-500' : 'text-Primary'}`}>{Math.round(progress)}%</span>
        </div>
        
        <div className="w-full bg-AppBg rounded-full h-3 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 + (index * 0.1) }}
            className={`h-full rounded-full ${isAchieved ? 'bg-emerald-500' : 'bg-gradient-to-r from-Primary to-Secondary'}`}
          ></motion.div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-TextMain">Financial Goals</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Set and track your savings targets.</p>
        </div>
        <button 
          onClick={() => {
            setEditingGoal(null);
            setFormData({ goalName: '', targetAmount: '', startDate: '', targetDate: '', description: '' });
            setIsModalOpen(true);
          }}
          className="bg-Primary hover:bg-opacity-90 text-white font-medium py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-sm shadow-Primary/20 transition-all whitespace-nowrap"
        >
          <Plus size={18} /> Add Goal
        </button>
      </div>

      {goals.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-TextMain mb-4 flex items-center gap-2">Active Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeGoals.length > 0 ? activeGoals.map((goal, i) => renderGoalCard(goal, i)) : (
              <div className="col-span-full text-TextMuted p-6 bg-CardBg rounded-2xl border border-dashed border-CardBorder text-center text-sm font-medium">
                No active goals. You've achieved them all!
              </div>
            )}
          </div>
        </div>
      )}

      {achievedGoals.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-TextMain mb-4 flex items-center gap-2">Achieved Goals <Trophy size={18} className="text-emerald-500" /></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievedGoals.map((goal, i) => renderGoalCard(goal, i))}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center text-TextMuted p-12 bg-CardBg rounded-3xl border border-dashed border-CardBorder shadow-sm mt-8">
          <div className="w-20 h-20 bg-AppBg rounded-full flex items-center justify-center mb-4">
            <TargetIcon size={32} className="opacity-40" />
          </div>
          <h3 className="text-lg font-medium text-TextMain mb-1">No goals active</h3>
          <p className="text-sm mb-4">Click "Add Goal" to start tracking your savings.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-Primary font-medium hover:underline"
          >
            Create your first goal
          </button>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-TextMain/20 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-CardBg border border-CardBorder rounded-3xl p-8 w-full max-w-md shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-TextMain">{editingGoal ? 'Edit Goal' : 'Add New Goal'}</h2>
                  <p className="text-sm text-TextMuted mt-1">{editingGoal ? 'Update your target and timeline' : 'What are you saving for?'}</p>
                </div>
                <button 
                  onClick={closeMainModal}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-TextMuted hover:bg-AppBg hover:text-TextMain transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className={labelClass}>Goal Name</label>
                  <input 
                    type="text" 
                    name="goalName" 
                    required 
                    value={formData.goalName} 
                    onChange={handleChange} 
                    className={inputClass}
                    placeholder="e.g., New Car, Vacation"
                  />
                </div>
                <div>
                  <label className={labelClass}>Target Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-TextMuted">₹</span>
                    <input 
                      type="number" 
                      name="targetAmount" 
                      required 
                      step="0.01" 
                      value={formData.targetAmount} 
                      onChange={handleChange} 
                      className={`${inputClass} pl-8`}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Start Date</label>
                    <input 
                      type="date" 
                      name="startDate" 
                      required 
                      value={formData.startDate} 
                      onChange={handleChange} 
                      min={todayDate} 
                      onKeyDown={(e) => e.preventDefault()} 
                      className={inputClass} 
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Target Date</label>
                    <input 
                      type="date" 
                      name="targetDate" 
                      required 
                      value={formData.targetDate} 
                      onChange={handleChange} 
                      min={formData.startDate || todayDate} 
                      onKeyDown={(e) => e.preventDefault()} 
                      className={inputClass} 
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Description (Optional)</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    className={`${inputClass} resize-none py-3 h-24`} 
                    placeholder="Add some details about this goal..."
                  />
                </div>
                <div className="pt-2">
                  <button type="submit" className="w-full bg-Primary hover:bg-opacity-90 text-white font-medium py-3.5 rounded-xl shadow-md shadow-Primary/20 transition-all">
                    {editingGoal ? 'Update Goal' : 'Create Goal'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Add Funds Modal */}
      <AnimatePresence>
        {isFundModalOpen && fundingGoal && (() => {
          const remainingAmount = fundingGoal.targetAmount - (fundingGoal.currentProgress || 0);
          const isExceeding = Number(fundAmount) > remainingAmount;
          const isInvalid = Number(fundAmount) <= 0 || isExceeding;

          return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-TextMain/20 backdrop-blur-sm"
              onClick={() => setIsFundModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-CardBg border border-CardBorder rounded-3xl p-8 w-full max-w-sm shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-TextMain">Add Funds</h2>
                  <p className="text-sm text-TextMuted mt-1">{fundingGoal.goalName}</p>
                </div>
                <button 
                  onClick={() => setIsFundModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-TextMuted hover:bg-AppBg hover:text-TextMain transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleFundSubmit} className="space-y-5">
                <div>
                  <label className={labelClass}>Amount to Add (₹)</label>
                  <p className="text-xs text-TextMuted mb-2">Remaining amount: ₹{remainingAmount.toFixed(2)}</p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-TextMuted">₹</span>
                    <input 
                      type="number" 
                      required 
                      step="0.01" 
                      max={remainingAmount}
                      value={fundAmount} 
                      onChange={(e) => setFundAmount(e.target.value)} 
                      className={`${inputClass} pl-8 ${isExceeding ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                      placeholder="0.00"
                    />
                  </div>
                  {isExceeding && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium">Amount exceeds remaining goal amount</p>
                  )}
                </div>
                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isInvalid}
                    className={`w-full font-medium py-3.5 rounded-xl shadow-md transition-all ${isInvalid ? 'bg-CardBorder text-TextMuted cursor-not-allowed shadow-none' : 'bg-Primary hover:bg-opacity-90 text-white shadow-Primary/20'}`}
                  >
                    Confirm Funds
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
          );
        })()}
      </AnimatePresence>
    </motion.div>
  );
};

export default Goals;
