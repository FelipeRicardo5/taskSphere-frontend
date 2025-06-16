import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { getProject, createProject, updateProject } from '../services/api';
import { useAuth } from '../context/AuthContext';

import Button from '../components/atoms/Button'
import Loading from '../public/infinite-spinner.svg'

const schema = yup.object().shape({
  name: yup.string().required('Nome do project é necessário'),
  start_date: yup.date().required('Data inicial é necessário'),
  end_date: yup
    .date()
    .required('Data final é necessário!')
    .min(yup.ref('start_date'), 'A data final deve ser posterior à data inicial'),
});

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const { data: project, isLoading } = useQuery(
    ['project', id],
    () => getProject(id),
    {
      enabled: isEditing,
      onSuccess: (data) => {
        reset({
          name: data.name,
          description: data.description,
          start_date: new Date(data.start_date).toISOString().split('T')[0],
          end_date: new Date(data.end_date).toISOString().split('T')[0],
        });
      },
    }
  );

  const createMutation = useMutation(createProject, {
    onSuccess: () => {
      queryClient.invalidateQueries('projects');
      toast.success('Project criado com sucesso!');
      navigate('/projects');
    },
    onError: (error) => {
      toast.error('Falha ao criar o project!');
    },
  });

  const updateMutation = useMutation(updateProject, {
    onSuccess: () => {
      queryClient.invalidateQueries(['project', id]);
      queryClient.invalidateQueries('projects');
      toast.success('Project atualizado com sucesso!');
      navigate('/projects');
    },
    onError: (error) => {
      if (error.response?.status === 404) {
        toast.error('Projeto não encontrado');
      } else if (error.response?.status === 403) {
        toast.error('Você não tem permissão para atualizar este projeto');
      } else if (error.response?.status === 400) {
        toast.error('Dados inválidos para atualização do projeto');
      } else {
        toast.error('Erro ao atualizar o projeto');
      }
    },
  });

  const onSubmit = async (data) => {
    try {
      console.log('Form data being submitted:', data);

      if (isEditing) {
        const response = await updateMutation.mutateAsync(data);
        console.log('Update response:', response);
      } else {
        console.log('Creating new project');
        const projectData = {
          ...data,
          creator_id: user.id
        };
        console.log('Project data with creator:', projectData);
        const response = await createMutation.mutateAsync(projectData);
        console.log('Create response:', response);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
  };

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            {isEditing ? 'Editar Project' : 'Criar um novo Project'}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
          <div>
            <label htmlFor="name" className="label">
              Project Name
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="input mt-1"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              {...register('description')}
              className="input mt-1"
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="start_date" className="label">
                Start Date
              </label>
              <input
                id="start_date"
                type="date"
                {...register('start_date')}
                className="input mt-1"
                disabled={isSubmitting}
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.start_date.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="end_date" className="label">
                End Date
              </label>
              <input
                id="end_date"
                type="date"
                {...register('end_date')}
                className="input mt-1"
                disabled={isSubmitting}
              />
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.end_date.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              onClick={() => navigate('/projects')}
              variant="secondary"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isEditing
                  ? 'Salvando...'
                  : 'Criando...'
                : isEditing
                  ? 'Salvar'
                  : 'Criar Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProject; 