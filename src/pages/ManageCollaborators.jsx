import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { getProject } from '../services/api';
import Button from '../components/atoms/Button';
import ProjectCollaborators from '../components/organisms/ProjectCollaborators';
import ErrorScreen from '../components/molecules/ErrorScreen';
import { Lock } from 'lucide-react';

import Loading from '../public/infinite-spinner.svg'

const ManageCollaborators = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: project, isLoading } = useQuery(
    ['project', projectId],
    () => getProject(projectId),
    {
      enabled: !!projectId,
    }
  );

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

  if (!project) {
    return (
      <ErrorScreen
        variant="error"
        title="Projeto não encontrado"
        message="O projeto que você está procurando não existe ou você não tem acesso a ele."
        buttonText="Voltar para Projects"
        buttonLink="/projects"
      />
    );
  }

  const isCreator = project.creator_id._id === user.id;
  if (!isCreator) {
    return (
      <ErrorScreen
        variant="access-denied"
        title="Acesso Negado"
        message="Somente o criador do projeto pode gerenciar colaboradores."
        buttonText="Voltar para o Projeto"
        buttonLink={`/projects/${projectId}`}
        icon={Lock}
      />
    );
  }

  const handleCollaboratorAdded = () => {
    // Invalida a query do projeto para forçar uma nova busca
    queryClient.invalidateQueries(['project', projectId]);
  };

  return (
    <div className="container mx-auto px-4 py-8 ">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 ">
          <h1 className="text-3xl font-bold dark:text-gray-50 text-gray-900">
            Gerenciar Colaboradores
          </h1>
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            Voltar ao Project
          </Button>
        </div>

        <ProjectCollaborators
          projectId={projectId}
          isCreator={isCreator}
          collaborators={project.collaborators}
          onCollaboratorAdded={handleCollaboratorAdded}
        />
      </div>
    </div>
  );
};

export default ManageCollaborators; 