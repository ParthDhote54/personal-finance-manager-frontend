import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const Reports = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/reports/summary?month=${month}&year=${year}`, { withCredentials: true });
      setReport(res.data);
    } catch (e) {
      console.error('Failed to fetch report', e);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month, year]);

  const COLORS = ['#7c5cff', '#a78bfa', '#22c55e', '#f59e0b', '#06b6d4', '#f472b6', '#3b82f6'];

  let totalInc = 0;
  let totalExp = 0;
  if (report) {
     totalInc = Object.values(report.totalIncome || {}).reduce((acc, val) => acc + val, 0);
     totalExp = Object.values(report.totalExpenses || {}).reduce((acc, val) => acc + val, 0);
  }
  const barData = report ? [{ name: 'Overview', Income: totalInc, Expenses: totalExp }] : [];

  const formatPieData = (dataObj) => {
    if (!dataObj) return [];
    return Object.keys(dataObj).map(key => ({ name: key, value: dataObj[key] }));
  };

  const incomeData = formatPieData(report?.totalIncome);
  const expenseData = formatPieData(report?.totalExpenses);

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
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-TextMain">Financial Reports</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Analyze your income and expense breakdowns.</p>
        </div>
        <div className="flex gap-4">
          <select 
            value={month} 
            onChange={(e) => setMonth(parseInt(e.target.value))} 
            className="h-12 bg-CardBg border border-CardBorder px-4 rounded-xl text-base font-medium text-TextMain focus:outline-none focus:ring-4 focus:ring-Primary/10 focus:border-Primary cursor-pointer shadow-sm transition-all hover:border-Primary"
          >
            {[...Array(12).keys()].map(m => <option key={m+1} value={m+1}>{new Date(0, m).toLocaleString('default', { month: 'long' })}</option>)}
          </select>
          <select 
            value={year} 
            onChange={(e) => setYear(parseInt(e.target.value))} 
            className="h-12 bg-CardBg border border-CardBorder px-4 rounded-xl text-base font-medium text-TextMain focus:outline-none focus:ring-4 focus:ring-Primary/10 focus:border-Primary cursor-pointer shadow-sm transition-all hover:border-Primary"
          >
            {[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-Primary"></div>
        </div>
      ) : !report ? (
        <div className="bg-CardBg border border-CardBorder rounded-3xl p-12 text-center shadow-sm">
          <p className="text-TextMuted">No report data available for this period.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
          
          {/* Net Savings Card */}
          <motion.div variants={itemVariants} className="col-span-1 lg:col-span-2 bg-CardBg p-8 rounded-3xl border border-CardBorder shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
             <div>
               <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500 mb-2">Net Savings for Period</h2>
               <div className="text-4xl font-bold tracking-tight">
                 <span className={report.netSavings >= 0 ? 'text-Income' : 'text-Expense'}>
                   {report.netSavings >= 0 ? '+' : '-'}₹{Math.abs(report.netSavings).toFixed(2)}
                 </span>
               </div>
             </div>
             <div className="flex gap-8">
               <div>
                 <p className="text-sm font-medium text-slate-500 mb-1">Total Income</p>
                 <p className="text-2xl font-bold tracking-tight text-TextMain">₹{totalInc.toFixed(2)}</p>
               </div>
               <div>
                 <p className="text-sm font-medium text-slate-500 mb-1">Total Expenses</p>
                 <p className="text-2xl font-bold tracking-tight text-TextMain">₹{totalExp.toFixed(2)}</p>
               </div>
             </div>
          </motion.div>

          {/* Bar Chart */}
          <motion.div variants={itemVariants} className="bg-CardBg p-6 rounded-3xl border border-CardBorder shadow-sm col-span-1 lg:col-span-2 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-6 text-TextMain">Income vs Expenses Overview</h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="#6b7280" axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                    cursor={{fill: '#f5f7fb', opacity: 0.8}}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle"/>
                  <Bar dataKey="Income" fill="#22c55e" radius={[6, 6, 0, 0]} maxBarSize={80} />
                  <Bar dataKey="Expenses" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={80} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Income Pie */}
          <motion.div variants={itemVariants} className="bg-CardBg p-6 rounded-3xl border border-CardBorder shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-6 text-TextMain">Income Breakdown</h2>
            <div className="h-64">
              {incomeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={incomeData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none" cornerRadius={4}>
                      {incomeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-TextMuted italic bg-AppBg rounded-2xl border border-dashed border-CardBorder">No income recorded</div>
              )}
            </div>
          </motion.div>

          {/* Expense Pie */}
          <motion.div variants={itemVariants} className="bg-CardBg p-6 rounded-3xl border border-CardBorder shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-6 text-TextMain">Expense Breakdown</h2>
            <div className="h-64">
              {expenseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none" cornerRadius={4}>
                      {expenseData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-TextMuted italic bg-AppBg rounded-2xl border border-dashed border-CardBorder">No expenses recorded</div>
              )}
            </div>
          </motion.div>

        </div>
      )}
    </motion.div>
  );
};

export default Reports;
