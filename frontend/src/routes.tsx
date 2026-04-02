import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Layout from './App';

const routes = [
	{
		path: '/',
		element: <Layout />,
		children: [
			{ index: true, element: <Home />},
			{ path: 'register', element: <Register />},
			{ path: 'login', element: <Login />},
			{ path: 'chat', element: <Chat />},
			{ path: 'profile', element: <Profile />},
			{ path: '*', element: <NotFound />}
		]
}]

export default routes
