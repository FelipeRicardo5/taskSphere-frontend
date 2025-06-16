import React from 'react';

const SearchInput = ({ value, onChange, placeholder = 'Search...', label = '' }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input w-full"
      />
    </div>
  );
};

export default SearchInput;