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

type Message = {
	content: string;
	senderId: string;
	receiverId: string;
}

type FriendStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED';

type Notification = {
	id: number;
	fromUserId: number;
	fromName: string;
	status: FriendStatus;
}

function Chat () {
	const [keyword, setKeyword] = useState<string>("")
	const [searchResult, setSearchResult] = useState<any | null>(null)
	const [messages, setMessages] = useState<Message[]>([])
	const [message, setMessage] = useState<string>("")
	const [friends, setFriends] = useState<any[]>([])
	const [receiverId, setReceiverId] = useState(-1)
	const [socket, setSocket] = useState<any>(null)
	const [openNotifications, setOpenNotifications] = useState(false)
	const [notifications, setNotifications] = useState<Notification[]>([])
	const [friendsVersion, setFriendsVersion] = useState(0)
	
	const token = localStorage.getItem("access_token")
	const myId = getUserId()

	// socket for receiveMessages, receive friend_request
	useEffect(()=>{
		const newSocket = createSocket()
		setSocket(newSocket)
		
		newSocket.on("receiveMessage", data=>{
			setMessages(prev=>[...prev, data])
		})

		newSocket.on('friend_request', data=>{
			setNotifications(prev=>[...prev, data])
		})

		return ()=>{
			newSocket.disconnect()
		}
	}, [])
	
	// send a message
	function handleSendMessage() {
		if (!socket || receiverId === -1) return

		socket.emit('sendMessage', {
			content: message,
			receiverId: receiverId,
		})
		setMessage("")
	}
	
	// get friends list
	useEffect(()=>{
		fetch('/api/friend/list', {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`
			}
		})
		.then(res=>res.json())
		.then(data=>setFriends(data))
	}, [friendsVersion])

	// find someone in users
	async function handleSearchRequest(e: any) {
		e.preventDefault()
		const res = await fetch(`/api/users/search?keyword=${keyword}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`
			}
		})
		if (!res.ok)
			throw new Error("Unauthorized token")
		const data = await res.json()
		setSearchResult(data)
	}

	// sendRequest for adding a friend
	async function handleAddFriend(friendId: number) {		
		const res = await fetch('/api/friend/request', {
				method: 'POST',
				headers: {
					"Content-type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					friendId: friendId
				})
		})
		if (!res.ok) {
			if (res.status === 409) {
				const err = await res.json()
				alert(err.message)
			} else {
				alert('Request sent failed.')
			}
		}
	}

	async function handleOpenNotifications() {
		const res = await fetch('/api/friend/requests', {
			method:"GET",
			headers: {
				Authorization: `Bearer ${token}`,
			}	
		})
		if (!res.ok)
			throw new Error("Unauthorized token.")
		const data = await res.json()
		setNotifications(
			data.map((req : any)=>({
				id: req.id,
				fromUserId: req.userId,
				fromName: req.user.name,
				status: req.status,
			})
		))
		setOpenNotifications(true)
	}

	async function handleInteractionWithFriend(friendId: number) {
		if (friendId === -1) return 
		setReceiverId(friendId)
		const res = await fetch(`/api/messages?userId=${myId}&friendId=${friendId}`, {
			method: 'GET',
			headers : {Authorization: `Bearer ${token}`}
		})
		if (!res.ok)
			throw new Error("Unauthorized token.")
		const data = await res.json()
		setMessages(data)
	}


	return(
		<div>
			<div>
				<h2>Chat</h2>
				<button onClick={handleOpenNotifications}>Notifications</button>
				{openNotifications && <Notifications notifications={notifications} setNotifications={setNotifications} setFriendsVersion={setFriendsVersion} />}
			</div>
			<form onSubmit={handleSearchRequest}>
				<div>
					<label htmlFor="search_one"></label>
					<input type="text" id="search_one" name="search_one"
						value={keyword} 
						onChange={e=>setKeyword(e.target.value)}
						placeholder="Search someone..."/>
					<button>Search</button>
				</div>
			</form>
			{searchResult?.map((target: any)=>
				<div key={target.id}>
					<p>{target.name}</p>
					<button onClick={()=>handleAddFriend(target.id)}>Add friend</button>
				</div>
			)}
			<ChatStyle>
				<div className="left">
					<h3>Friends</h3>
					{friends.map((friend)=><div key={friend.id}>
						<button
							onClick={()=>handleInteractionWithFriend(friend.friend.id)}>
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
					<p>Me: {myId} </p>
					<input type="text" value={message} onChange={e=>setMessage(e.target.value)}/>
					<button onClick={handleSendMessage}>Send</button>
				</div>
			</ChatStyle>
		</div>
	)
}

type NotificationsProps = {
	notifications: Notification[];
	setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
	setFriendsVersion: React.Dispatch<React.SetStateAction<number>>
}

function Notifications({notifications, setNotifications, setFriendsVersion} : NotificationsProps) {
	const token = localStorage.getItem("access_token")

	async function acceptFriend(notif: Notification) {
		const res = await fetch(`/api/friend/accept/${notif.fromUserId}`, {
			method: 'POST',
			headers: {
				"Content-type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				friendId: notif.fromUserId,
			})
		})
		if (!res.ok)
			throw new Error(`${res.status}: ${res.statusText}`)
		setNotifications(prev=>prev.filter(n=>n.fromUserId !== notif.fromUserId))
		setFriendsVersion(prev=>prev + 1)
	}

	async function refuseFriend(notif: Notification) {
		const res = await fetch(`/api/friend/refuse/${notif.fromUserId}`, {
			method: 'POST',
			headers: {Authorization: `Bearer ${token}`},
		})
		if (!res.ok)
			throw new Error(`${res.status}: ${res.statusText}`)
		setNotifications(prev=>prev.filter(n=>n.fromUserId !== notif.fromUserId))
	}

	return (
		<div>
			<ul>
				{notifications.map((notif, i)=><div key={i}>
					<p>{notif.fromName} ask to be friend.</p>
					{
						notif.status === 'PENDING' && 
						<>
							<button onClick={()=>acceptFriend(notif)}>Accept</button>
							<button onClick={()=>refuseFriend(notif)}>Refuse</button>
						</>
					}
				</div>)}
			</ul>
		</div>
	)
}

export default Chat