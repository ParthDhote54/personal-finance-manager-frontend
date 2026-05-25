import React, { useContext, useState, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LayoutDashboard, ArrowLeftRight, Tag, Target, BarChart3, LogOut, Search, Bell, UserCircle, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const AppLayout = () => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [localProfileImage, setLocalProfileImage] = useState(null);

  const toggleNotif = () => {
    setIsNotifOpen(!isNotifOpen);
    if (isProfileOpen) setIsProfileOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    if (isNotifOpen) setIsNotifOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
      isActive 
        ? 'bg-Primary/10 text-Primary font-semibold' 
        : 'text-TextMuted hover:bg-gray-50 hover:text-Primary'
    }`;

  // Get dynamic greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const swipeHandlers = useSwipeable({
    onSwipedRight: () => setIsSidebarOpen(true),
    onSwipedLeft: () => setIsSidebarOpen(false),
    preventDefaultTouchmoveEvent: true,
    trackMouse: false
  });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const toastId = toast.loading('Uploading profile picture...');
    try {
      const response = await api.post('/api/auth/profile-image', formData, { 
        withCredentials: true, 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      setLocalProfileImage(response.data.profileImage);
      toast.success('Profile picture updated!', { id: toastId });
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image', { id: toastId });
    }
  };

  return (
    <div {...swipeHandlers} className="flex h-screen bg-AppBg text-TextMain font-sans overflow-hidden">
      <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
      {/* Mobile & Tablet Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-CardBg flex flex-col p-4 shadow-2xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-CardBorder lg:shadow-sm`}
      >
        <div className="mb-10 mt-4 flex items-center gap-2 px-4">
          <div className="w-8 h-8 rounded-lg bg-Primary flex items-center justify-center text-white font-bold text-xl">
            L
          </div>
          <span className="text-xl font-bold tracking-tight text-TextMain">Ledgerly</span>
        </div>

        <div className="mt-2 mb-8 p-4 bg-slate-50 rounded-xl flex flex-col items-center text-center border border-slate-100 shadow-sm mx-2">
          <div 
            onClick={() => fileInputRef.current.click()} 
            className="w-20 h-20 bg-[#7c5cff] rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-inner cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
            title="Click to upload profile picture"
          >
            {(localProfileImage || user?.profileImage) ? (
              <img src={localProfileImage || user.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.fullName?.charAt(0)?.toUpperCase() || 'U'
            )}
          </div>
          <p className="text-sm font-semibold text-slate-800 mt-3">{user?.fullName || 'User'}</p>
          <p className="text-xs text-slate-500 truncate w-full mt-0.5">{user?.username || ''}</p>
        </div>
        
        <div className="flex flex-col gap-2 flex-1">
          <NavLink to="/" onClick={() => setIsSidebarOpen(false)} className={navClass}><LayoutDashboard size={20} /> Dashboard</NavLink>
          <NavLink to="/transactions" onClick={() => setIsSidebarOpen(false)} className={navClass}><ArrowLeftRight size={20} /> Transactions</NavLink>
          <NavLink to="/categories" onClick={() => setIsSidebarOpen(false)} className={navClass}><Tag size={20} /> Categories</NavLink>
          <NavLink to="/goals" onClick={() => setIsSidebarOpen(false)} className={navClass}><Target size={20} /> Goals</NavLink>
          <NavLink to="/reports" onClick={() => setIsSidebarOpen(false)} className={navClass}><BarChart3 size={20} /> Reports</NavLink>
        </div>

        <div className="mt-auto border-t border-CardBorder pt-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-Expense hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </motion.div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="h-20 bg-CardBg/80 backdrop-blur-md border-b border-CardBorder flex items-center justify-between px-8 z-10 sticky top-0"
        >
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 -ml-2 text-TextMuted hover:text-Primary transition-colors rounded-xl hover:bg-slate-100"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-TextMain">
                {greeting}, {user?.fullName || user?.username || 'User'} <span className="text-2xl hidden md:inline">👋</span>
              </h2>
              <p className="hidden md:block text-sm font-medium text-TextMuted mt-0.5">Here's your financial overview</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-TextMuted" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-AppBg border border-CardBorder rounded-full text-sm focus:outline-none focus:border-Primary focus:ring-1 focus:ring-Primary transition-all w-64"
              />
            </div>
            
            <div className="relative">
              <button 
                onClick={toggleNotif}
                className="relative p-2 text-TextMuted hover:text-Primary transition-colors rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-CardBg"></span>
              </button>
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-4 z-50">
                  <h3 className="font-bold text-slate-800 mb-2">Notifications</h3>
                  <p className="text-sm text-slate-500">No new notifications</p>
                </div>
              )}
            </div>
            
            <div className="relative border-l border-CardBorder pl-4">
              <button 
                onClick={toggleProfile}
                className="relative p-2 text-TextMuted hover:text-Primary transition-colors rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <UserCircle size={24} />
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-4 z-50">
                  <p className="text-lg font-bold text-slate-800 truncate">{user?.fullName}</p>
                  <p className="text-sm text-slate-500 truncate">{user?.username}</p>
                  <div className="my-3 border-t border-slate-100"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left text-sm text-red-500 hover:text-red-700 font-medium cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-AppBg scroll-smooth">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
