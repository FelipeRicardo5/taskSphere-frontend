import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

import Card from '../../components/atoms/Card';
import Button from '../../components/atoms/Button';
import DeleteConfirmationModal from '../../components/molecules/DeleteConfirmationModal';
import { deleteTask } from '../../services/api';
import Loading from '../../public/infinite-spinner.svg'

const TaskList = ({ tasks, totalPages, currentPage, onPageChange }) => {
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const deleteTaskMutation = useMutation(
    (taskId) => deleteTask(taskId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tasks']);
        toast.success('Task deleted successfully');
        setIsDeleteModalOpen(false);
        setTaskToDelete(null);
      },
      onError: (error) => {
        if (error.response?.status === 404) {
          toast.error('Tarefa não encontrada');
        } else if (error.response?.status === 500) {
          toast.error('Você não tem permissão para excluir esta tarefa');
        } else if (error.response?.status === 400) {
          toast.error('Dados inválidos para exclusão da tarefa');
        } else {
          toast.error('Erro ao excluir tarefa');
        }
      }
    }
  );

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (taskToDelete) {
      await deleteTaskMutation.mutateAsync(taskToDelete._id);
    }
  };

  if (!tasks) {
    return (
      <div className="h-[50vh] bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
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
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Não encontramos nenhuma Task!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task._id}>
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <div className="flex flex-col h-full">
                {task.image_url && (
                  <div className="mb-4">
                    <img
                      src={task.image_url}
                      alt={task.title}
                      className="w-full h-48 object-cover rounded-md"
                    />
                  </div>
                )}

                <div className="flex-grow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-gray-200">
                    {task.title}
                  </h3>

                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <span className="font-medium mr-2 dark:text-white">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${task.status === 'done' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {task.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center dark:text-gray-400">
                      <span className="font-medium mr-2 dark:text-white">Due:</span>
                      {format(new Date(task.due_date), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center dark:text-gray-400">
                      <span className="font-medium mr-2 dark:text-white">Project:</span>
                      <p>{task.project?.name || task.project_id?.name}</p>
                    </div>
                    <div className="flex items-center dark:text-gray-400">
                      <span className="font-medium mr-2 dark:text-white">Creator:</span>
                      <p>{task.creator?.name || task.creator_id?.name}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    as={Link}
                    to={`/tasks/${task._id}/edit`}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteClick(task)}
                  >
                    Deletar
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Excluir Tarefa"
        message={`Tem certeza que deseja excluir a tarefa "${taskToDelete?.title}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir Tarefa"
        isLoading={deleteTaskMutation.isLoading}
      />
    </div>
  );
};

export default TaskList; 