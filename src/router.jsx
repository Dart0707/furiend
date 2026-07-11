import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import Places from './pages/Places'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/signup', element: <SignUp /> },
  { path: '/signin', element: <SignIn /> },
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/places', element: <Places /> },
])

export default router