import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Settings, ChevronRight } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { getProject, deleteProject, getTasks } from '../services/api';
import Button from '../components/atoms/Button';
import Card from '../components/atoms/Card';
import TaskList from '../components/organisms/TaskList';
import TaskFilters from '../components/organisms/TaskFilters';
import DeleteConfirmationModal from '../components/molecules/DeleteConfirmationModal';
import Pagination from '../components/molecules/Pagination';

import Loading from '../public/infinite-spinner.svg'

const MAX_DESCRIPTION_LENGTH = 50;

const ProjectDetails = () => {
  const { id: rawId } = useParams();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allTasks, setAllTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    limit: 10
  });
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  const id = typeof rawId === 'string' ? rawId : '';

  const { data: project, isLoading: isLoadingProject } = useQuery(
    ['project', id],
    () => getProject(id),
    {
      enabled: !!id && typeof id === 'string',
    }
  );

  useEffect(() => {
    const fetchTasks = async () => {
      if (!id) return;
      
      setIsLoadingTasks(true);
      try {
        const response = await getTasks(id, { limit: 1000 });
        if (response.success) {
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
        toast.error('Error fetching tasks');
      } finally {
        setIsLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [id]);

  const filteredTasksMemo = useMemo(() => {
    let filtered = [...allTasks];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.project?.name?.toLowerCase().includes(searchLower) ||
        task.creator?.name?.toLowerCase().includes(searchLower)
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

  const handlePageChange = useCallback((page) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const totalPages = useMemo(() =>
    Math.ceil(allTasks.length / filters.limit),
    [allTasks.length, filters.limit]
  );

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProject(id);
      toast.success('Project deletado com sucesso!');
      navigate('/projects');
    } catch (error) {
      console.error('Erro ao deletar o project:', error);
      if (error.response?.status === 404) {
        toast.error('Project não encontrado');
      } else if (error.response?.status === 403) {
        toast.error('Você não tem permissão para deletar este project');
      } else if (error.response?.status === 401) {
        toast.error('Sessão expirada. Por favor, faça login novamente');
      } else {
        toast.error('Erro ao deletar o project. Tente novamente mais tarde');
      }
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const renderDescription = () => {
    if (!project.description) {
      return (
        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 italic">
          Nenhuma descrição fornecida
        </p>
      );
    }

    const shouldTruncate = project.description.length > MAX_DESCRIPTION_LENGTH;
    const displayText = isDescriptionExpanded
      ? project.description
      : project.description.slice(0, MAX_DESCRIPTION_LENGTH) + '...';

    return (
      <div className="space-y-2 max-w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 break-words hyphens-auto">
            {displayText}
          </p>
        </div>
        {shouldTruncate && (
          <button
            onClick={toggleDescription}
            className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm sm:text-base"
          >
            {isDescriptionExpanded ? (
              <>
                Ver menos <ChevronUp className="ml-1 h-4 w-4 sm:h-5 sm:w-5" />
              </>
            ) : (
              <>
                Ver mais... <ChevronDown className="ml-1 h-4 w-4 sm:h-5 sm:w-5" />
              </>
            )}
          </button>
        )}
      </div>
    );
  };

  if (isLoadingProject) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <img
            src={Loading}
            width={100}
            alt="Loading..."
            className="animate-pulse"
          />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Project não encontrado!
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              O projeto que você está procurando não existe ou você não tem acesso a ele.
            </p>
            <div className="mt-6">
              <Link to="/projects" className="btn">
                Voltar para Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-8">
          <div className="w-full sm:flex-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              {project.name}
            </h2>
            <div className="mt-2">
              {renderDescription()}
            </div>
            <p className="mt-2 text-base sm:text-lg font-semibold text-gray-500 mr-1 dark:text-gray-200">
              Creator:
              <span className="mt-2 text-base sm:text-lg ml-1 font-normal text-gray-500 dark:text-gray-400">
                {project.creator_id.name}
              </span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
            <Button
              onClick={() => setIsDeleteModalOpen(true)}
              variant="danger"
              className="w-full sm:w-auto"
            >
              Deletar
            </Button>
            <Link to={`/projects/${id}/edit`} className="btn w-full sm:w-auto">
              Editar Project
            </Link>
            <Link to={`/projects/${id}/collaborators`} className="btn-secondary w-full gap-1 sm:w-auto">
              Gerenciar <Settings className='' strokeWidth={1.5} />
            </Link>
            <Link to="/projects" className="btn-secondary w-full sm:w-auto">
              Voltar <ChevronRight strokeWidth={1.5}  />
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tasks
            </h3>
            <Link to={`/projects/${id}/tasks/new`} className="btn">
              Criar nova Task
            </Link>
          </div>

          <TaskFilters
            searchQuery={filters.search}
            onSearchChange={handleSearch}
            statusFilter={filters.status}
            onStatusChange={handleStatusChange}
            projects={[project]}
            projectFilter={project._id}
            onProjectChange={() => {}}
            className="mb-6"
            hideProjectOptions={true}
          />

          {isLoadingTasks ? (
            <div className="flex justify-center items-center py-8">
              <img
                src={Loading}
                width={50}
                alt="Loading..."
                className="animate-pulse"
              />
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

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Deletar Project"
        message="Tem certeza de que deseja excluir este project? Esta ação não pode ser desfeita."
        confirmText="Deletar Project"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ProjectDetails; 