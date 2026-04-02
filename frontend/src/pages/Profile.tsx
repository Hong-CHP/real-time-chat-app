import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ErrorText } from "../components/style/LoginStyle"

function Profile() {
	const navigate = useNavigate()
	const [user, setUser] = useState<any>(null)
	const [errors, setErrors] = useState<string[]>([])

	useEffect(()=>{
		const token = localStorage.getItem("access_token")
		if (!token) {
			navigate("/login")
			return
		}

		fetch("/api/auth/profile", {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`
			}
		}).then(async (res)=>{
			if (!res.ok)
				throw new Error("Unauthorized")
			const data = await res.json()
			setUser(data)
		}).catch((err: any)=>{
			setErrors([err.message])
			localStorage.removeItem("access_token")
			navigate("/login")
		})
	}, [])

	return (
		<div>
			<p>This is your profile page...</p>
			{user ? (
				<>
					<div>
						<p>Email: {user.email}</p>
						<p>ID: {user.id}</p>
					</div>
					<Link to="/chat">
						<button>Chat with me...</button>
					</Link>
				</>
			) : (
				<p>Loading...</p>
			)}
			{errors.length > 0 &&
				<ErrorText>{errors.map((e, i)=><p key={i}>{e}</p>)}</ErrorText>}
		</div>
	)
}

export default Profile