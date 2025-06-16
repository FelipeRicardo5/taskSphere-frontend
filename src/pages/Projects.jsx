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
    <div className="card h-full flex flex-col max-h-[300px]">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
        {project.name}
      </h3>
      <div className="mt-2 flex-grow overflow-hidden">
        <p className="text-sm text-gray-500 dark:text-gray-400 break-words hyphens-auto line-clamp-3">
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
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        criado por: <span className="font-medium text-gray-700 dark:text-gray-300">{project.creator_id.name}</span>
      </p>
      <div className="mt-4 flex justify-between items-center">
        <Link
          to={`/projects/${project._id}`}
          className="btn-secondary text-sm"
        >
          Detalhes
        </Link>
        <Link
          to={`/projects/${project._id}/edit`}
          className="btn text-sm"
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Projects
        </h1>
        <Link to="/projects/new" className="btn">
          Create Project
        </Link>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default Projects; 