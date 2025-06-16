import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpa os dados de autenticação
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redireciona para login apenas se não estiver já na página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  return api.post('/auth/login', { email, password }).then(res => res.data);
};

export const register = (name, email, password) =>
  api.post('/auth/register', { name, email, password }).then(res => res.data);

export const logout = async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return api.post('/auth/logout').then(res => res.data);
};

export const getProjects = async () => {
  // console.log('API: Fetching projects');
  const response = await api.get('/projects');
  // console.log('API: Get projects response:', response.data);
  return response.data; 
};

export const getProjectsByUser = async () => {
  const response = await api.get('/user/projects')
  // console.log(response.data.data)
  return response.data.data
}

export const getProject = async (id) => {
  // console.log('API: Fetching project with ID:', id);
  const response = await api.get(`/projects/${id}`);
  // console.log('API: Get project response:', response.data);
  return response.data.data; 
};

export const createProject = async (projectData) => {
  // console.log('API: Creating project with data:', projectData);
  const response = await api.post('/projects', projectData);
  // console.log('API: Create project response:', response.data);
  return response.data.data; 
};

export const updateProject = async (projectData) => {
  const id = window.location.pathname.split('/')[2]; 
  // console.log('API: Updating project with ID from URL:', id);
  // console.log('API: Project data:', projectData);
  const response = await api.put(`/projects/${id}`, projectData);
  // console.log('API: Update project response:', response.data);
  return response.data.data; 
};

export const deleteProject = async (id) => {
  // console.log('API: Deleting project with ID:', id);
  const response = await api.delete(`/projects/${id}`);
  // console.log('API: Delete project response:', response.data);
  return response.data.data; 
};

export const getTasks = async (projectId, filters = {}) => {
  // console.log('API: Fetching tasks', projectId ? `for project ${projectId}` : 'for all projects');
  const params = new URLSearchParams();
  
  if (projectId) {
    params.append('project_id', projectId);
  }
  
  if (filters.search) {
    params.append('search', filters.search);
  }
  
  if (filters.status) {
    params.append('status', filters.status);
  }
  
  if (filters.page) {
    params.append('page', filters.page);
  }
  
  if (filters.limit) {
    params.append('limit', filters.limit);
  }
  
  const url = `/tasks?${params.toString()}`
  const response = await api.get(url);
  // console.log('URL: ', url);
  // console.log('API: Get tasks response:', response.data);
  return response.data; 
};

export const getTasksList = async (filters = {}) => {
  // console.log('API: Fetching tasks list with filters:', filters);
  const params = new URLSearchParams();
  
  params.append('page', filters.page || 1);
  params.append('limit', filters.limit || 10);
  
  if (filters.search) {
    params.append('title', filters.search);
  }
  
  if (filters.status) {
    params.append('status', filters.status);
  }
  
  if (filters.project) {
    params.append('project_id', filters.project);
  }
  
  const url = `/tasks?${params.toString()}`;
  // console.log('API: Get tasks list URL:', url);
  
  const response = await api.get(url);
  // console.log('API: Get tasks list response:', response.data);
  
  return response.data;
};

export const getTask = async (id) => {
  // console.log('API: Fetching task with ID:', id);
  const response = await api.get(`/tasks/${id}`);
  // console.log('API: Get task response:', response.data);
  return response.data.data; 
};

export const createTask = (data) =>
  api.post('/tasks', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then((res) => res.data);

export const updateTask = ({ id, ...data }) =>
  api.put(`/tasks/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then((res) => res.data);

export const deleteTask = (id) =>
  api.delete(`/tasks/${id}`).then((res) => res.data);

export const getTasksByCreator = async (creatorId) => {
  try {
    const response = await api.get(`/tasks?creator_id=${creatorId}`);
    // console.log('API: Get tasks by creator response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks by creator:', error);
    throw error;
  }
};

export const addCollaborator = async (projectId, email) => {
  // console.log('API: Adding collaborator to project:', projectId);
  // console.log('API: Collaborator email:', email);
  const response = await api.post(`collaborators/projects/${projectId}/collaborators`, { email });
  // console.log('API: Add collaborator response:', response.data);
  return response.data.data;
};

export const removeCollaborator = async (projectId, userId) => {
  // console.log('API: Removing collaborator from project:', projectId);
  // console.log('API: Collaborator ID:', userId);
  const response = await api.delete(`/projects/${projectId}/collaborators/${userId}`);
  // console.log('API: Remove collaborator response:', response.data);
  return response.data.data;
};

export const uploadTaskImage = async (file) => {
  try {
    // console.log('Starting image upload with file:', file);
    
    // criando instância FormData 
    const formData = new FormData();
    formData.append('image', file);
    
    // console.log('FormData created with image');
    
    const response = await api.post('/upload/task', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    // console.log('Upload response:', response.data);
    
    if (response.data.success) {
      return {
        image_url: response.data.data.url,
        public_id: response.data.data.public_id
      };
    } else {
      throw new Error('Upload failed: ' + (response.data.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error in uploadTaskImage:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      throw new Error(error.response.data.message || 'Failed to upload image');
    }
    throw error;
  }
};

export default api; 