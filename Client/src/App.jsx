import { lazy, Suspense } from 'react'
import { Toaster } from 'react-hot-toast'
import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute'
import PageLoader from './components/PageLoader'

// Route-level code splitting keeps the initial bundle small - the charts and
// tables only download when the user actually opens those screens.
const HomePage = lazy(() => import('./pages/HomePage'))
const Transactions = lazy(() => import('./pages/Transactions'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const NotFound = lazy(() => import('./pages/NotFound'))

const protectedRoutes = [
  { path: '/', element: <HomePage /> },
  { path: '/transactions', element: <Transactions /> },
  { path: '/analytics', element: <Analytics /> },
  { path: '/profile', element: <Profile /> },
  { path: '/settings', element: <Settings /> },
]

const publicOnlyRoutes = [
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
]

function App() {
  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {protectedRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={<ProtectedRoute>{element}</ProtectedRoute>} />
          ))}
          {publicOnlyRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={<PublicOnlyRoute>{element}</PublicOnlyRoute>} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
