'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/utils/api';

export default function RiderDashboard() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [activeRequest, setActiveRequest] = useState<any>(null);
  const [availableTrips, setAvailableTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOnline) {
      fetchTrips();
      const interval = setInterval(fetchTrips, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [isOnline]);

  const fetchTrips = async () => {
    try {
      const data = await apiFetch('/trips/available');
      setAvailableTrips(data);
      if (data.length > 0 && !activeRequest) {
        setActiveRequest(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch trips', err);
    }
  };

  const handleAcceptTrip = async (tripId: string) => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('boda_user');
      const user = userStr ? JSON.parse(userStr) : { id: 'demo-rider-id' };
      
      await apiFetch(`/trips/${tripId}/accept`, {
        method: 'PATCH',
        body: JSON.stringify({ riderId: user.id }),
      });
      alert('Trip Accepted!');
      setActiveRequest(null);
      fetchTrips();
    } catch (err: any) {
      alert('Failed to accept trip: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow bg-slate-50 min-h-screen">
      {/* Dashboard Top Bar */}
      <div className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Hello, Demo Rider</h1>
            <p className="text-slate-500 text-sm">Dodoma Central District</p>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto bg-slate-100 sm:bg-transparent p-2 sm:p-0 rounded-lg">
            <span className="text-sm font-medium text-slate-700 ml-2 sm:ml-0">Status:</span>
            <button 
              onClick={() => setIsOnline(!isOnline)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isOnline ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-bold ${isOnline ? 'text-emerald-600' : 'text-slate-500'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Active Request Alert */}
            {isOnline && activeRequest ? (
              <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 mb-2 animate-pulse">
                        New Request
                      </span>
                      <h2 className="text-xl font-bold text-slate-900">{activeRequest.pickupLocation} to {activeRequest.destination}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">TSh {activeRequest.price}</p>
                      <p className="text-sm text-slate-500">Est. 12 mins</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center mt-1">
                        <div className="w-3 h-3 rounded-full border-2 border-emerald-600 bg-white z-10"></div>
                        <div className="w-px h-10 bg-slate-200"></div>
                        <div className="w-3 h-3 rounded-sm bg-orange-500 z-10"></div>
                      </div>
                      <div className="flex-1 space-y-5">
                        <div>
                          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Pickup</p>
                          <p className="text-slate-900 font-medium">{activeRequest.pickupLocation}</p>
                          <p className="text-sm text-slate-500">1.2 km away</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Destination</p>
                          <p className="text-slate-900 font-medium">{activeRequest.destination}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mb-6">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                         {activeRequest.customer?.name?.[0] || 'A'}
                       </div>
                       <div>
                         <p className="text-sm font-bold text-slate-900">{activeRequest.customer?.name || 'Customer'}</p>
                         <p className="text-xs text-slate-500">Cash Payment</p>
                       </div>
                     </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setActiveRequest(null)}
                      className="flex-1 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleAcceptTrip(activeRequest.id)}
                      disabled={loading}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Accepting...' : 'Accept Trip'}
                    </button>
                  </div>
                </div>
              </div>
            ) : isOnline ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                  <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Searching for rides...</h3>
                <p className="text-slate-500 max-w-sm mx-auto">You are online. Stay close to high-demand areas to get trips faster.</p>
                <button onClick={() => setActiveRequest(true)} className="mt-6 text-sm text-emerald-600 hover:underline">Simulate new request</button>
              </div>
            ) : (
              <div className="bg-slate-100 rounded-2xl border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">You are offline</h3>
                <p className="text-slate-500">Go online to start receiving ride requests.</p>
              </div>
            )}

            {/* Map Placeholder Area */}
            <div className="bg-slate-200 rounded-2xl h-64 overflow-hidden relative shadow-inner border border-slate-300">
               <iframe 
                 src="https://www.openstreetmap.org/export/embed.html?bbox=35.65,-6.22,35.82,-6.12&layer=mapnik" 
                 width="100%" 
                 height="100%" 
                 style={{ border: 0 }} 
                 allowFullScreen={true} 
                 loading="lazy" 
                 className="absolute inset-0"
                 title="Dodoma Map"
               ></iframe>
            </div>

          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Today's Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Today's Summary</h3>
              
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase">Earnings</p>
                      <p className="text-lg font-bold text-slate-900">TSh 24,500</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase">Completed Trips</p>
                      <p className="text-lg font-bold text-slate-900">8 Trips</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-orange-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase">Rating</p>
                      <p className="text-lg font-bold text-slate-900">4.8 <span className="text-sm font-normal text-slate-500">/ 5.0</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors">
                View Weekly Report
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 mb-2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  <span className="text-xs font-semibold text-slate-700">Support</span>
                </button>
                <button 
                  onClick={() => router.push('/')}
                  className="flex flex-col items-center justify-center p-4 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 mb-2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  <span className="text-xs font-semibold text-red-700">Log Out</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
