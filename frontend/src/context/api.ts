type ApiOptions = {
	method?: string;
	headers?: any;
	body? : any;
}

export async function apiFetch(url: string, options : ApiOptions = {}) {
	const token = localStorage.getItem("access_token")

	// get token
	let res = await fetch(`${url}`, {
		...options,
		headers: {
			...(options.headers || {}),
			Authorization: token? `Bearer ${token}` : ""
		},
		credentials: "include",
	})

	// refresh token
	if (res.status === 401) {
		const refreshRes = await fetch("/api/auth/refresh", {
			method: 'POST',
			credentials: "include",
		})
		if (refreshRes.ok) {
			const data = await refreshRes.json()
			localStorage.setItem("access_token", data.access_token)
			// retry with new generated token
			res = await fetch(`${url}`, {
				...options,
				headers: {
					...(options.headers || {}),
					Authorization: `Bearer ${data.access_token}`
				},
				credentials: "include",
			})
		} else {
			localStorage.removeItem("access_token")
			window.location.href = '/login'
		}
	}
	return res
}