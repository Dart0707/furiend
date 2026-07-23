import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import Places from './pages/Places'
import PlaceDetails from './pages/PlaceDetails'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/signup', element: <SignUp /> },
  { path: '/signin', element: <SignIn /> },
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/places', element: <Places /> },
  { path: '/places/:id', element: <PlaceDetails /> },
])

export default router