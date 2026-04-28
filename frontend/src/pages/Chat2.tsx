import { useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"
import { jwtDecode } from 'jwt-decode'
import styled, { createGlobalStyle, keyframes } from "styled-components"

// ─── Global retro terminal styles ────────────────────────────────────────────
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=VT323&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --green:       #a8ff78;
    --green-dim:   #4a7c3f;
    --green-glow:  rgba(168, 255, 120, 0.15);
    --bg:          #0a0e0a;
    --bg-panel:    #0d120d;
    --bg-input:    #111811;
    --border:      #2a3f2a;
    --text-muted:  #4a6e4a;
    --amber:       #ffb347;
    --red-dim:     #7c3f3f;
    --font-mono:   'Share Tech Mono', monospace;
    --font-display:'VT323', monospace;
  }

  body {
    background: var(--bg);
    color: var(--green);
    font-family: var(--font-mono);
    font-size: 13px;
    min-height: 100vh;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--green-dim); }

  input, button, textarea {
    font-family: var(--font-mono);
    font-size: 13px;
    border-radius: 0;
    outline: none;
  }
`

// ─── Animations ───────────────────────────────────────────────────────────────
const blink = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
`
const scanline = keyframes`
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
`
const flicker = keyframes`
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
  20%, 22%, 24%, 55% { opacity: 0.85; }
`

// ─── Layout ───────────────────────────────────────────────────────────────────
const Screen = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  animation: ${flicker} 8s infinite;

  &::before {
    content: '';
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.07) 2px,
      rgba(0,0,0,0.07) 4px
    );
    pointer-events: none;
    z-index: 100;
  }

  &::after {
    content: '';
    position: fixed;
    left: 0; right: 0;
    height: 60px;
    background: linear-gradient(transparent, rgba(168,255,120,0.03), transparent);
    animation: ${scanline} 6s linear infinite;
    pointer-events: none;
    z-index: 99;
  }
`

const TopBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-panel);
  flex-shrink: 0;
`

const Title = styled.h1`
  font-family: var(--font-display);
  font-size: 28px;
  letter-spacing: 4px;
  color: var(--green);
  text-shadow: 0 0 12px var(--green);

  &::before { content: '> '; opacity: 0.5; }
  &::after  {
    content: '_';
    animation: ${blink} 1s step-end infinite;
    margin-left: 2px;
  }
`

const TopRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
`

const Body = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`

// ─── Left sidebar: Rooms ──────────────────────────────────────────────────────
const Sidebar = styled.aside`
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  background: var(--bg-panel);
  overflow: hidden;
`

const SidebarHeader = styled.div`
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  font-family: var(--font-display);
  font-size: 18px;
  letter-spacing: 2px;
  color: var(--text-muted);
  text-transform: uppercase;
`

const RoomList = styled.div`
  flex: 1;
  overflow-y: auto;
`

const RoomItem = styled.div<{ $active?: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--border);
  background: ${p => p.$active ? 'var(--green-glow)' : 'transparent'};
  border-left: ${p => p.$active ? '2px solid var(--green)' : '2px solid transparent'};
  transition: background 0.15s;

  &:hover { background: var(--green-glow); }
`

const RoomName = styled.button`
  background: none;
  border: none;
  color: ${p => p.color || 'var(--green)'};
  cursor: pointer;
  width: 100%;
  text-align: left;
  padding: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  span.badge {
    background: var(--green);
    color: var(--bg);
    font-size: 10px;
    padding: 0 4px;
    min-width: 16px;
    text-align: center;
  }
`

const RoomPreview = styled.p`
  color: var(--text-muted);
  font-size: 11px;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

// ─── Main chat area ───────────────────────────────────────────────────────────
const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const MessageLine = styled.p<{ $isMe: boolean }>`
  color: ${p => p.$isMe ? 'var(--green)' : '#8ecf8e'};
  text-align: ${p => p.$isMe ? 'right' : 'left'};

  &::before {
    content: ${p => p.$isMe ? '"[YOU]  "' : '"[RECV] "'};
    color: var(--text-muted);
    font-size: 11px;
  }
`

