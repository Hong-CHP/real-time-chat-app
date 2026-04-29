import { useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"
import { ChatStyle } from "../components/style/ChatStyle"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { apiFetch } from "../context/api"

export function createSocket(token: string) {
	return (
		io('http://localhost:3000', {
			auth: {
				token,
		}})
	)
}

type Message = {
	content: string;
	senderId: string;
	roomId: string;
}

type FriendStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED';

type Notification = {
	id: number;
	fromUserId: number;
	fromName: string;
	status: FriendStatus;
}

function Chat () {
	const socketRef = useRef<any>(null)
	const [keyword, setKeyword] = useState<string>("")
	const [searchResult, setSearchResult] = useState<any | null>(null)
	const [messages, setMessages] = useState<Message[]>([])
	const [message, setMessage] = useState<string>("")
	const [friends, setFriends] = useState<any[]>([])
	const [showFriendList, setShowFriendList] = useState(false)
	const [currentRoomId, setCurrentRoomId] = useState<number | null>(null)
	const [openNotifications, setOpenNotifications] = useState(false)
	const [notifications, setNotifications] = useState<Notification[]>([])
	const [friendsVersion, setFriendsVersion] = useState(0)
	const [roomList, setRoomList] = useState<any[]>([])
	const navigate = useNavigate()
	const { token, userId, logout } = useAuth()
	const myId = userId

	if (!token)
		return <div>
				<Link to='/login'>
					<p>Please login first.</p>
				</Link>
			</div>

	// socket for receiveMessages, receive friend_request
	useEffect(()=>{
		if (!token)
			return
		const newSocket = createSocket(token)
		socketRef.current = newSocket
		
		newSocket.on("connect", () => {
   			console.log("socket connected:", newSocket.id)
  		})

		newSocket.on("receiveMessage", data=>{
			setMessages(prev=>[...prev, data])
		})

		newSocket.on('friend_request', data=>{
			setNotifications(prev=>[...prev, data])
		})

		newSocket.on('exception', err=>{
			console.error("Socket error: ", err)
		})

		return ()=>{
			newSocket.disconnect()
		}
	}, [token])

	async function handleEnterRoom(roomId: number) {
		console.log("ENTER ROOM CALLED", roomId)
		if (!roomId || roomId === -1) return 
		setCurrentRoomId(roomId)
		
		socketRef.current?.emit("join-room", {roomId})
		const res = await apiFetch(`/api/messages?roomId=${roomId}`, {
			method: 'GET',
			headers : {Authorization: `Bearer ${token}`}
		})
		if (!res.ok)
			throw new Error(`${res.status}: ${res.statusText}`)
		const data = await res.json()
		setMessages(data)
	}
	
	// send a message
	function handleSendMessage() {
		if (!socketRef.current || currentRoomId === -1) return

		socketRef.current.emit('sendMessage', {
			content: message,
			roomId: currentRoomId,
		})
		setMessage("")
	}
	
	// get friends list
	useEffect(()=>{
		apiFetch('/api/friend/list', {
			method: "GET",
		})
		.then(res=>res.json())
		.then(data=>{setFriends(data)})
	}, [friendsVersion])

	function handleShowFriendList() {
		setShowFriendList(show=>!show)
	}

	// get room List
	useEffect(()=>{
		if (!token) return
		const fetchRooms = async ()=>{
			const res = await apiFetch("/api/rooms", {
				method: "GET",
			})
			if (!res.ok)
				throw new Error("Unauthorized token")
			const data = await res.json()
			setRoomList(data)
			console.log(data)
		}
		fetchRooms()
	}, [token])

	// find someone in users
	async function handleSearchRequest(e: any) {
		e.preventDefault()
		const res = await apiFetch(`/api/users/search?keyword=${keyword}`, {
			method: 'GET',
		})
		if (!res.ok)
			throw new Error("Unauthorized token")
		const data = await res.json()
		setSearchResult(data)
	}

	// sendRequest for adding a friend
	async function handleAddFriend(friendId: number) {		
		const res = await apiFetch('/api/friend/request', {
				method: 'POST',
				headers: {
					"Content-type": "application/json",
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
		const res = await apiFetch('/api/friend/requests', {
			method:"GET",
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
		setOpenNotifications(open=>!open)
	}

	async function handleLogout() {
		try {
			const res = await apiFetch("/api/auth/logout", {
				method: "POST",
			})
			if (!res.ok)
				throw new Error(`${res.status} : ${res.statusText}`)
			// localStorage.removeItem("access_token");
		} catch (err: any) {
			console.error(err)
		} finally {
			logout()
			navigate('/')
		}
	}

	return(
		<div>
			<div>
				<button onClick={handleLogout}>Logout</button>
				<h2>Chat</h2>
				<div style={{display: "flex", justifyContent: "flex-end", marginBottom: "10px"}}>
					<button onClick={handleOpenNotifications}>Notifications</button>
					{openNotifications && <Notifications notifications={notifications} setNotifications={setNotifications} setFriendsVersion={setFriendsVersion} />}
				</div>
			</div>
			<div style={{display: "flex", justifyContent: "space-between", marginBottom: "10px"}}>
				<div>
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
				</div>
				<div style={{display: "flex", flexDirection: "column"}}>
					<button onClick={handleShowFriendList}>Friends</button>
					<div>
					{showFriendList && 
						friends.map((f, i)=>
							<div key={i}>
								<p>{f.friend.name}</p>
							</div>
					)}
					</div>
				</div>
			</div>
			<ChatStyle>
				<div className="left">
					<h3>Rooms</h3>
					{roomList.map((room)=>{
						const isPrivate = room.type === 'PRIVATE'
						const otherMember = room.members.find(m=>m.userId !== Number(myId))
						const names = isPrivate ? otherMember?.user.name : room.name
						return(
							<div key={room.id} style={{border: "1px solid", padding: "4px"}}>
								<div style={{display: "flex", justifyContent: "space-between"}}>
									<button onClick={()=>handleEnterRoom(room.id)}>{names}</button>	
									<span>{room.unReadCount}</span>
								</div>
								<p style={{margin: "4px 0 0 4px"}}>{room.lastMessage}</p>
							</div>
						)
					})}
				</div>
				<div className="right">
					<div>
						{messages.map((msg, i)=>{
							const isMe = msg.senderId === userId
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
		const res = await apiFetch(`/api/friend/accept/${notif.fromUserId}`, {
			method: 'POST',
			headers: {
				"Content-type": "application/json",
			}
		})
		if (!res.ok)
			throw new Error(`${res.status}: ${res.statusText}`)
		setNotifications(prev=>prev.filter(n=>n.fromUserId !== notif.fromUserId))
		setFriendsVersion(prev=>prev + 1)
	}

	async function refuseFriend(notif: Notification) {
		const res = await apiFetch(`/api/friend/refuse/${notif.fromUserId}`, {
			method: 'POST',
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