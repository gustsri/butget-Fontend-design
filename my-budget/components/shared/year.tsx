import React, { useState, useRef, useEffect } from 'react';

interface YearDropdownProps {
  selectedYear?: number | "ทั้งหมด";
  onYearChange?: (year: number | "ทั้งหมด") => void;
  startYear?: number;
  endYear?: number;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
}

const YearDropdown: React.FC<YearDropdownProps> = ({
  selectedYear,
  onYearChange = () => {},
  startYear = 2563,
  endYear = new Date().getFullYear() + 543 + 5,
  placeholder = "เลือกปี พ.ศ.",
  className = "",
  buttonClassName = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate array of years (Buddhist Era)
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, index) => startYear + index
  ).reverse();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (!disabled) setIsOpen(!isOpen);
  };

  const handleYearSelect = (year: number | "ทั้งหมด") => {
    onYearChange(year);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* ปุ่ม dropdown */}
      <button
        onClick={toggleDropdown}
        disabled={disabled}
        className={`
          inline-flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${buttonClassName}
        `}
        type="button"
      >
        <span>
          {selectedYear
            ? selectedYear === "ทั้งหมด"
              ? "ทั้งหมด"
              : `ปี พ.ศ. ${selectedYear}`
            : placeholder}
        </span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
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
            {/* ✅ ตัวเลือก "ทั้งหมด" */}
            <li>
              <button
                onClick={() => handleYearSelect("ทั้งหมด")}
                className={`
                  w-full text-left px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-700
                  ${selectedYear === "ทั้งหมด" ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-700"}
                `}
              >
                ทั้งหมด
              </button>
            </li>
            {/* ตัวเลือกปี */}
            {years.map((year) => (
              <li key={year}>
                <button
                  onClick={() => handleYearSelect(year)}
                  className={`
                    w-full text-left px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-700
                    ${selectedYear === year ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-700"}
                  `}
                >
                  ปี พ.ศ. {year}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default YearDropdown;
