import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Target as TargetIcon } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [report, setReport] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const d = new Date();
        const m = d.getMonth() + 1;
        const y = d.getFullYear();

        const [reportRes, transRes, goalsRes] = await Promise.all([
          api.get(`/api/reports/monthly/${y}/${m}`),
          api.get('/api/transactions'),
          api.get('/api/goals')
        ]);

        setReport(reportRes.data);
        setTransactions(transRes.data.transactions || transRes.data || []);
        setGoals(goalsRes.data.goals || goalsRes.data || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-Primary"></div>
      </div>
    );
  }

  // Calculate Metrics
  const totalIncomeSum = report?.totalIncome ? Object.values(report.totalIncome).reduce((a, b) => a + b, 0) : 0;
  const totalExpenseSum = report?.totalExpenses ? Object.values(report.totalExpenses).reduce((a, b) => a + b, 0) : 0;
  const netSavings = report?.netSavings || 0;

  // Mock Historical Data for Area Chart
  const areaData = [
    { name: 'Jan', balance: netSavings * 0.4 },
    { name: 'Feb', balance: netSavings * 0.6 },
    { name: 'Mar', balance: netSavings * 0.5 },
    { name: 'Apr', balance: netSavings * 0.8 },
    { name: 'May', balance: netSavings }
  ];

  // Expenses Breakdown for Donut Chart
  const expenseData = report?.totalExpenses 
    ? Object.entries(report.totalExpenses).map(([name, value]) => ({ name, value })) 
    : [];
  const COLORS = ['#7c5cff', '#a78bfa', '#22c55e', '#f59e0b', '#06b6d4'];

  const recentTransactions = transactions.slice(0, 5);
  const activeGoals = goals.slice(0, 3); // Show top 3 goals

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      
      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="bg-CardBg border border-CardBorder rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Total Balance</p>
              <h3 className="text-4xl font-bold tracking-tight text-TextMain">₹{netSavings.toFixed(2)}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-Primary/10 flex items-center justify-center text-Primary">
              <Wallet size={24} />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-Income flex items-center font-medium bg-Income/10 px-2 py-0.5 rounded-full">
              <ArrowUpRight size={16} className="mr-1" /> +12.5%
            </span>
            <span className="text-TextMuted ml-2">vs last month</span>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-CardBg border border-CardBorder rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Total Income</p>
              <h3 className="text-4xl font-bold tracking-tight text-TextMain">₹{totalIncomeSum.toFixed(2)}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-Income/10 flex items-center justify-center text-Income">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-Income flex items-center font-medium bg-Income/10 px-2 py-0.5 rounded-full">
              <ArrowUpRight size={16} className="mr-1" /> +4.2%
            </span>
            <span className="text-TextMuted ml-2">vs last month</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-CardBg border border-CardBorder rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Total Expenses</p>
              <h3 className="text-4xl font-bold tracking-tight text-TextMain">₹{totalExpenseSum.toFixed(2)}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-Expense/10 flex items-center justify-center text-Expense">
              <TrendingDown size={24} />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-Expense flex items-center font-medium bg-Expense/10 px-2 py-0.5 rounded-full">
              <ArrowDownRight size={16} className="mr-1" /> -1.8%
            </span>
            <span className="text-TextMuted ml-2">vs last month</span>
          </div>
        </motion.div>
      </div>

      {/* GRAPHS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AREA CHART */}
        <motion.div variants={itemVariants} className="bg-CardBg border border-CardBorder rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-TextMain font-semibold text-xl">Cash Flow Overview</h2>
            <select className="bg-AppBg border border-CardBorder text-sm rounded-lg px-3 py-1 focus:outline-none focus:ring-1 focus:ring-Primary text-TextMuted">
              <option>This Year</option>
              <option>Last 6 Months</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c5cff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#7c5cff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#7c5cff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="balance" stroke="#7c5cff" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* DONUT CHART */}
        <motion.div variants={itemVariants} className="bg-CardBg border border-CardBorder rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 lg:col-span-1 flex flex-col">
          <h2 className="text-TextMain font-semibold text-xl mb-4">Spending by Category</h2>
          <div className="flex-1 flex justify-center items-center">
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={4}
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-TextMuted h-full">
                <div className="w-16 h-16 bg-AppBg rounded-full flex items-center justify-center mb-3">
                  <TrendingDown className="opacity-50" />
                </div>
                <p className="text-sm">No expenses yet</p>
              </div>
            )}
          </div>
          {/* Custom Legend */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {expenseData.slice(0, 4).map((entry, idx) => (
              <div key={idx} className="flex items-center text-xs text-TextMuted">
                <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
        
        {/* TRANSACTIONS FEED */}
        <motion.div variants={itemVariants} className="bg-CardBg border border-CardBorder rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-TextMain font-semibold text-xl">Recent Activity</h2>
            <button className="text-sm font-medium text-Primary hover:text-indigo-700 transition-colors">View All</button>
          </div>
          <div className="flex flex-col gap-4">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-AppBg transition-colors group cursor-pointer border border-transparent hover:border-CardBorder">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === 'INCOME' ? 'bg-Income/10 text-Income' : 'bg-Expense/10 text-Expense'}`}>
                    {tx.type === 'INCOME' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div>
                    <p className="text-TextMain font-semibold group-hover:text-Primary transition-colors">{tx.description}</p>
                    <p className="text-TextMuted text-xs mt-0.5">{tx.category} • {tx.date}</p>
                  </div>
                </div>
                <div className={`font-bold ${tx.type === 'INCOME' ? 'text-Income' : 'text-TextMain'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                </div>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <div className="text-center py-8 text-TextMuted bg-AppBg rounded-2xl border border-dashed border-CardBorder">
                No recent activity.
              </div>
            )}
          </div>
        </motion.div>

        {/* GOALS PROGRESS BARS */}
        <motion.div variants={itemVariants} className="bg-CardBg border border-CardBorder rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 lg:col-span-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-TextMain font-semibold text-xl">Active Goals</h2>
            <TargetIcon size={20} className="text-Primary" />
          </div>
          
          <div className="flex flex-col gap-6">
            {activeGoals.map((goal, idx) => {
              const progress = Math.min(goal.progressPercentage || 0, 100);
              return (
                <div key={goal.id || idx} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <h3 className="text-TextMain font-medium">{goal.goalName}</h3>
                      <p className="text-xs text-TextMuted mt-0.5">Target: {goal.targetDate}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-Primary font-bold text-sm">{Math.round(progress)}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-AppBg rounded-full h-2.5 mb-1 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 + (idx * 0.1) }}
                      className="bg-gradient-to-r from-Primary to-Secondary h-2.5 rounded-full"
                    ></motion.div>
                  </div>
                  <div className="flex justify-between text-xs text-TextMuted">
                    <span>₹{(goal.currentProgress || 0).toFixed(0)}</span>
                    <span>₹{goal.targetAmount.toFixed(0)}</span>
                  </div>
                </div>
              );
            })}
            
            {activeGoals.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-TextMuted p-8 bg-AppBg rounded-2xl border border-dashed border-CardBorder mt-4">
                <TargetIcon size={32} className="opacity-20 mb-3" />
                <p className="text-sm">No active goals yet.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
