// Dropdown.tsx - reusable generic dropdown component for selecting from a list of options
import { useEffect, useRef, useState } from "react";

// Represents a single option in the dropdown
export interface DropdownOption<T> {
  value: T;
  label: string;
}

// Props for the Dropdown component
interface DropdownProps<T> {
  value: T; // Currently selected value
  options: DropdownOption<T>[]; // List of available options
  onChange: (value: T) => void; // Callback when selection changes
  buttonLabel?: string | ((value: T) => string); // Custom label for the toggle button
  className?: string; // Additional CSS classes for the wrapper
  dropdownWidth?: string; // CSS width class for the dropdown menu
}

export function Dropdown<T>({
  value,
  options,
  onChange,
  buttonLabel,
  className = "",
  dropdownWidth = "w-full",
}: DropdownProps<T>) {
  // Local state to track whether the dropdown is open
  const [isOpen, setIsOpen] = useState(false);
  // Ref to detect clicks outside of the dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close the dropdown menu when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Determine the label to display on the toggle button
  const getCurrentLabel = (): string => {
    if (buttonLabel) {
      // If a custom buttonLabel is provided, use it
      return typeof buttonLabel === "function" ? buttonLabel(value) : buttonLabel;
    }
    // Otherwise, find the matching option label
    const option = options.find(opt => opt.value === value);
    return option ? option.label : "";
  };

  // Handle selection of an option from the menu
  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    // Wrapper div holds both the toggle button and options menu
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Toggle button: displays current label and chevron icon */}
      <button
        className="flex items-center justify-between w-full sm:w-auto px-3 py-2 border border-gray-300 rounded hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="mr-1">{getCurrentLabel()}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {/* Options menu: rendered only when isOpen is true */}
      {isOpen && (
        <div className={`absolute right-0 mt-2 ${dropdownWidth} bg-white rounded-md shadow-lg py-1 z-20`}>
          {options.map((option) => (
            <button
              key={String(option.value)}
              onClick={() => handleSelect(option.value)}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
