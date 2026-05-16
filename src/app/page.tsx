import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 relative overflow-hidden">
        {/* Subtle background pattern/gradient */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-50/50 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-blue-50/50 blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
                Fast, Reliable Boda Rides in <span className="text-emerald-600">Dodoma</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl leading-relaxed">
                Connect with verified riders instantly. Whether you're commuting to work, heading to the market, or sending a package, BodaConnect gets you there safely.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/request-ride"
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-lg shadow-sm shadow-emerald-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                  Request a Ride
                </Link>
                <Link 
                  href="/login"
                  className="px-8 py-4 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-semibold text-lg shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  Login
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-12 flex flex-wrap items-center gap-6 text-sm font-medium text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  Verified Riders
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  Affordable Pricing
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  Quick Response
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="mt-12 md:mt-0 relative w-full max-w-sm mx-auto md:max-w-none">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-blue-50 rounded-3xl transform rotate-3 scale-105 -z-10"></div>
              <Image src="/boda1.jpeg" alt="Boda Boda Rider" width={400} height={300} className="w-full h-auto object-cover rounded-3xl shadow-xl border border-white/50" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Getting a ride has never been easier. Just follow these three simple steps.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Curved Dotted Arrow 1 */}
            <div className="hidden md:block absolute top-14 left-1/3 -translate-x-1/2 w-16 text-emerald-400 z-10 pointer-events-none drop-shadow-sm">
              <svg viewBox="0 0 64 24" fill="none" className="transform -translate-y-1/2">
                <path d="M0,16 Q32,-4 60,16" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 4" strokeLinecap="round"/>
                <path d="M52,8 L62,17 L50,22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            {/* Curved Dotted Arrow 2 */}
            <div className="hidden md:block absolute bottom-20 left-2/3 -translate-x-1/2 w-16 text-orange-400 z-10 pointer-events-none drop-shadow-sm">
              <svg viewBox="0 0 64 24" fill="none" className="transform translate-y-1/2">
                <path d="M0,8 Q32,28 60,8" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 4" strokeLinecap="round"/>
                <path d="M50,2 L62,7 L52,16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Step 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative group hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 font-bold text-xl relative z-20">1</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Enter Location</h3>
              <p className="text-slate-600 leading-relaxed">
                Tell us where you are and where you want to go. We'll show you an upfront estimate.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative group hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6 font-bold text-xl relative z-20">2</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Get Matched</h3>
              <p className="text-slate-600 leading-relaxed">
                We'll instantly connect you with the nearest verified rider to minimize wait time.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative group hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-6 font-bold text-xl relative z-20">3</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Enjoy Your Ride</h3>
              <p className="text-slate-600 leading-relaxed">
                Hop on and travel safely. Pay seamlessly with cash or mobile money upon arrival.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