const InputRow = styled.div`
  display: flex;
  align-items: center;
  border-top: 1px solid var(--border);
  padding: 8px 12px;
  gap: 8px;
  background: var(--bg-panel);

  &::before {
    content: '>';
    color: var(--green);
    font-size: 16px;
    flex-shrink: 0;
  }
`

const TextInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: var(--green);
  caret-color: var(--green);

  &::placeholder { color: var(--text-muted); }
`

// ─── Right panel: People ──────────────────────────────────────────────────────
const RightPanel = styled.aside`
  width: 200px;
  flex-shrink: 0;
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  background: var(--bg-panel);
  overflow: hidden;
`

const PanelSection = styled.div`
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
`

const PanelHeader = styled.div`
  padding: 6px 12px;
  font-family: var(--font-display);
  font-size: 16px;
  letter-spacing: 2px;
  color: var(--text-muted);
  text-transform: uppercase;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const PanelBody = styled.div`
  padding: 6px 12px;
`

const SearchForm = styled.form`
  display: flex;
  gap: 4px;
  padding: 6px 12px;
  border-bottom: 1px solid var(--border);
`

const SearchInput = styled.input`
  flex: 1;
  background: var(--bg-input);
  border: 1px solid var(--border);
  color: var(--green);
  padding: 3px 6px;
  min-width: 0;

  &::placeholder { color: var(--text-muted); }
  &:focus { border-color: var(--green-dim); }
`

const SearchResult = styled.div`
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const FriendItem = styled.div`
  padding: 4px 12px;
  color: var(--green-dim);
  font-size: 12px;

  &::before { content: '• '; }
`

const FriendListScroll = styled.div`
  flex: 1;
  overflow-y: auto;
`

// ─── Shared button ────────────────────────────────────────────────────────────
const Btn = styled.button<{ $variant?: 'ghost' | 'solid' | 'danger' }>`
  background: ${p =>
    p.$variant === 'solid' ? 'var(--green)' :
    p.$variant === 'danger' ? 'var(--red-dim)' : 'transparent'};
  color: ${p =>
    p.$variant === 'solid' ? 'var(--bg)' :
    p.$variant === 'danger' ? '#ffaaaa' : 'var(--green-dim)'};
  border: 1px solid ${p =>
    p.$variant === 'solid' ? 'var(--green)' :
    p.$variant === 'danger' ? '#7c3f3f' : 'var(--border)'};
  padding: 2px 8px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 11px;
  white-space: nowrap;
  transition: all 0.15s;

  &:hover {
    background: ${p =>
      p.$variant === 'solid' ? '#c8ffaa' :
      p.$variant === 'danger' ? '#a05050' : 'var(--green-glow)'};
    color: ${p => p.$variant === 'solid' ? 'var(--bg)' : 'var(--green)'};
    border-color: ${p => p.$variant === 'danger' ? '#c06060' : 'var(--green-dim)'};
  }
`

// ─── Notifications dropdown ───────────────────────────────────────────────────
const NotifDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 260px;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  z-index: 200;
  box-shadow: 0 4px 24px rgba(0,0,0,0.6), 0 0 12px rgba(168,255,120,0.05);
`

const NotifHeader = styled.div`
  padding: 6px 12px;
  border-bottom: 1px solid var(--border);
  font-family: var(--font-display);
  font-size: 16px;
  letter-spacing: 2px;
  color: var(--text-muted);
`

const NotifItem = styled.div`
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);

  p { color: #8ecf8e; margin-bottom: 6px; font-size: 12px; }
`

const NotifActions = styled.div`
  display: flex;
  gap: 6px;
`

const StatusDot = styled.span<{ $count: number }>`
  display: ${p => p.$count > 0 ? 'inline-block' : 'none'};
  background: var(--amber);
  color: var(--bg);
  font-size: 10px;
  padding: 0 4px;
  min-width: 16px;
  text-align: center;
  margin-left: 4px;
`

const EmptyState = styled.p`
  color: var(--text-muted);
  font-size: 12px;
  padding: 12px;
  text-align: center;
`

