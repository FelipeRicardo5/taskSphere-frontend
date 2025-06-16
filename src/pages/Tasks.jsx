import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { getProjects, getTasks } from '../services/api';
import TaskFilters from '../components/organisms/TaskFilters';
import TaskList from '../components/organisms/TaskList';
import Loading from '../public/infinite-spinner.svg'

const Tasks = () => {
  const navigate = useNavigate();
  const [allTasks, setAllTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    project: '',
    page: 1,
    limit: 10
  });
  const [isLoading, setIsLoading] = useState(true);

  const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    onSuccess: (data) => {
      if (data?.data?.length > 0 && !filters.project) {
        setFilters(prev => ({ ...prev, project: data.data[0]._id }));
      }
    }
  });

  const fetchTasks = useCallback(async () => {
    if (!filters.project) return;

    try {
      setIsLoading(true);
      const response = await getTasks(filters.project, { limit: 1000 });

      if (response.success) {
        // Transformar os dados para um formato mais fácil de usar
        const transformedTasks = response.data.tasks.map(task => ({
          ...task,
          project: task.project_id,
          creator: task.creator_id,
          project_id: task.project_id._id,
          creator_id: task.creator_id._id
        }));

        setAllTasks(transformedTasks);
        setFilteredTasks(transformedTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters.project]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasksMemo = useMemo(() => {
    let filtered = [...allTasks];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.project.name.toLowerCase().includes(searchLower) ||
        task.creator.name.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    const startIndex = (filters.page - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    return filtered.slice(startIndex, endIndex);
  }, [filters, allTasks]);

  useEffect(() => {
    setFilteredTasks(filteredTasksMemo);
  }, [filteredTasksMemo]);

  const handleSearch = useCallback((search) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  }, []);

  const handleStatusChange = useCallback((status) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  }, []);

  const handleProjectChange = useCallback((project) => {
    setFilters(prev => ({ ...prev, project, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const totalPages = useMemo(() =>
    Math.ceil(allTasks.length / filters.limit),
    [allTasks.length, filters.limit]
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Tasks</h1>
      </div>
      
      <TaskFilters
        projects={projectsData?.data || []}
        searchQuery={filters.search}
        onSearchChange={handleSearch}
        statusFilter={filters.status}
        onStatusChange={handleStatusChange}
        projectFilter={filters.project}
        onProjectChange={handleProjectChange}
      />

      <div className="mt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <img
              src={Loading}
              width={80}
              alt="Loading..."
              className="animate-pulse"
            />
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Carregando tasks...
            </p>
          </div>
        ) : (
          <TaskList
            tasks={filteredTasks}
            totalPages={totalPages}
            currentPage={filters.page}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default Tasks; 