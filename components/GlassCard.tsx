import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  action?: React.ReactNode;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', title, action }) => {
  return (
    <div className={`relative bg-white/70 backdrop-blur-2xl border border-white/60 shadow-glass rounded-3xl overflow-hidden transition-all duration-300 ${className}`}>
      {title && (
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white/40">
          <h3 className="text-lg font-bold text-gray-800 tracking-tight flex items-center gap-2">{title}</h3>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;