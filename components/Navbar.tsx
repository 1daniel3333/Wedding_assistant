
import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-stone-100 shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center text-white">
          <i className="fa-solid fa-heart"></i>
        </div>
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight leading-none">Ethereal</h1>
          <p className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">Weddings AI</p>
        </div>
      </div>
      
      <div className="hidden sm:flex items-center gap-6">
        <button className="text-sm font-medium text-stone-600 hover:text-rose-500">Portfolio</button>
        <button className="text-sm font-medium text-stone-600 hover:text-rose-500">Packages</button>
        <button className="px-5 py-2 bg-stone-900 text-white text-sm font-medium rounded-full hover:bg-stone-800 transition-colors">
          Book Session
        </button>
      </div>
    </nav>
  );
};
