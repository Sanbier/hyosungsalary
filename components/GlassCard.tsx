import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  action?: React.ReactNode;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', title, action }) => {
  return (
    <div className={`relative bg-white/70 backdrop-blur-2xl border border-white/60 shadow-glass rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-300 ${className}`}>
      {title && (
        <div className="px-4 py-2.5 md:px-6 md:py-4 border-b border-gray-100 flex justify-between items-center bg-white/40">
          <h3 className="text-base md:text-lg font-bold text-gray-800 tracking-tight flex items-center gap-2">{title}</h3>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-3 md:p-6">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;