// ─── Types ────────────────────────────────────────────────────────────────────
type Message = { content: string; senderId: string; roomId: string }
type FriendStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED'
type Notification = { id: number; fromUserId: number; fromName: string; status: FriendStatus }

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function createSocket() {
  return io('http://localhost:3000', {
    auth: { token: localStorage.getItem("access_token") }
  })
}

export function getUserId() {
  const token = localStorage.getItem("access_token")
  const decoded = jwtDecode(token!)
  return decoded.sub
}

// ─── Notifications panel ──────────────────────────────────────────────────────
function NotificationsPanel({ notifications, setNotifications, setFriendsVersion }: {
  notifications: Notification[]
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
  setFriendsVersion: React.Dispatch<React.SetStateAction<number>>
}) {
  const token = localStorage.getItem("access_token")

  async function acceptFriend(notif: Notification) {
    const res = await fetch(`/api/friend/accept/${notif.fromUserId}`, {
      method: 'POST',
      headers: { "Content-type": "application/json", Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
    setNotifications(prev => prev.filter(n => n.fromUserId !== notif.fromUserId))
    setFriendsVersion(prev => prev + 1)
  }

  async function refuseFriend(notif: Notification) {
    const res = await fetch(`/api/friend/refuse/${notif.fromUserId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
    setNotifications(prev => prev.filter(n => n.fromUserId !== notif.fromUserId))
  }

  return (
    <NotifDropdown>
      <NotifHeader>// REQUESTS</NotifHeader>
      {notifications.length === 0
        ? <EmptyState>[ no pending requests ]</EmptyState>
        : notifications.map((notif, i) => (
          <NotifItem key={i}>
            <p>{notif.fromName} wants to connect.</p>
            {notif.status === 'PENDING' && (
              <NotifActions>
                <Btn $variant="solid" onClick={() => acceptFriend(notif)}>Accept</Btn>
                <Btn $variant="danger" onClick={() => refuseFriend(notif)}>Refuse</Btn>
              </NotifActions>
            )}
          </NotifItem>
        ))
      }
    </NotifDropdown>
  )
}

// ─── Main Chat component ──────────────────────────────────────────────────────
function Chat() {
  const socketRef = useRef<any>(null)
  const [keyword, setKeyword] = useState("")
  const [searchResult, setSearchResult] = useState<any[] | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState("")
  const [friends, setFriends] = useState<any[]>([])
  const [currentRoomId, setCurrentRoomId] = useState<number | null>(null)
  const [openNotifications, setOpenNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [friendsVersion, setFriendsVersion] = useState(0)
  const [roomList, setRoomList] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const token = localStorage.getItem("access_token")
  const myId = getUserId()

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Socket
  useEffect(() => {
    const newSocket = createSocket()
    socketRef.current = newSocket
    newSocket.on("receiveMessage", data => setMessages(prev => [...prev, data]))
    newSocket.on('friend_request', data => setNotifications(prev => [...prev, data]))
    return () => { newSocket.disconnect() }
  }, [])

  async function handleEnterRoom(roomId: number) {
    if (!roomId || roomId === -1) return
    setCurrentRoomId(roomId)
    socketRef.current?.emit("join-room", { roomId })
    const res = await fetch(`/api/messages?roomId=${roomId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) return
    setMessages(await res.json())
  }

  function handleSendMessage() {
    if (!socketRef.current || !currentRoomId) return
    socketRef.current.emit('sendMessage', { content: message, roomId: currentRoomId })
    setMessage("")
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSendMessage()
  }

  useEffect(() => {
    fetch('/api/friend/list', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setFriends)
  }, [friendsVersion])

  useEffect(() => {
    fetch("/api/rooms", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setRoomList)
  }, [token])

  async function handleSearchRequest(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch(`/api/users/search?keyword=${keyword}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) return
    setSearchResult(await res.json())
  }

  async function handleAddFriend(friendId: number) {
    const res = await fetch('/api/friend/request', {
      method: 'POST',
      headers: { "Content-type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ friendId })
    })
    if (!res.ok) {
      const err = res.status === 409 ? await res.json() : { message: 'Request failed.' }
      alert(err.message)
    }
  }

  async function handleOpenNotifications() {
    const res = await fetch('/api/friend/requests', { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) return
    const data = await res.json()
    setNotifications(data.map((req: any) => ({
      id: req.id, fromUserId: req.userId, fromName: req.user.name, status: req.status
    })))
    setOpenNotifications(o => !o)
  }

  const pendingCount = notifications.filter(n => n.status === 'PENDING').length

  return (
    <>
      <GlobalStyle />
      <Screen>
        {/* ── Top bar ── */}
        <TopBar>
          <Title>TERMINAL CHAT</Title>
          <TopRight>
            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>UID:{myId}</span>
            <div style={{ position: 'relative' }}>
              <Btn onClick={handleOpenNotifications}>
                Requests<StatusDot $count={pendingCount}>{pendingCount}</StatusDot>
              </Btn>
              {openNotifications && (
                <NotificationsPanel
                  notifications={notifications}
                  setNotifications={setNotifications}
                  setFriendsVersion={setFriendsVersion}
                />
              )}
            </div>
          </TopRight>
        </TopBar>

        {/* ── Body ── */}
        <Body>
          {/* Left: Room list */}
          <Sidebar>
            <SidebarHeader>// Rooms</SidebarHeader>
            <RoomList>
              {roomList.length === 0
                ? <EmptyState>[ no rooms ]</EmptyState>
                : roomList.map(room => {
                  const isPrivate = room.type === 'PRIVATE'
                  const other = room.members.find((m: any) => m.userId !== Number(myId))
                  const name = isPrivate ? other?.user.name : room.name
                  return (
                    <RoomItem key={room.id} $active={currentRoomId === room.id}
                      onClick={() => handleEnterRoom(room.id)}>
                      <RoomName as="div">
                        <span>{name || 'unknown'}</span>
                        {room.unReadCount > 0 && <span className="badge">{room.unReadCount}</span>}
                      </RoomName>
                      {room.lastMessage && <RoomPreview>{room.lastMessage}</RoomPreview>}
                    </RoomItem>
                  )
                })
              }
            </RoomList>
          </Sidebar>

          {/* Center: Messages */}
          <Main>
            <MessagesArea>
              {!currentRoomId
                ? <EmptyState style={{ marginTop: 40 }}>[ select a room to begin ]</EmptyState>
                : messages.length === 0
                  ? <EmptyState>[ no messages yet ]</EmptyState>
                  : messages.map((msg, i) => (
                    <MessageLine key={i} $isMe={msg.senderId === String(myId)}>
                      {msg.content}
                    </MessageLine>
                  ))
              }
              <div ref={messagesEndRef} />
            </MessagesArea>
            <InputRow>
              <TextInput
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={currentRoomId ? "type message..." : "select a room first"}
                disabled={!currentRoomId}
              />
              <Btn $variant="solid" onClick={handleSendMessage} disabled={!currentRoomId}>Send</Btn>
            </InputRow>
          </Main>

          {/* Right: Search + Friends */}
          <RightPanel>
            <PanelSection>
              <PanelHeader>// Search</PanelHeader>
              <SearchForm onSubmit={handleSearchRequest}>
                <SearchInput
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder="username..."
                />
                <Btn type="submit">Go</Btn>
              </SearchForm>
              {searchResult?.map((target: any) => (
                <SearchResult key={target.id}>
                  <span style={{ fontSize: 12 }}>{target.name}</span>
                  <Btn onClick={() => handleAddFriend(target.id)}>+ Add</Btn>
                </SearchResult>
              ))}
            </PanelSection>

            <PanelSection>
              <PanelHeader>// Friends</PanelHeader>
            </PanelSection>
            <FriendListScroll>
              {friends.length === 0
                ? <EmptyState>[ no friends yet ]</EmptyState>
                : friends.map((f, i) => <FriendItem key={i}>{f.friend.name}</FriendItem>)
              }
            </FriendListScroll>
          </RightPanel>
        </Body>
      </Screen>
    </>
  )
}

export default Chat
