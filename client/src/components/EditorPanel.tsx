
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { SelectedElement } from '../types';

interface EditorPanelProps {
  selectedElement: SelectedElement;
  onUpdate: (updates: any) => void;
  onClose: () => void;
}

const EditorPanel = ({ selectedElement, onUpdate, onClose }: EditorPanelProps) => {
  const [values, setValues] = useState(selectedElement);

  useEffect(() => {
    setValues(selectedElement);
  }, [selectedElement]);

  const handleChange = (field: string, value: string) => {
    const newValues: any = { ...values, [field]: value }; // eslint-disable-line @typescript-eslint/no-explicit-any
    
    // Check if the field belongs to styles or top-level properties
    if (field in values.style) {
      newValues.style = { ...values.style, [field]: value };
    }

    setValues(newValues);
    onUpdate({ [field]: value });
  };

  const handleStyleChange = (styleName: string, value: string) => {
    const newStyles = { ...values.style, [styleName]: value };
    setValues({ ...values, style: newStyles });
    onUpdate({ style: { [styleName]: value } });
  };

  if (!selectedElement || !values) return null;

  return (
    <div className="fixed right-0 top-16 bottom-0 w-80 bg-white shadow-xl border-l border-gray-200 p-4 overflow-y-auto z-50 animate-fade-in transition-all">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Edit Element</h3>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="size-5 text-gray-500" />
        </button>
      </div>

      <div className="space-y-4 text-black">
        
        {/* Text Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Text Content
          </label>
          <textarea
            value={values.text}
            onChange={(e) => handleChange('text', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Class Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class Name
          </label>
          <input
            type="text"
            value={values.className || ''}
            onChange={(e) => handleChange('className', e.target.value)}
            className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Grid for Padding and Margin */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Padding
            </label>
            <input
              type="text"
              value={values.style.padding}
              onChange={(e) => handleStyleChange('padding', e.target.value)}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Margin
            </label>
            <input
              type="text"
              value={values.style.margin}
              onChange={(e) => handleStyleChange('margin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Font Size
          </label>
          <input
            type="text"
            value={values.style.fontSize}
            onChange={(e) => handleStyleChange('fontSize', e.target.value)}
            className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Background Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Background
          </label>
          <div className="flex items-center gap-2 border border-gray-300 rounded-md p-1">
            <input
              type="color"
              value={values.style.backgroundColor === 'rgba(0, 0, 0, 0)' ? '#ffffff' : values.style.backgroundColor}
              onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-none p-0"
            />
            <input 
               type="text"
               value={values.style.backgroundColor}
               onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
               className="flex-1 px-2 py-1 text-sm border-none focus:outline-none"
            />
          </div>
        </div>

        {/* Text Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Text Color
          </label>
          <div className="flex items-center gap-2 border border-gray-300 rounded-md p-1">
            <input
              type="color"
              value={values.style.color}
              onChange={(e) => handleStyleChange('color', e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-none p-0"
            />
            <input 
               type="text"
               value={values.style.color}
               onChange={(e) => handleStyleChange('color', e.target.value)}
               className="flex-1 px-2 py-1 text-sm border-none focus:outline-none"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default EditorPanel;