import { useEffect, useMemo, useState } from 'react'
import { Download, Smartphone, X } from 'lucide-react'

function AppInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const apkDownloadUrl = import.meta.env.VITE_APK_DOWNLOAD_URL || ''

  const storageKey = 'horizoninvest-install-dismissed-at'
  const canShow = useMemo(() => !isInstalled && isOpen, [isInstalled, isOpen])

  useEffect(() => {
    const dismissedAt = Number(localStorage.getItem(storageKey) || 0)
    const recentlyDismissed = Date.now() - dismissedAt < 12 * 60 * 60 * 1000
    if (!recentlyDismissed) setIsOpen(true)

    const onBeforeInstall = (event) => {
      event.preventDefault()
      setDeferredPrompt(event)
      setIsOpen(true)
    }
    const onInstalled = () => {
      setIsInstalled(true)
      setIsOpen(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)

    const triggerInstall = async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt()
        await deferredPrompt.userChoice
        setDeferredPrompt(null)
        setIsOpen(false)
        return
      }
      if (apkDownloadUrl) {
        window.open(apkDownloadUrl, '_blank', 'noopener,noreferrer')
        return
      }
      setIsOpen(true)
      alert('On your browser menu, choose "Install app" or "Add to Home screen" to install HorizonInvest.')
    }

    // Expose global helper so header button can trigger install/download.
    window.horizoneInstallApp = async () => {
      await triggerInstall()
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
      if (window.horizoneInstallApp) delete window.horizoneInstallApp
    }
  }, [apkDownloadUrl, deferredPrompt])

  const closePrompt = () => {
    localStorage.setItem(storageKey, String(Date.now()))
    setIsOpen(false)
  }

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
      setIsOpen(false)
      return
    }
    if (apkDownloadUrl) {
      window.open(apkDownloadUrl, '_blank', 'noopener,noreferrer')
      return
    }
  }

  if (!canShow) return null

  return (
    <div className="install-prompt-card glass-card">
      <button className="install-close-btn" onClick={closePrompt} aria-label="Close install prompt">
        <X size={14} />
      </button>
      <div className="install-prompt-head">
        <span className="install-prompt-icon">
          <Smartphone size={16} />
        </span>
        <div>
          <strong>Install HorizonInvest App</strong>
          <p className="muted small">Faster access, full-screen experience, and instant updates.</p>
        </div>
      </div>
      <div className="install-prompt-actions">
        <button className="mini-btn" onClick={closePrompt}>
          Not now
        </button>
        <button className="primary-btn" onClick={handleInstall}>
          <Download size={14} /> {deferredPrompt ? 'Install App' : apkDownloadUrl ? 'Download APK' : 'Use browser menu to install'}
        </button>
      </div>
    </div>
  )
}

export default AppInstallPrompt
