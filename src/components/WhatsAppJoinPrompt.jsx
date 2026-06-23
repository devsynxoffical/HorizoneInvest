import { useEffect, useMemo, useState } from 'react'
import { FaWhatsapp } from 'react-icons/fa6'
import { X } from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'
import { getSupportedSocialLinks } from '../lib/socialPlatforms.js'

const brandLogo = `${import.meta.env.BASE_URL}logo.png`

function WhatsAppJoinPrompt() {
  const { isBootstrapping, socialLinks } = useAppContext()
  const [isOpen, setIsOpen] = useState(false)

  const whatsappLink = useMemo(() => {
    const links = getSupportedSocialLinks(socialLinks)
    return links.find((item) => item.platform === 'whatsapp') || null
  }, [socialLinks])

  useEffect(() => {
    if (isBootstrapping || !whatsappLink?.url) return
    setIsOpen(true)
  }, [isBootstrapping, whatsappLink?.url])

  useEffect(() => {
    if (!isOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  const closePrompt = () => setIsOpen(false)

  if (!isOpen || !whatsappLink?.url) return null

  return (
    <div className="whatsapp-prompt-overlay" role="dialog" aria-modal="true" aria-labelledby="whatsapp-prompt-title">
      <div className="whatsapp-prompt-card">
        <button type="button" className="whatsapp-prompt-close" onClick={closePrompt} aria-label="Close">
          <X size={18} strokeWidth={2} />
        </button>

        <div className="whatsapp-prompt-logo-wrap">
          <img className="whatsapp-prompt-logo" src={brandLogo} alt="" />
        </div>

        <h2 id="whatsapp-prompt-title" className="whatsapp-prompt-title">
          Welcome to HorizonInvest
        </h2>
        <p className="whatsapp-prompt-subtitle">
          Join our community to get instant withdrawal updates, support, and daily signals.
        </p>

        <a
          className="whatsapp-prompt-cta"
          href={whatsappLink.url}
          target="_blank"
          rel="noreferrer"
          onClick={closePrompt}
        >
          <FaWhatsapp size={20} aria-hidden />
          Join WhatsApp
        </a>
      </div>
    </div>
  )
}

export default WhatsAppJoinPrompt
