import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import { addCollaborator, removeCollaborator } from '../../services/api';

const schema = yup.object().shape({
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
});

const ProjectCollaborators = ({ projectId, isCreator, collaborators = [], onCollaboratorAdded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const updatedProject = await addCollaborator(projectId, data.email);
      toast.success('Colaborador adicionado com sucesso!');
      reset();
      if (onCollaboratorAdded) {
        onCollaboratorAdded(updatedProject);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Usuário não encontrado');
      } else if (error.response?.status === 500) {
        toast.error('Você não tem permissão para adicionar colaboradores');
      } else if (error.response?.status === 400) {
        toast.error('Dados inválidos para adicionar colaborador');
      } else if (error.response?.status === 409) {
        toast.error('Este usuário já é um colaborador do projeto');
      } else {
        toast.error('Erro ao adicionar colaborador. Tente novamente mais tarde');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCollaborator = async (userId) => {
    try {
      setIsLoading(true);
      const updatedProject = await removeCollaborator(projectId, userId);
      toast.success('Colaborador removido com sucesso!');
      if (onCollaboratorAdded) {
        onCollaboratorAdded(updatedProject);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao remover colaborador';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-700">
      <h2 className="text-2xl font-semibold mb-6 dark:text-white">Colaboradores do Projeto</h2>
      
      {isCreator && (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                label="Adicionar Colaborador"
                placeholder="Digite o email do colaborador"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" isLoading={isLoading}>
                Adicionar
              </Button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {collaborators.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Nenhum colaborador adicionado ainda.
          </p>
        ) : (
          collaborators.map((collaborator) => (
            <div
              key={collaborator._id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg dark:bg-gray-900"
            >
              <div>
                <p className="font-medium dark:text-gray-50">{collaborator.name}</p>
                <p className="text-sm dark:text-gray-400">{collaborator.email}</p>
              </div>
              {isCreator && (
                <Button
                  variant="danger"
                  onClick={() => handleRemoveCollaborator(collaborator._id)}
                  isLoading={isLoading}
                >
                  Remover
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectCollaborators; 