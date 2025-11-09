import React from 'react';
import { ListIcon } from './icons/ListIcon';
import { ClockIcon } from './icons/ClockIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';

type View = 'orders' | 'dashboard' | 'history' | 'operators';

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const NavButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
      isActive
        ? 'bg-cyan-500/20 text-cyan-400'
        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
    }`}
  >
    {children}
  </button>
);


export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  return (
    <header className="bg-gray-800/80 backdrop-blur-sm shadow-lg sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-baseline space-x-2">
            <h1 className="text-xl font-bold text-cyan-400 tracking-wider">
              Control de Pedidos
            </h1>
            <span className="text-xs text-gray-500 font-mono">v1.1</span>
          </div>
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <NavButton
              onClick={() => onViewChange('orders')}
              isActive={currentView === 'orders'}
            >
              <ClockIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Pedidos</span>
            </NavButton>
            <NavButton
              onClick={() => onViewChange('dashboard')}
              isActive={currentView === 'dashboard'}
            >
              <ChartBarIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Dashboard</span>
            </NavButton>
            <NavButton
              onClick={() => onViewChange('history')}
              isActive={currentView === 'history'}
            >
              <ListIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Historial</span>
            </NavButton>
             <NavButton
              onClick={() => onViewChange('operators')}
              isActive={currentView === 'operators'}
            >
              <UserGroupIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Preparadores</span>
            </NavButton>
          </nav>
        </div>
      </div>
    </header>
  );
};