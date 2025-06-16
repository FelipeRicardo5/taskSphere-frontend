import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { getTask, createTask, updateTask, uploadTaskImage } from '../services/api';
import { useAuth } from '../context/AuthContext';

const schema = yup.object().shape({
  title: yup
    .string()
    .required('Título da tarefa é obrigatório')
    .min(3, 'O título deve ter no mínimo 3 caracteres'),
  status: yup
    .string()
    .required('Status da tarefa é obrigatório')
    .oneOf(['todo', 'in_progress', 'done'], 'Status inválido'),
  due_date: yup
    .date()
    .required('Data de entrega é obrigatória')
    .min(new Date(), 'A data de entrega deve ser futura'),
  project_id: yup
    .string()
    .required('Projeto é obrigatório'),
  image_url: yup
    .string()
    .required('Imagem da tarefa é obrigatória')
    .url('URL da imagem inválida')
    .matches(
      /\.(jpg|jpeg|png|gif|webp)$/i,
      'A URL deve ser de uma imagem válida (jpg, jpeg, png, gif, webp)'
    ),
  creator_id: yup
    .string()
    .required('ID do criador é obrigatório')
});

const EditTask = () => {
  const { id, projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isEditing = Boolean(id);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    getValues,
    trigger,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      project_id: projectId,
      status: 'todo',
      creator_id: user?.id
    }
  });

  useEffect(() => {
    if (projectId) {
      console.log('Setting project_id:', projectId);
      setValue('project_id', typeof projectId === 'object' ? projectId._id : projectId);
    }
    if (user?.id) {
      console.log('Setting creator_id:', user.id);
      setValue('creator_id', typeof user.id === 'object' ? user.id._id : user.id);
    }
  }, [projectId, user?.id, setValue]);

  const { data: task, isLoading } = useQuery(
    ['task', id],
    () => getTask(id),
    {
      enabled: isEditing,
      onSuccess: (data) => {
        const dueDate = data.due_date ? new Date(data.due_date) : new Date();
        const formattedDate = dueDate instanceof Date && !isNaN(dueDate) 
          ? dueDate.toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        reset({
          title: data.title,
          status: data.status,
          due_date: formattedDate,
          project_id: typeof data.project_id === 'object' ? data.project_id._id : data.project_id,
          image_url: data.image_url,
          creator_id: typeof data.creator_id === 'object' ? data.creator_id._id : data.creator_id
        });
        if (data.image_url) {
          setImagePreview(data.image_url);
        }
      },
    }
  );

  const handleImageChange = async (event) => {
    console.log('Image change event triggered');
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file.name);
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('Image preview generated');
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      try {
        console.log('Starting image upload...');
        setIsUploading(true);
        const response = await uploadTaskImage(file);
        console.log('Image upload response:', response);
        
        setValue('image_url', response.image_url, { 
          shouldValidate: true,
          shouldDirty: true 
        });
        
        toast.success('Imagem enviada com sucesso');
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error(error.message || 'Falha ao enviar imagem');
        setImagePreview(null);
        setSelectedImage(null);
        setValue('image_url', '', { 
          shouldValidate: true,
          shouldDirty: true 
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const createMutation = useMutation(createTask, {
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', projectId]);
      toast.success('Task created successfully');
      navigate(`/projects/${projectId}`);
    },
    onError: (error) => {
      console.error('Create task error:', error);
      if (error.response?.status === 404) {
        toast.error('Task não encontrada');
      } else if (error.response?.status === 500) {
        toast.error('Você não tem permissão para criar esta Task');
      } else if (error.response?.status === 400) {
        toast.error('Dados inválidos para criação da Task');
      } else {
        toast.error('Erro ao criar Task');
      }
    },
  });

  const updateMutation = useMutation(updateTask, {
    onSuccess: () => {
      queryClient.invalidateQueries(['task', id]);
      queryClient.invalidateQueries(['tasks', projectId]);
      toast.success('Task updated successfully');
      navigate(-1);
    },
    onError: (error) => {
      console.error('Update task error:', error);
      if (error.response?.status === 404) {
        toast.error('Task não encontrada');
      } else if (error.response?.status === 500) {
        toast.error('Você não tem permissão para atualizar esta Task');
      } else if (error.response?.status === 400) {
        toast.error('Dados inválidos para atualização da Task');
      } else {
        toast.error('Erro ao atualizar Task');
      }
    },
  });

  const onSubmit = async (data) => {
    try {
      const formData = {
        ...data,
        project_id: typeof data.project_id === 'object' ? data.project_id._id : data.project_id,
        creator_id: typeof data.creator_id === 'object' ? data.creator_id._id : data.creator_id
      };

      if (!formData.image_url) {
        toast.error('Por favor, faça upload de uma imagem primeiro');
        return;
      }

      if (!formData.project_id || !formData.creator_id) {
        toast.error('Dados do projeto ou criador estão faltando');
        return;
      }

      if (isEditing) {
        await updateMutation.mutateAsync({ id, ...formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error('=== FORM SUBMISSION ERROR ===');
      console.error('Error object:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error('Erro ao salvar task. Por favor, tente novamente.');
    }
  };

  const onError = (errors) => {
    console.log('=== FORM VALIDATION ERRORS ===');
    console.log('Validation errors:', errors);
    Object.keys(errors).forEach((key) => {
      toast.error(errors[key].message);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            {isEditing ? 'Editar Task' : 'Criar nova Task'}
          </h2>
          <p className='dark:text-white' >
            insira primeiro a imagem
          </p>
        </div>

        <form 
          onSubmit={(e) => {
            console.log('=== FORM SUBMIT EVENT TRIGGERED ===');
            console.log('Current form state:', {
              values: getValues(),
              errors: errors,
              isSubmitting: isSubmitting
            });
            handleSubmit(onSubmit, onError)(e);
          }} 
          className="card space-y-6"
        >
          <div>
            <label htmlFor="title" className="label">
              Task Title
            </label>
            <input
              id="title"
              type="text"
              {...register('title')}
              className="input mt-1"
              disabled={isSubmitting || isUploading}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="status" className="label">
              Status
            </label>
            <select
              id="status"
              {...register('status')}
              className="input mt-1"
              disabled={isSubmitting || isUploading}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.status.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="due_date" className="label">
              Due Date
            </label>
            <input
              id="due_date"
              type="date"
              {...register('due_date')}
              className="input mt-1"
              disabled={isSubmitting || isUploading}
            />
            {errors.due_date && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.due_date.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="image" className="label">
              Task Image
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="input mt-1"
              disabled={isSubmitting || isUploading}
            />
            {errors.image_url && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.image_url.message}
              </p>
            )}
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Task preview"
                  className="max-w-xs rounded-lg shadow-md"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
              disabled={isSubmitting || isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting || isUploading
                ? isEditing
                  ? 'Salvando...'
                  : 'Criando...'
                : isEditing
                ? 'Salvar'
                : 'Criar Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTask; 