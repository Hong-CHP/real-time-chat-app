import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useState } from "react"

const AuthContext = createContext<any>(null)

export function AuthProvider({children} : any) {
	const [token, setToken] = useState(localStorage.getItem("access_token"))
	
	function login(newToken: string) {
		localStorage.setItem("access_token", newToken);
		setToken(newToken);
	}

	function logout() {
		localStorage.removeItem("access_token");
		setToken(null)
	}

	const userId = token? jwtDecode(token).sub : null
	
	return (
		<AuthContext.Provider value={{token, userId, login, logout}}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	return useContext(AuthContext)
}