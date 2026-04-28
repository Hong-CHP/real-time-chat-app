import { createRoot, hydrateRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import routes from './routes'
import { AuthProvider } from "./context/AuthContext"

const rootEle = document.getElementById('root')!
const router = createBrowserRouter(routes)

const app = (
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
)

if (import.meta.env.PROD)
  hydrateRoot(rootEle, app)
else
  createRoot(rootEle).render(app)
