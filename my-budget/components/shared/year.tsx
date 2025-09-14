import React, { useState, useRef, useEffect } from 'react';

interface YearDropdownProps {
  selectedYear?: number;
  onYearChange: (year: number) => void;
  startYear?: number;
  endYear?: number;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
}

const YearDropdown: React.FC<YearDropdownProps> = ({
  selectedYear,
  onYearChange,
  startYear = 2020,
  endYear = new Date().getFullYear() + 5,
  placeholder = "เลือกปี",
  className = "",
  buttonClassName = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate array of years
  const years = Array.from(
    { length: endYear - startYear + 1 }, 
    (_, index) => startYear + index
  ).reverse(); // เรียงจากปีล่าสุดไปเก่าสุด

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleYearSelect = (year: number) => {
    onYearChange(year);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Year Dropdown Button */}
      <button
        onClick={toggleDropdown}
        disabled={disabled}
        className={`
          inline-flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${buttonClassName}
        `}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {selectedYear ? `ปี ${selectedYear}` : placeholder}
        </span>
        <svg 
          className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <ul className="py-1">
            {years.map((year) => (
              <li key={year}>
                <button
                  onClick={() => handleYearSelect(year)}
                  className={`
                    w-full text-left px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150
                    ${selectedYear === year ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'}
                  `}
                >
                  <span className="flex items-center">
                    {selectedYear === year && (
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    ปี {year}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Usage Example Component
const YearDropdownExample: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [budgetYear, setBudgetYear] = useState<number | undefined>();

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Year Dropdown Examples</h2>
        
        <div className="space-y-4">
          {/* Default Year Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เลือกปีปัจจุบัน
            </label>
            <YearDropdown
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              startYear={2020}
              endYear={2030}
              className="w-full"
            />
            {selectedYear && (
              <p className="mt-2 text-sm text-gray-600">
                ปีที่เลือก: <span className="font-semibold">{selectedYear}</span>
              </p>
            )}
          </div>

          {/* Budget Year Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เลือกปีงบประมาณ
            </label>
            <YearDropdown
              selectedYear={budgetYear}
              onYearChange={setBudgetYear}
              startYear={2564}
              endYear={2570}
              placeholder="เลือกปีงบประมาณ"
              className="w-full"
              buttonClassName="border-green-300 focus:ring-green-500 focus:border-green-500"
            />
            {budgetYear && (
              <p className="mt-2 text-sm text-green-600">
                ปีงบประมาณที่เลือก: <span className="font-semibold">{budgetYear}</span>
              </p>
            )}
          </div>

          {/* Disabled Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dropdown ที่ปิดการใช้งาน
            </label>
            <YearDropdown
              selectedYear={2023}
              onYearChange={() => {}}
              disabled={true}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearDropdown;
export { YearDropdownExample };