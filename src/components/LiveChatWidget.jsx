import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { MessageCircle, Send, X } from 'lucide-react'
import { request } from '../lib/api.js'
import { useAppContext } from '../context/AppContext.jsx'

function LiveChatWidget() {
  const { isAuthenticated } = useAppContext()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [roomKey, setRoomKey] = useState('')
  const [messages, setMessages] = useState([
    { id: 1, from: 'bot', text: 'Hi! I am HorizonInvest AI support. How can I help today?' },
  ])

  useEffect(() => {
    const bootstrapChat = async () => {
      if (!isAuthenticated || !isOpen) return
      try {
        const roomRes = await request('/chat/room', { method: 'POST' })
        const key = roomRes?.data?.room_key || roomRes?.data?.roomKey || ''
        if (!key) return
        setRoomKey(key)
        const messageRes = await request(`/chat/${key}/messages`)
        const liveMessages = (messageRes?.data || []).map((item) => ({
          id: item.id,
          from: item.senderRole === 'user' ? 'user' : 'bot',
          text: item.content,
        }))
        setMessages((prev) => (liveMessages.length ? liveMessages : prev))
      } catch (_error) {
        // keep local fallback chat UI when backend chat is unavailable
      }
    }
    bootstrapChat()
  }, [isAuthenticated, isOpen])

  useEffect(() => {
    if (!isOpen || !isAuthenticated || !roomKey) return undefined
    let cancelled = false
    const syncMessages = async () => {
      try {
        const messageRes = await request(`/chat/${roomKey}/messages`)
        const liveMessages = (messageRes?.data || []).map((item) => ({
          id: item.id,
          from: item.senderRole === 'user' ? 'user' : 'bot',
          text: item.content,
        }))
        if (!cancelled) setMessages((prev) => (liveMessages.length ? liveMessages : prev))
      } catch (_error) {
        // keep existing messages when polling fails
      }
    }

    const timer = setInterval(syncMessages, 4000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [isAuthenticated, isOpen, roomKey])

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMessage = { id: Date.now(), from: 'user', text: input.trim() }
    setMessages((prev) => [...prev, userMessage])
    if (isAuthenticated && roomKey) {
      try {
        await request('/chat/message', {
          method: 'POST',
          body: { roomKey, content: input.trim() },
        })
      } catch (_error) {
        // fallback message for connection issues
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 2,
            from: 'bot',
            text: 'Support is temporarily offline. Please try again shortly.',
          },
        ])
      }
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: 'bot',
          text: 'Please log in to start a live support chat.',
        },
      ])
    }
    setInput('')
  }

  return (
    <>
      {!isOpen ? (
        <button className="chat-fab" onClick={() => setIsOpen(true)}>
          <MessageCircle size={22} />
        </button>
      ) : null}
      {isOpen ? (
        <motion.div
          className="chat-panel"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
        >
          <header>
            <div>
              <span className="dot" /> Live Support
            </div>
            <button onClick={() => setIsOpen(false)}>
              <X size={16} />
            </button>
          </header>
          <div className="chat-body">
            {messages.map((message) => (
              <div key={message.id} className={`bubble ${message.from}`}>
                {message.text}
              </div>
            ))}
          </div>
          <footer>
            <input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage()
              }}
            />
            <button onClick={sendMessage}>
              <Send size={16} />
            </button>
          </footer>
        </motion.div>
      ) : null}
    </>
  )
}

export default LiveChatWidget
