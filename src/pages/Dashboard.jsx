import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { getProjectsByUser, getTasksByCreator } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../public/infinite-spinner.svg';
import Card from '../components/atoms/Card';

const Dashboard = () => {
  const { user } = useAuth();
  const creatorId = user?.id
  const { data: projectsData, isLoading: isLoadingProjects } = useQuery('projects', getProjectsByUser);
  const { data: tasksData, isLoading: isLoadingTasks } = useQuery(
    ['tasks', creatorId],
    () => getTasksByCreator(creatorId),
    {
      enabled: !!creatorId
    }
  );

  const tasks = tasksData?.data?.tasks || [];
  // const projects = projectsData?.data || [];
  const projects = projectsData?.projects || [];
  const recentProjects = projects?.slice(0, 3) || [];
  const recentTasks = tasks?.slice(0, 5) || [];
  const completedTasks = tasks?.filter(task => task.status === 'done') || [];
  const pendingTasks = tasks?.filter(task => task.status === 'todo') || [];

  if (isLoadingProjects || isLoadingTasks) {
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
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-normal text-gray-900 dark:text-white sm:text-4xl">
            Seja bem-vindo de volta, <span className="font-bold">{user?.name || user?.email}</span>!
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
            Aqui está uma visão geral dos seus projetos e tarefas.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white dark:bg-gray-800">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total de Projetos</h3>
              <p className="mt-2 text-3xl font-bold text-primary-600 dark:text-primary-400">
                {projects?.length || 0}
              </p>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total de Tarefas</h3>
              <p className="mt-2 text-3xl font-bold text-primary-600 dark:text-primary-400">
                {tasks?.length || 0}
              </p>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Tarefas Concluídas</h3>
              <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                {completedTasks.length}
              </p>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Tarefas Pendentes</h3>
              <p className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {pendingTasks.length}
              </p>
            </div>
          </Card>
        </div>

        <div className="mt-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">

            <Card>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Projects Recentes
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Projects que você é criador ou colaborador
              </p>
              <div className="mt-4 space-y-4">
                {recentProjects.map((project) => (
                  <div
                    key={project._id}
                    className="flex items-center shadow-xl justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg max-w-full"
                  >
                    <div className="max-w-[70%]">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {project.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {project.description || 'No description provided'}
                      </p>
                    </div>
                    <Link
                      to={`/projects/${project._id}`}
                      className="btn-secondary text-sm ml-4 flex-shrink-0"
                    >
                      Ver
                    </Link>
                  </div>
                ))}
                {recentProjects.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nenhum project ainda
                  </p>
                )}
              </div>
              <div className="mt-6">
                <Link to="/projects" className="btn w-full">
                  Ver Todos os Projects
                </Link>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Suas Tasks criadas
              </h3>
              <div className="mt-4 space-y-4">
                {recentTasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center shadow-xl justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <div>
                      <h4 className=" font-medium text-gray-900 dark:text-white">
                        {task.project_id.name}
                      </h4>
                      <p className=" font-light text-gray-900 dark:text-white">
                        {task.title}
                      </p>
                      {task.image_url && (
                        <img
                          src={task.image_url}
                          alt={task.title}
                          className="w-16 h-16 object-cover rounded-md mt-2"
                        />
                      )}
                    </div>
                    <Link
                      to={`/tasks/${task._id}/edit`}
                      className="btn-secondary text-sm"
                    >
                      Editar
                    </Link>
                  </div>
                ))}
                {recentTasks.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nenhuma Task ainda
                  </p>
                )}
              </div>
              <div className="mt-6">
                <Link to="/tasks" className="btn w-full">
                  Ver Todas as Tasks
                </Link>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Ações Rápidas
              </h3>
              <div className="mt-4 space-y-4">
                <Link to="/projects/new" className="btn w-full">
                  Criar Novo Project
                </Link>
                <Link to="/projects" className="btn-secondary w-full">
                  Criar Nova Task
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 