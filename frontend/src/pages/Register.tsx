import { useState } from "react"
import { ErrorText, InputBox, LoginStyle } from "../components/style/LoginStyle"
import { Link, useNavigate } from "react-router-dom"
import { validateEmail, validatePassword, validateUsername } from "../function/userValidation"
import { sanitizeEmail, sanitizePassword, sanitizeUsername } from "../function/userSanitize"

function Register() {
	const [userEmail, setUserEmail] = useState("")
	const [username, setUsername] = useState("")
	const [userPwd, setUserPwd] = useState("")
	const [confPwd, setConfPwd] = useState("")
	const [errors, setErrors] = useState<string[]>([])
	const [message, setMessage] = useState("")
	const navigate = useNavigate()

	async function	handleSubmit(e: any) {
		e.preventDefault()
		setErrors([])
		if (!userEmail || !username || !userPwd || !confPwd) {
			setErrors(["Please fill all fields."])
			return
		}
		const uEmail = sanitizeEmail(userEmail)
		const uName = sanitizeUsername(username)
		const uPwd = sanitizePassword(userPwd)
		const cPwd = sanitizePassword(confPwd)
		const allErr = [
			...validateEmail(uEmail),
			...validateUsername(uName),
			...validatePassword(uPwd, uName, uEmail),
			...(cPwd === uPwd ? [] : ["Your password don't match."]),
		]
		if (allErr.length > 0) {
			setErrors(allErr)
			return
		}
		try {
			const res = await fetch("/api/auth/register", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({
					email: uEmail,
					name: uName,
					password: uPwd,
				})
			})
			if (!res.ok)
				throw new Error (`${res.status}: ${res.statusText}`)
			setMessage("Registration successful! Redirecting to login...")
			setTimeout(()=>{
				navigate('/login')
			}, 3000)
		} catch(err: any) {
			setErrors([err.message])
		}
	}

	return (
		<LoginStyle>
			<h2>Sign up</h2>
			<form onSubmit={handleSubmit}>
				<InputBox>
					<label htmlFor="email">Email address: </label>
					<input type="email" id="email" name="email" 
						value={userEmail} onChange={e=>{setUserEmail(e.target.value)}}/>
				</InputBox>
				<InputBox>
					<label htmlFor="name">Name: </label>
					<input type="text" id="name" name="name" value={username} 
						onChange={e=>{setUsername(e.target.value)}}/>
				</InputBox>
				<InputBox>
					<label htmlFor="password">Password: </label>
					<input type="password" id="password" name="password"
						value={userPwd} onChange={e=>{setUserPwd(e.target.value)}}/>
				</InputBox>
				<InputBox>
					<label htmlFor="confirmPassword">Confirm password: </label>
					<input type="password" id="confirmPassword" name="confirmPassword"
						value={confPwd} onChange={e=>{setConfPwd(e.target.value)}}/>
				</InputBox>
				{errors.length > 0 &&
					<ErrorText>{errors.map((e, i)=><p key={i}>{e}</p>)}</ErrorText>}
				{message && <p style={{color: "green", margin: "4px"}}>{message}</p>}
				<button>Sign up</button>
			</form>
			<div className='extern'>
				<p>or</p>
				<button>Continue with Github</button>
				<button>Continue with Goole</button>
				<p>New to here ? 
					<Link to='/Register'><span>Create an account</span></Link></p>
			</div>
		</LoginStyle>
	)
}

export default Register