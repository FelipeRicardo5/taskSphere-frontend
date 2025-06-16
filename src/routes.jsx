import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/templates/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import EditProject from './pages/EditProject';
import EditTask from './pages/EditTask';
import ManageCollaborators from './pages/ManageCollaborators';
import Tasks from './pages/Tasks';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/new" element={<EditProject />} />
        <Route path="projects/:id" element={<ProjectDetails />} />
        <Route path="projects/:id/edit" element={<EditProject />} />
        <Route path="projects/:projectId/collaborators" element={<ManageCollaborators />} />
        <Route path="projects/:projectId/tasks/new" element={<EditTask />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="tasks/:id/edit" element={<EditTask />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes; 