import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import { jwtDecode } from 'jwt-decode'
import { ChatStyle } from "../components/style/ChatStyle"

export function createSocket() {
	return (
		io('http://localhost:3000', {
			auth: {
				token: localStorage.getItem("access_token")
		}})
	)
}

export function getUserId() {
	const token = localStorage.getItem("access_token")
	const decoded = jwtDecode(token!)
	return decoded.sub
}

type message = {
	content: string;
	senderId: string;
	receiverId: string;
}

function Chat () {
	const [searchOne, setSearchOne] = useState<any | null>(null)
	const [messages, setMessages] = useState<message[]>([])
	const [message, setMessage] = useState<string>("")
	const [friends, setFriends] = useState<any[]>([])
	const [receiverId, setReceiverId] = useState(-1)
	const [socket, setSocket] = useState<any>(null)
	
	const token = localStorage.getItem("access_token")
	
	useEffect(()=>{
		const newSocket = createSocket()
		setSocket(newSocket)
		
		newSocket.on("receiveMessage", data=>{
			setMessages(prev=>[...prev, data])
		})

		return ()=>{
			newSocket.disconnect()
		}
	}, [])

	useEffect(()=>{
		fetch('/api/friend/list', {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`
			}
		})
		.then(res=>res.json())
		.then(data=>setFriends(data))
	}, [])

	async function handleSearchRequest(e: any) {
		e.preventDefaut()
		const res = await fetch(`/api/users/${searchOne}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`
			}
		})
		if (!res.ok)
			throw new Error("Unauthorized token")
		const data = await res.json()
		setSearchOne(data)
	}

	async function handleAddFriend(friendId: number) {
		await fetch('/api/friend/request', {
			method: 'POST',
			headers: {
				"Content-type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				friendId: friendId
			})
		})
	}

	function handleSendMessage() {
		if (!socket || receiverId === -1) return

		socket.emit('sendMessage', {
			content: message,
			receiverId: receiverId,
		})
		setMessage("")
	}
	
	return(
		<div>
			<h2>Chat</h2>
			<form onSubmit={handleSearchRequest}>
				<div>
					<label htmlFor="search_one"></label>
					<input type="text" id="search_one" name="search_one"
						value={searchOne} 
						onChange={e=>setSearchOne(e.target.value)}
						placeholder="Search someone..."/>
					<button>Search</button>
				</div>
			</form>
			{searchOne && (
				<div>
					<p>{searchOne.name}</p>
					<button onClick={()=>handleAddFriend(searchOne.id)}>Add friend</button>
				</div>
			)}
			<ChatStyle>
				<div className="left">
					<h3>Friends</h3>
					{friends.map((friend, i)=><div key={i}>
						<button
							onClick={()=>setReceiverId(friend.friend.id)}>
							{friend.friend.name}
						</button>
					</div>)}
				</div>
				<div className="right">
					<div>
						{messages.map((msg, i)=>{
							const isMe = msg.senderId === getUserId()
							return (<p key={i}
								style={{textAlign: isMe? "right" : "left"}}>
								{msg.content}</p>)
						})}
					</div>
					<p>Me: {getUserId()} </p>
					<input type="text" value={message} onChange={e=>setMessage(e.target.value)}/>
					<button onClick={handleSendMessage}>Send</button>
				</div>
			</ChatStyle>
		</div>
	)
}

export default Chat