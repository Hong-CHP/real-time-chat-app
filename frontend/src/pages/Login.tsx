import { Link, useNavigate } from 'react-router-dom';
import { InputBox, ErrorText } from '../components/style/LoginStyle'
import { LoginStyle } from '../components/style/LoginStyle'
import { useState } from 'react';
import { sanitizeEmail, sanitizePassword } from '../function/userSanitize';

function Login() {
	const [userEmail, setUserEmail] = useState("")
	const [userPwd, setUserPwd] = useState("")
	const [errors, setErrors] = useState<string[]>([])
	const navigate = useNavigate()

	async function handleSubmit(e: any) {
		setErrors([])
		if (!userEmail || !userPwd) {
			setErrors(["Please fill all fields."])
			e.preventDefault()
			return
		}
		const uEmail = sanitizeEmail(userEmail)
		const uPassword = sanitizePassword(userPwd)
		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: {"Content-Type" : "application/json"},
				body: JSON.stringify({
					email: uEmail,
					password: uPassword,
				})
			})
			if (!res.ok) {
				throw new Error(`${res.status}: ${res.statusText}`)
			}
			const data = await res.json()
			localStorage.setItem("access_token", data.access_token)
			setUserEmail("")
			setUserPwd("")
			navigate("/profile")
		} catch (err: any) {
			setErrors([err.message])
		}
	}
	return (
		<LoginStyle>
			<h2>Sign in</h2>
			<form onSubmit={handleSubmit}>
				<InputBox>
					<label htmlFor="email">Email address: </label>
					<input type="email" id="email" name="email" value={userEmail} onChange={e=>{setUserEmail(e.target.value)}}/>
				</InputBox>
				<InputBox>
					<label htmlFor="password">Password: </label>
					<input type="password" id="password" name="password" value={userPwd} onChange={e=>{setUserPwd(e.target.value)}}/>
				</InputBox>
				{errors.length > 0 &&
					<ErrorText>{errors.map((e, i)=><p key={i}>{e}</p>)}</ErrorText>}
				<button>Sign in</button>
			</form>
			<div className='extern'>
				<p>or</p>
				<button>Continue with Github</button>
				<button>Continue with Goole</button>
				<p>New to here ? <Link to='/Register'><span>Create an account</span></Link></p>
			</div>
		</LoginStyle>
	)
}

export default Login