'use client';

import { useState } from 'react';
import { apiFetch } from '@/utils/api';

export default function RequestRide() {
  const [formData, setFormData] = useState({
    pickup: '',
    destination: '',
    phone: '',
    name: ''
  });
  const [status, setStatus] = useState('idle'); // idle, searching, found
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [tripId, setTripId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.pickup.trim()) newErrors.pickup = 'Pickup location is required';
    if (!formData.destination.trim()) newErrors.destination = 'Destination is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStatus('searching');
    
    try {
      // For demo, we send the name and phone as guest details
      const data = await apiFetch('/trips/request', {
        method: 'POST',
        body: JSON.stringify({
          guestName: formData.name,
          guestPhone: formData.phone,
          pickupLocation: formData.pickup,
          destination: formData.destination,
          price: 3500, // Hardcoded for demo
        }),
      });
      
      setTripId(data.id);
      
      // Polling for status or just simulating "found" for now since we don't have socket.io
      setTimeout(async () => {
        setStatus('found');
      }, 5000);
      
    } catch (err: any) {
      alert('Failed to request ride: ' + err.message);
      setStatus('idle');
    }
  };

  return (
    <div className="flex-grow bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Left Side: Form */}
        <div className="w-full md:w-1/2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Request a Ride</h1>
              <p className="text-slate-500 text-sm">Enter your details and we'll find a boda nearby.</p>
            </div>

            {status === 'idle' && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="pickup" className="block text-sm font-medium text-slate-700 mb-1">Pickup Location <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 w-3 h-3 rounded-full border-2 border-emerald-600 bg-white"></div>
                    <input
                      type="text"
                      id="pickup"
                      name="pickup"
                      value={formData.pickup}
                      onChange={handleChange}
                      placeholder="e.g. Dodoma Central Market"
                      autoFocus
                      className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${errors.pickup ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500'} rounded-xl text-slate-900 focus:ring-2 focus:outline-none transition-all`}
                    />
                  </div>
                  {errors.pickup && <p className="mt-1 text-sm text-red-500">{errors.pickup}</p>}
                </div>

                <div>
                  <label htmlFor="destination" className="block text-sm font-medium text-slate-700 mb-1">Destination <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 w-3 h-3 rounded-sm bg-orange-500"></div>
                    <div className="absolute top-[-24px] left-[17px] w-px h-6 bg-slate-300"></div>
                    <input
                      type="text"
                      id="destination"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      placeholder="e.g. University of Dodoma"
                      className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${errors.destination ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500'} rounded-xl text-slate-900 focus:ring-2 focus:outline-none transition-all`}
                    />
                  </div>
                  {errors.destination && <p className="mt-1 text-sm text-red-500">{errors.destination}</p>}
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="07xx xxx xxx"
                    className={`w-full px-4 py-3 bg-slate-50 border ${errors.phone ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500'} rounded-xl text-slate-900 focus:ring-2 focus:outline-none transition-all`}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Name <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="What should the rider call you?"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl text-slate-900 focus:ring-2 focus:outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-lg shadow-sm shadow-emerald-600/20 transition-all active:scale-[0.98]"
                >
                  Request Ride
                </button>
              </form>
            )}

            {status === 'searching' && (
              <div className="py-12 flex flex-col items-center justify-center text-center animate-pulse">
                <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Looking for a rider...</h3>
                <p className="text-slate-500">Contacting nearby boda bodas</p>
              </div>
            )}

            {status === 'found' && (
              <div className="py-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Rider on the way!</h3>
                <p className="text-slate-500 mb-6">Juma is arriving in 4 minutes</p>
                
                <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-200 rounded-full overflow-hidden">
                      <img src="https://i.pravatar.cc/150?img=11" alt="Rider" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900">Juma Makoye</p>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        4.9 (120 trips)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Plate</p>
                    <p className="font-bold text-slate-900">MC 123 BDF</p>
                  </div>
                </div>

                <button
                  onClick={() => setStatus('idle')}
                  className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel Ride
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Map Embedded */}
        <div className="w-full md:w-1/2 h-64 md:h-auto min-h-[400px] bg-slate-200 rounded-2xl overflow-hidden relative border border-slate-300 shadow-inner">
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
          
          {/* Overlay elements for realism */}
          <div className="absolute inset-0 pointer-events-none">
            {formData.pickup && (
              <div className="absolute top-[20%] left-[30%] flex flex-col items-center">
                <div className="bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-lg mb-1 whitespace-nowrap">{formData.pickup}</div>
                <div className="w-4 h-4 bg-white rounded-full border-4 border-emerald-600 shadow-md"></div>
              </div>
            )}
            
            {formData.destination && (
               <div className="absolute bottom-[30%] right-[30%] flex flex-col items-center">
                 <div className="bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-lg mb-1 whitespace-nowrap">{formData.destination}</div>
                 <div className="w-4 h-4 bg-orange-500 rounded-sm shadow-md"></div>
               </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
