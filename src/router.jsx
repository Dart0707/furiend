import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Dashboard from './components/Dashboard'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/signup', element: <SignUp /> },
  { path: '/signin', element: <SignIn /> },
  { path: '/dashboard', element: <Dashboard /> },
])

export default router