import { Link } from "react-router-dom"

function Home() {
	return (
		<div>
			<Link to='/media'>
				<p>Start your adventure with me...</p>
			</Link>
		</div>
	)
}

export default Home