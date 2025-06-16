import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

import Card from '../../components/atoms/Card';
import Button from '../../components/atoms/Button';

const ProjectCard = ({
  id,
  name,
  description,
  startDate,
  endDate,
  collaborators,
  onDelete,
  isCreator,
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col h-full">
        <div className="flex-grow">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            <Link
              to={`/projects/${id}`}
              className="hover:text-primary-600 transition-colors duration-200"
            >
              {name}
            </Link>
          </h3>
          
          <p className="text-gray-600 mb-4 line-clamp-2">
            {description}
          </p>
          
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center">
              <span className="font-medium mr-2">Start:</span>
              {format(new Date(startDate), 'MMM d, yyyy')}
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-2">End:</span>
              {format(new Date(endDate), 'MMM d, yyyy')}
            </div>
          </div>
          
          {collaborators && collaborators.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">
                {collaborators.length} collaborator{collaborators.length !== 1 ? 's' : ''}
              </p>
              <div className="flex -space-x-2">
                {collaborators.slice(0, 3).map((collaborator) => (
                  <img
                    key={collaborator.id}
                    src={collaborator.avatar}
                    alt={collaborator.name}
                    className="w-8 h-8 rounded-full border-2 border-white"
                    title={collaborator.name}
                  />
                ))}
                {collaborators.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                    +{collaborators.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {isCreator && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-2">
            <Button
              variant="secondary"
              size="sm"
              as={Link}
              to={`/projects/${id}/edit`}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(id)}
            >
              Delete
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

ProjectCard.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  collaborators: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string.isRequired,
    })
  ),
  onDelete: PropTypes.func.isRequired,
  isCreator: PropTypes.bool.isRequired,
};

export default ProjectCard; 