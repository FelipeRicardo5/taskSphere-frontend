import React from 'react';
import SearchInput from '../atoms/SearchInput';
import FilterSelect from '../molecules/FilterSelect';

const TaskFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  projectFilter,
  onProjectChange,
  projects,
  className = '',
  hideProjectOptions = false
}) => {
  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' }
  ];

  const projectOptions = projects.map(project => ({
    value: project._id,
    label: project.name
  }));

  return (
    <div className={`grid grid-cols-1 md:grid-cols-${hideProjectOptions ? '2' : '3'} gap-4 ${className}`}>
      <SearchInput
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Buscar Tasks..."
        label="Task"
      />
      
      <FilterSelect
        value={statusFilter}
        onChange={onStatusChange}
        options={statusOptions}
        placeholder="Filtrar por status"
        label="Status"
      />
      
      {!hideProjectOptions && (
        <FilterSelect
          value={projectFilter}
          onChange={onProjectChange}
          options={projectOptions}
          placeholder="Filtrar por Project"
          label="Project"
        />
      )}
    </div>
  );
};

export default TaskFilters; 