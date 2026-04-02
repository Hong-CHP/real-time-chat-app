import { createRoot, hydrateRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import routes from './routes'

const rootEle = document.getElementById('root')!
const router = createBrowserRouter(routes)
if (import.meta.env.PROD)
  hydrateRoot(rootEle, <RouterProvider router={router}/>)
else
  createRoot(rootEle).render(<RouterProvider router={router} />)
