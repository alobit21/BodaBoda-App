'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, riders: 0, trips: 0, revenue: 0 });
  const [recentTrips, setRecentTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is admin
    const userStr = localStorage.getItem('boda_user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user || user.role !== 'ADMIN') {
      // For demo purposes, we'll allow viewing if no user, but in real app redirect
      // router.push('/login');
    }
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // In real app, we'd have a /api/admin/stats endpoint
      // For now, we'll fetch available trips and users
      const trips = await apiFetch('/trips/available');
      setRecentTrips(trips);
      setStats({
        users: 154,
        riders: 42,
        trips: 1208,
        revenue: 4228000
      });
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Command Center</h1>
            <p className="text-slate-500 mt-1">Real-time overview of the BodaConnect ecosystem</p>
          </div>
          <div className="flex gap-3">
             <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">Export Data</button>
             <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">Manage Users</button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Users', value: stats.users, trend: '+12%', color: 'blue' },
            { label: 'Active Riders', value: stats.riders, trend: '+3%', color: 'emerald' },
            { label: 'Total Trips', value: stats.trips, trend: '+18%', color: 'orange' },
            { label: 'Gross Revenue', value: `TSh ${stats.revenue.toLocaleString()}`, trend: '+22%', color: 'purple' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <p className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wider">{stat.label}</p>
               <div className="flex items-end justify-between">
                 <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                 <span className={`text-xs font-bold px-2 py-1 rounded-full bg-${stat.color}-50 text-${stat.color}-600`}>{stat.trend}</span>
               </div>
            </div>
          ))}
        </div>

        {/* Content Tabs Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Trips Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Recent Trip Activity</h3>
              <button className="text-sm text-emerald-600 font-medium hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Location</th>
                    <th className="px-6 py-4 font-semibold">Customer</th>
                    <th className="px-6 py-4 font-semibold">Price</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTrips.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-slate-500">No active trips found</td>
                    </tr>
                  ) : (
                    recentTrips.map((trip, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-900">{trip.pickupLocation}</p>
                          <p className="text-xs text-slate-500">To: {trip.destination}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">{trip.guestName || 'Anonymous'}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">TSh {trip.price}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700">SEARCHING</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
             <h3 className="font-bold text-slate-900 mb-6">System Health</h3>
             <div className="space-y-6">
                <div>
                   <div className="flex justify-between text-sm mb-2">
                     <span className="text-slate-600">Server Status</span>
                     <span className="text-emerald-600 font-bold">Healthy (99.9%)</span>
                   </div>
                   <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="w-[99.9%] h-full bg-emerald-500"></div>
                   </div>
                </div>
                <div>
                   <div className="flex justify-between text-sm mb-2">
                     <span className="text-slate-600">Database Load</span>
                     <span className="text-blue-600 font-bold">12%</span>
                   </div>
                   <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="w-[12%] h-full bg-blue-500"></div>
                   </div>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100">
                   <h4 className="text-sm font-bold text-slate-900 mb-4">Quick Actions</h4>
                   <div className="grid grid-cols-2 gap-3">
                      <button className="p-3 text-xs bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-center font-medium">Broadcast Alert</button>
                      <button className="p-3 text-xs bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-center font-medium">Verify Riders</button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
