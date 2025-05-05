import React from 'react';

interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  readOnly?: boolean; // Optional prop to control if input is read-only
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // Optional onChange handler
  maxQuantity?: number; // Optional maximum quantity
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  readOnly = false, // Default to not read-only since most instances need to be interactive
  onChange, // Add onChange handler
  maxQuantity = 8, // Default max quantity to 8
}) => {
  // Handler for direct input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      // Parse the input value to a number
      const newValue = parseInt(e.target.value, 10);

      // Only proceed if the value is a valid number
      if (!isNaN(newValue)) {
        // Create a modified event with validated value
        const validatedEvent = {
          ...e,
          target: {
            ...e.target,
            value: Math.min(Math.max(1, newValue), maxQuantity).toString()
          }
        };

        onChange(validatedEvent);
      } else {
        onChange(e); // Pass through the original event if not a number
      }
    }
  };

  // Handle increment with max quantity check
  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      onIncrement();
    } else {
      // Alert the user they've reached the maximum quantity
      alert(`Maximum quantity is ${maxQuantity}`);
    }
  };

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
        onChange={handleChange}
        aria-label="Current quantity"
      />
      <button
        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border-l border-gray-300 rounded-r flex-shrink-0"
        onClick={handleIncrement}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
};
