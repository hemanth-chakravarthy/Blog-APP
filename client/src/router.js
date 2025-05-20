import { createBrowserRouter } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EditBlogPage from './pages/EditBlogPage';
import ViewBlogPage from './pages/ViewBlogPage';
import NotFoundPage from './pages/NotFoundPage';
import PrivateRoute from './components/PrivateRoute';
import BlogsPage from './pages/BlogsPage';

// Create router with future flags enabled
const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <HomePage />,
    },
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/register',
      element: <RegisterPage />,
    },
    {
      path: '/dashboard',
      element: <PrivateRoute><DashboardPage /></PrivateRoute>,
    },
    {
      path: '/blogs',
      element: <PrivateRoute><BlogsPage /></PrivateRoute>,
    },
    {
      path: '/blogs/new',
      element: <PrivateRoute><EditBlogPage /></PrivateRoute>,
    },
    {
      path: '/blogs/edit/:id',
      element: <PrivateRoute><EditBlogPage /></PrivateRoute>,
    },
    {
      path: '/blogs/:id',
      element: <ViewBlogPage />,
    },
    {
      path: '*',
      element: <NotFoundPage />,
    },
  ],
  {
    // Enable future flags
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

export default router;
