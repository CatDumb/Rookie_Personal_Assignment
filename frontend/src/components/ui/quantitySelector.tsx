import React from 'react';

interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  readOnly?: boolean; // Optional prop to control if input is read-only
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  readOnly = true, // Default to read-only like the original usage
}) => {
  return (
    <div className="flex items-center border border-gray-300 rounded w-full">
      <button
        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border-r border-gray-300 rounded-l flex-shrink-0"
        onClick={onDecrement}
        aria-label="Decrease quantity"
      >
        -
      </button>
      <input
        type="text"
        className="w-full p-1 text-center outline-none border-none flex-grow"
        value={quantity}
        readOnly={readOnly}
        aria-label="Current quantity"
      />
      <button
        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border-l border-gray-300 rounded-r flex-shrink-0"
        onClick={onIncrement}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
};
