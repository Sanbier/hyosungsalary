import React, { useState, useEffect } from 'react';
import { SalaryInputs, PresetsMap } from '../types';

interface PresetManagerProps {
  currentData: SalaryInputs;
  onLoadPreset: (data: SalaryInputs, name: string) => void;
}

const PresetManager: React.FC<PresetManagerProps> = ({ currentData, onLoadPreset }) => {
  const [presets, setPresets] = useState<PresetsMap>({});
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [showSave, setShowSave] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('salaryPresets');
    if (stored) {
      setPresets(JSON.parse(stored));
    }
  }, []);

  const handleSave = () => {
    if (!newPresetName.trim()) {
      alert('Vui lòng nhập tên để lưu!');
      return;
    }
    const updatedPresets = { ...presets, [newPresetName]: currentData };
    setPresets(updatedPresets);
    localStorage.setItem('salaryPresets', JSON.stringify(updatedPresets));
    setSelectedPreset(newPresetName);
    setNewPresetName('');
    setShowSave(false);
    alert(`Đã lưu: "${newPresetName}"`);
  };

  const handleDelete = () => {
    if (!selectedPreset) return;
    if (window.confirm(`Xóa "${selectedPreset}"?`)) {
      const updated = { ...presets };
      delete updated[selectedPreset];
      setPresets(updated);
      localStorage.setItem('salaryPresets', JSON.stringify(updated));
      setSelectedPreset('');
    }
  };

  const handleLoad = () => {
    if (selectedPreset && presets[selectedPreset]) {
      onLoadPreset(presets[selectedPreset], selectedPreset);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/60 backdrop-blur-md border border-white/50 p-2 rounded-2xl shadow-sm mb-8">
      
      {/* Selector Section */}
      <div className="flex w-full sm:w-auto gap-2 items-center flex-1">
        <div className="relative flex-grow sm:max-w-xs">
          <select
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-sm bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700"
          >
            <option value="">📂 Chọn Dữ Liệu Người Dùng</option>
            {Object.keys(presets).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={handleLoad} 
          disabled={!selectedPreset}
          className="p-2 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-200 disabled:opacity-50 transition-colors"
          title="Tải"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </button>

        <button 
          onClick={handleDelete} 
          disabled={!selectedPreset}
          className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 disabled:opacity-50 transition-colors"
          title="Xóa"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      </div>

      {/* Save Trigger */}
      {showSave ? (
        <div className="flex gap-2 w-full sm:w-auto animate-fade-in">
           <input
              type="text"
              autoFocus
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="Tên..."
              className="w-28 px-3 py-2 text-sm bg-white/80 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button onClick={handleSave} className="px-3 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700">Lưu</button>
            <button onClick={() => setShowSave(false)} className="px-2 text-gray-400 hover:text-gray-600">&times;</button>
        </div>
      ) : (
        <button 
          onClick={() => setShowSave(true)}
          className="w-full sm:w-auto px-4 py-2 bg-white text-gray-600 border border-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
        >
          + Bấm Để Lưu
        </button>
      )}

    </div>
  );
};

export default PresetManager;