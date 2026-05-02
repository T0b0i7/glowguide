import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, BookOpen, PlusCircle, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Catalogue', path: '/', icon: BookOpen },
    { name: 'Tableau de Bord', path: '/dashboard', icon: BarChart3 },
    { name: 'Ajouter', path: '/add', icon: PlusCircle },
  ];

  return (
    <nav id="main-nav" className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-beauty-soft px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-beauty-soft rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles size={20} className="text-beauty-accent" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight text-gray-800">GlowGuide</span>
        </Link>
        
        <div className="flex items-center gap-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-beauty-accent ${isActive ? 'text-beauty-accent' : 'text-gray-500'}`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{item.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="nav-underline"
                    className="absolute bottom-[-16px] left-0 right-0 h-0.5 bg-beauty-accent rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};