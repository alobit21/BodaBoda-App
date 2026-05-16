'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/utils/api';

export default function Login() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.phone || !credentials.password) {
      setError('Please enter both phone and password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      localStorage.setItem('boda_token', data.token);
      localStorage.setItem('boda_user', JSON.stringify(data.user));
      
      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else if (data.user.role === 'RIDER') {
        router.push('/dashboard');
      } else {
        router.push('/request-ride');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl mx-auto flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 mt-2 text-sm">Sign in to your BodaConnect account</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl text-slate-900 focus:ring-2 focus:outline-none transition-all"
              placeholder="07xx xxx xxx"
              value={credentials.phone}
              onChange={(e) => setCredentials({...credentials, phone: e.target.value})}
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">Password</label>
            </div>
            <input
              type="password"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl text-slate-900 focus:ring-2 focus:outline-none transition-all"
              placeholder="••••••••"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-lg shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account? <Link href="/register" className="text-emerald-600 font-bold hover:underline">Register here</Link>
        </p>

      </div>
    </div>
  );
}
