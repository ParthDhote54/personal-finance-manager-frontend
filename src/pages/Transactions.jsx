import React, { useState, useEffect } from 'react';
import { Plus, X, Search, Filter, TrendingUp, TrendingDown, Pencil, Trash2 } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    categoryId: ''
  });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const [formData, setFormData] = useState({
    amount: '',
    type: 'EXPENSE',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);

      const [txnRes, catRes] = await Promise.all([
        api.get(`/api/transactions?${params.toString()}`, { withCredentials: true }),
        api.get('/api/categories', { withCredentials: true })
      ]);
      setTransactions(txnRes.data.transactions || txnRes.data || []);
      setCategories(catRes.data.categories || catRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error("Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const openAddModal = () => {
    setEditingTransaction(null);
    setFormData({
      amount: '',
      type: 'EXPENSE',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (txn) => {
    setEditingTransaction(txn);
    setFormData({
      amount: txn.amount,
      type: txn.type,
      category: txn.category || '',
      description: txn.description,
      date: txn.date
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      const toastId = toast.loading('Deleting transaction...');
      try {
        await api.delete(`/api/transactions/${id}`, { withCredentials: true });
        toast.success('Transaction deleted successfully!', { id: toastId });
        fetchData();
      } catch (error) {
        console.error('DELETE ERROR:', error);
        toast.error('Failed to delete transaction.', { id: toastId });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      amount: Number(formData.amount),
      type: formData.type,
      category: formData.category,
      description: formData.description,
      date: formData.date
    };
    
    const toastId = toast.loading(editingTransaction ? 'Updating transaction...' : 'Saving transaction...');
    try {
      if (editingTransaction) {
        await api.put(`/api/transactions/${editingTransaction.id}`, payload, { withCredentials: true });
        toast.success('Transaction updated successfully!', { id: toastId });
      } else {
        await api.post('/api/transactions', payload, { withCredentials: true });
        toast.success('Transaction saved successfully!', { id: toastId });
      }
      setIsModalOpen(false);
      setEditingTransaction(null);
      setFormData({
        amount: '',
        type: 'EXPENSE',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchData();
    } catch (error) {
      console.error('TRANSACTION ERROR:', error.response?.data);
      toast.error('Error: ' + (error.response?.data?.message || 'Unknown error'), { id: toastId });
    }
  };

  const inputClass = "w-full h-12 bg-AppBg border border-CardBorder rounded-xl px-4 text-TextMain focus:outline-none focus:ring-4 focus:ring-Primary/10 focus:border-Primary shadow-sm transition-all";
  const labelClass = "block text-sm font-medium text-slate-500 mb-1.5";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-Primary"></div>
      </div>
    );
  }

  const filteredTransactions = transactions.filter(txn => 
    txn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    txn.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-TextMain">Transactions</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage and track your income and expenses.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-TextMuted" size={18} />
            <input 
              type="text" 
              placeholder="Search transactions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-CardBg border border-CardBorder rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-Primary transition-all"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 border rounded-xl transition-colors ${showFilters ? 'bg-Primary/10 text-Primary border-Primary/20' : 'bg-CardBg text-TextMuted border-CardBorder hover:text-Primary'}`}
          >
            <Filter size={18} />
          </button>
          <button
            onClick={openAddModal}
            className="bg-Primary hover:bg-opacity-90 text-white font-medium py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-sm shadow-Primary/20 transition-all whitespace-nowrap"
          >
            <Plus size={18} /> Add New
          </button>
        </div>
      </div>

      {/* Filters UI */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-CardBg border border-CardBorder rounded-3xl p-5 shadow-sm flex flex-col md:flex-row gap-4 overflow-hidden"
          >
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Start Date</label>
              <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full bg-AppBg border border-CardBorder rounded-xl px-4 h-11 text-sm focus:outline-none focus:ring-1 focus:ring-Primary transition-all text-TextMain" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">End Date</label>
              <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full bg-AppBg border border-CardBorder rounded-xl px-4 h-11 text-sm focus:outline-none focus:ring-1 focus:ring-Primary transition-all text-TextMain" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Category</label>
              <select name="categoryId" value={filters.categoryId} onChange={handleFilterChange} className="w-full bg-AppBg border border-CardBorder rounded-xl px-4 h-11 text-sm focus:outline-none focus:ring-1 focus:ring-Primary transition-all text-TextMain">
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex items-end pb-0.5">
              <button 
                onClick={() => setFilters({ startDate: '', endDate: '', categoryId: '' })}
                className="w-full md:w-auto px-5 h-11 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transactions List */}
      <div className="bg-CardBg border border-CardBorder rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-AppBg/50">
              <tr className="text-TextMuted border-b border-CardBorder">
                <th className="py-4 px-6 font-medium">Description</th>
                <th className="py-4 px-6 font-medium">Category</th>
                <th className="py-4 px-6 font-medium">Date</th>
                <th className="py-4 px-6 font-medium text-right">Amount</th>
                <th className="py-4 px-6 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-TextMuted py-12 bg-CardBg">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-AppBg rounded-full flex items-center justify-center mb-4">
                        <TrendingDown size={24} className="text-TextMuted opacity-50" />
                      </div>
                      <p>No transactions found.</p>
                      <button onClick={openAddModal} className="text-Primary text-sm font-medium mt-2 hover:underline">
                        Create your first transaction
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={txn.id} 
                    className="border-b border-CardBorder last:border-none hover:bg-AppBg/50 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${txn.type === 'INCOME' ? 'bg-Income/10 text-Income' : 'bg-Expense/10 text-Expense'}`}>
                          {txn.type === 'INCOME' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                        </div>
                        <span className="text-TextMain font-medium group-hover:text-Primary transition-colors">{txn.description}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-AppBg border border-CardBorder text-TextMuted text-xs px-2.5 py-1 rounded-full font-medium">
                        {txn.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-TextMuted">{txn.date}</td>
                    <td className={`py-4 px-6 text-right font-bold ${txn.type === 'INCOME' ? 'text-Income' : 'text-TextMain'}`}>
                      {txn.type === 'INCOME' ? '+' : '-'}₹{txn.amount.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center">
                        <Pencil className="w-4 h-4 text-[#7c5cff] hover:text-[#6d4fe0] cursor-pointer mr-3" onClick={() => handleEditClick(txn)} />
                        <Trash2 className="w-4 h-4 text-[#ef4444] hover:text-red-700 cursor-pointer" onClick={() => handleDeleteClick(txn.id)} />
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
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
              className="bg-CardBg border border-CardBorder rounded-3xl p-8 w-full max-w-lg shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-TextMain">{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
                  <p className="text-sm text-TextMuted mt-1">Fill in the details below.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="w-8 h-8 flex items-center justify-center rounded-full text-TextMuted hover:bg-AppBg hover:text-TextMain transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex gap-4 p-1 bg-AppBg rounded-xl border border-CardBorder">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: 'EXPENSE' }))}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${formData.type === 'EXPENSE' ? 'bg-CardBg shadow-sm text-Expense' : 'text-TextMuted hover:text-TextMain'}`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: 'INCOME' }))}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${formData.type === 'INCOME' ? 'bg-CardBg shadow-sm text-Income' : 'text-TextMuted hover:text-TextMain'}`}
                  >
                    Income
                  </button>
                </div>

                <div>
                  <label className={labelClass}>Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-TextMuted">₹</span>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      className={`${inputClass} pl-8`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.filter(cat => cat.type === formData.type).map((cat) => (
                      <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="E.g., Groceries, Rent, Salary"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-Primary hover:bg-opacity-90 text-white font-medium py-3.5 rounded-xl shadow-md shadow-Primary/20 transition-all flex items-center justify-center gap-2"
                  >
                    {editingTransaction ? 'Update Transaction' : 'Save Transaction'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Transactions;