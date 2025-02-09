import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { FONTS } from '../constants';

interface Props {
  id: string;
  value: string;
  onChange: (font: string) => void;
}

export const FontSelect: React.FC<Props> = ({ id, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedFont = FONTS.find(font => font.family === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 border rounded-md text-base sm:text-lg bg-white"
      >
        <span style={{ fontFamily: value }}>{selectedFont?.name}</span>
        <ChevronDown
          size={20}
          className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {FONTS.map((font) => (
            <button
              key={font.value}
              type="button"
              onClick={() => {
                onChange(font.family);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                value === font.family ? 'bg-gray-50' : ''
              }`}
              style={{ fontFamily: font.family }}
            >
              {font.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}; 