import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, X, Tag, TrendingUp, TrendingDown, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'EXPENSE'
  });

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/categories', { withCredentials: true });
      setCategories(res.data.categories || res.data || []);
    } catch (e) {
      console.error('Failed to fetch categories', e);
      toast.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', type: 'EXPENSE' });
    setIsModalOpen(true);
  };

  const handleEditClick = (cat) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, type: cat.type });
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      const toastId = toast.loading('Deleting category...');
      try {
        await api.delete(`/api/categories/${id}`, { withCredentials: true });
        toast.success('Category deleted successfully!', { id: toastId });
        fetchCategories();
      } catch (error) {
        console.error('DELETE ERROR:', error);
        toast.error('Cannot delete category in use', { id: toastId });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading(editingCategory ? "Updating category..." : "Saving category...");
    try {
      if (editingCategory) {
        await api.put(`/api/categories/${editingCategory.id}`, formData, { withCredentials: true });
        toast.success("Category updated successfully!", { id: toastId });
      } else {
        await api.post('/api/categories', formData, { withCredentials: true });
        toast.success("Category created successfully!", { id: toastId });
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', type: 'EXPENSE' });
      fetchCategories();
    } catch (e) {
      console.error('Failed to save category', e);
      toast.error('Error: ' + (e.response?.data?.message || 'Unknown error'), { id: toastId });
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-TextMain">Categories</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Organize your transactions efficiently.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-Primary hover:bg-opacity-90 text-white font-medium py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-sm shadow-Primary/20 transition-all whitespace-nowrap"
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat, index) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            key={cat.id} 
            className="bg-CardBg border border-CardBorder rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${cat.type === 'INCOME' ? 'bg-Income/10 text-Income' : 'bg-Expense/10 text-Expense'}`}>
                {cat.type === 'INCOME' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center">
                  <Pencil className="w-4 h-4 text-[#7c5cff] hover:text-[#6d4fe0] cursor-pointer mr-2" onClick={() => handleEditClick(cat)} />
                  <Trash2 className="w-4 h-4 text-[#ef4444] hover:text-red-700 cursor-pointer" onClick={() => handleDeleteClick(cat.id)} />
                </div>
                {cat.isCustom ? (
                  <span className="bg-Primary/10 text-Primary text-xs font-semibold px-2.5 py-1 rounded-full">Custom</span>
                ) : (
                  <span className="bg-AppBg border border-CardBorder text-TextMuted text-xs font-semibold px-2.5 py-1 rounded-full">Default</span>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg text-TextMain mb-1 truncate">{cat.name}</h3>
              <p className={`text-xs font-medium uppercase tracking-wider ${cat.type === 'INCOME' ? 'text-Income' : 'text-Expense'}`}>
                {cat.type}
              </p>
            </div>
          </motion.div>
        ))}
        
        {categories.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center text-TextMuted p-12 bg-CardBg rounded-3xl border border-dashed border-CardBorder shadow-sm">
            <div className="w-20 h-20 bg-AppBg rounded-full flex items-center justify-center mb-4">
              <Tag size={32} className="opacity-40" />
            </div>
            <h3 className="text-lg font-medium text-TextMain mb-1">No categories found</h3>
            <p className="text-sm mb-4">Create categories to organize your finances.</p>
            <button 
              onClick={openAddModal}
              className="text-Primary font-medium hover:underline"
            >
              Add your first category
            </button>
          </div>
        )}
      </div>

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
              className="bg-CardBg border border-CardBorder rounded-3xl p-8 w-full max-w-sm shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-TextMain">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
                  <p className="text-sm text-TextMuted mt-1">{editingCategory ? 'Update category details.' : 'Add a custom category.'}</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-TextMuted hover:bg-AppBg hover:text-TextMain transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className={labelClass}>Category Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    placeholder="E.g., Side Hustle" 
                    value={formData.name} 
                    onChange={handleChange} 
                    className={inputClass} 
                  />
                </div>
                
                <div>
                  <label className={labelClass}>Transaction Type</label>
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
                </div>

                <div className="pt-2">
                  <button type="submit" className="w-full bg-Primary hover:bg-opacity-90 text-white font-medium py-3.5 rounded-xl shadow-md shadow-Primary/20 transition-all">
                    {editingCategory ? 'Update Category' : 'Save Category'}
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

export default Categories;
