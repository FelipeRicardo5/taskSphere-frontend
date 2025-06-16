import React from 'react';

const FilterSelect = ({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  className = '',
  label,
  hideProjectOptions = false
}) => {
  if (hideProjectOptions && label === "Projeto") {
    return null;
  }

  return (
    <div className="flex flex-col">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input w-full"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterSelect; 