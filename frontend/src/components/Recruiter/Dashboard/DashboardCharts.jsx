import React from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const DashboardCharts = ({ monthlyData, applicationSummary, stats }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Area Chart - Application Trends */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300"
            >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black text-black">Application Trends</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Monthly metrics</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                            <span className="text-[10px] font-black text-slate-500 uppercase">Applied</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-purple-600"></span>
                            <span className="text-[10px] font-black text-slate-500 uppercase">Interviewed</span>
                        </div>
                    </div>
                </div>

                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData}>
                            <defs>
                                <linearGradient id="colorApplied" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorInterview" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                            <XAxis
                                dataKey="month"
                                stroke="#94a3b8"
                                tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #f1f5f9',
                                    borderRadius: '16px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                    padding: '12px'
                                }}
                                itemStyle={{ fontWeight: 'bold' }}
                                cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="applied"
                                stroke="#2563EB"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorApplied)"
                                name="Applied"
                            />
                            <Area
                                type="monotone"
                                dataKey="interview"
                                stroke="#7C3AED"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorInterview)"
                                name="Interviewed"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Pie Chart - Pipeline Status */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300"
            >
                <h3 className="text-xl font-black text-black mb-8">Pipeline Status</h3>
                <div className="h-64 w-full relative mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={applicationSummary}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={8}
                                dataKey="value"
                                animationBegin={400}
                                cornerRadius={10}
                            >
                                {applicationSummary?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #f1f5f9',
                                    borderRadius: '16px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                }}
                                itemStyle={{ fontWeight: 'bold' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text Overly */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <p className="text-4xl font-black text-black tracking-tighter">{stats?.totalApplications || 0}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total</p>
                    </div>
                </div>
                {/* Custom Legend */}
                <div className="grid grid-cols-1 gap-3">
                    {applicationSummary?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl group hover:bg-white border border-transparent hover:border-slate-100 transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-6 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{item.name}</span>
                            </div>
                            <span className="font-black text-black">{item.value}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default DashboardCharts;
