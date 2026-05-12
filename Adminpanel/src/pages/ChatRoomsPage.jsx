import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useAdmin } from '../state/AdminContext.jsx'

function ChatRoomsPage() {
  const { chatRooms, users, closeChatRoom, getChatMessages, replyChatRoom } = useAdmin()
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [messages, setMessages] = useState([])
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)

  const selectedRoom = useMemo(
    () => chatRooms.find((room) => room.id === selectedRoomId) || null,
    [chatRooms, selectedRoomId],
  )
  const userById = useMemo(() => new Map(users.map((user) => [Number(user.id), user])), [users])

  useEffect(() => {
    if (!chatRooms.length) {
      setSelectedRoomId(null)
      setMessages([])
      return
    }
    if (!selectedRoomId || !chatRooms.some((room) => room.id === selectedRoomId)) {
      setSelectedRoomId(chatRooms[0].id)
    }
  }, [chatRooms, selectedRoomId])

  useEffect(() => {
    let cancelled = false
    const loadMessages = async () => {
      if (!selectedRoomId) return
      try {
        const rows = await getChatMessages(selectedRoomId)
        if (!cancelled) setMessages(rows)
      } catch (error) {
        if (!cancelled) toast.error(error.message)
      }
    }

    loadMessages()
    const timer = setInterval(loadMessages, 4000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [getChatMessages, selectedRoomId])

  const onClose = async (id) => {
    try {
      await closeChatRoom(id)
      toast.success('Chat room closed')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const onReply = async () => {
    if (!selectedRoomId || !reply.trim()) return
    setSending(true)
    try {
      await replyChatRoom(selectedRoomId, reply.trim())
      const rows = await getChatMessages(selectedRoomId)
      setMessages(rows)
      setReply('')
      toast.success('Reply sent')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="panel-grid">
      <header className="panel-head">
        <h2>Live Chat Rooms</h2>
        <p>Monitor support conversations, send replies, and close resolved rooms.</p>
      </header>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Room Key</th>
              <th>User ID</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {chatRooms.map((room) => (
              <tr
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                style={{ cursor: 'pointer', opacity: selectedRoomId === room.id ? 1 : 0.9 }}
              >
                <td>{room.id}</td>
                <td>{room.roomKey}</td>
                <td>{userById.get(Number(room.userId))?.name || `User #${room.userId}`}</td>
                <td>{room.status}</td>
                <td>
                  <button
                    className="mini-btn"
                    disabled={room.status === 'closed'}
                    onClick={(event) => {
                      event.stopPropagation()
                      onClose(room.id)
                    }}
                  >
                    Close Room
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-card plan-form">
        <h3>{selectedRoom ? `Chat Thread - Room #${selectedRoom.id}` : 'Select a room'}</h3>
        {selectedRoom ? (
          <p className="muted">
            User: {userById.get(Number(selectedRoom.userId))?.name || '-'} | Email:{' '}
            {userById.get(Number(selectedRoom.userId))?.email || '-'} | Phone:{' '}
            {userById.get(Number(selectedRoom.userId))?.phone || '-'}
          </p>
        ) : null}
        <div className="admin-chat-thread">
          {messages.length ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={`admin-chat-bubble ${message.senderRole === 'admin' ? 'admin' : 'user'}`}
              >
                <strong>{message.senderRole === 'admin' ? 'Admin' : 'User'}:</strong> {message.content}
              </div>
            ))
          ) : (
            <p className="muted">No messages in this room yet.</p>
          )}
        </div>
        <div className="plan-actions">
          <input
            placeholder="Type your reply..."
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onReply()
            }}
            disabled={!selectedRoom || sending}
          />
          <button className="primary-btn" type="button" disabled={!selectedRoom || sending} onClick={onReply}>
            {sending ? 'Sending...' : 'Send Reply'}
          </button>
        </div>
      </div>
    </section>
  )
}

export default ChatRoomsPage
