import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getProjects } from '../services/api';
import Button from '../components/atoms/Button';
import Loading from '../public/infinite-spinner.svg'

const MAX_DESCRIPTION_LENGTH = 100;

const ProjectCard = ({ project }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const shouldTruncate = project.description?.length > MAX_DESCRIPTION_LENGTH;
  const displayText = isExpanded
    ? project.description
    : project.description?.slice(0, MAX_DESCRIPTION_LENGTH) + '...';

  return (
    <div className="card h-full flex flex-col max-h-[300px] sm:max-h-[350px] lg:max-h-[400px]">
      <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white truncate">
        {project.name}
      </h3>
      <div className="mt-2 flex-grow overflow-hidden">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-words hyphens-auto line-clamp-3">
          {displayText || 'No description provided'}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-xs"
          >
            {isExpanded ? (
              <>
                Ver menos <ChevronUp className="ml-1 h-3 w-3" />
              </>
            ) : (
              <>
                Ver mais... <ChevronDown className="ml-1 h-3 w-3" />
              </>
            )}
          </button>
        )}
      </div>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
        criado por: <span className="font-medium text-gray-700 dark:text-gray-300">{project.creator_id.name}</span>
      </p>
      <div className="mt-4 flex justify-between items-center gap-2">
        <Link
          to={`/projects/${project._id}`}
          className="btn-secondary text-xs sm:text-sm flex-1 text-center"
        >
          Detalhes
        </Link>
        <Link
          to={`/projects/${project._id}/edit`}
          className="btn text-xs sm:text-sm flex-1 text-center"
        >
          Editar
        </Link>
      </div>
    </div>
  );
};

const Projects = () => {
  const { data: projectsData, isLoading } = useQuery('projects', getProjects);
  const projects = projectsData?.data || [];

  if (isLoading) {
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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Projects
        </h1>
        <Link to="/projects/new" className="btn w-full sm:w-auto">
          Create Project
        </Link>
      </div>

      <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          <div className="col-span-full text-center py-8 sm:py-12">
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2">
              Nenhum projeto encontrado
            </h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              Comece criando seu primeiro projeto!
            </p>
            <div className="mt-4">
              <Link to="/projects/new" className="btn w-full sm:w-auto">
                Criar Projeto
              </Link>
            </div>
          </div>
        ) : (
          projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))
        )}
      </div>
    </div>
  );
};

export default Projects; 