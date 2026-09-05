import { useCallback, useEffect, useRef, useState } from 'react'
import { Download, Smartphone, X } from 'lucide-react'
import {
  APP_INSTALL_REQUEST_EVENT,
  downloadApk,
  getApkDownloadUrl,
  getInstallInstructions,
  isAppInstalled,
} from '../lib/appInstall.js'

function AppInstallPrompt() {
  const deferredPromptRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isInstalled, setIsInstalled] = useState(isAppInstalled)
  const [canNativeInstall, setCanNativeInstall] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const apkDownloadUrl = getApkDownloadUrl()
  const instructions = getInstallInstructions()

  const storageKey = 'horizoninvest-install-dismissed-at'

  const runInstall = useCallback(async () => {
    const prompt = deferredPromptRef.current
    if (prompt) {
      try {
        await prompt.prompt()
        const choice = await prompt.userChoice
        if (choice.outcome === 'accepted') {
          deferredPromptRef.current = null
          setCanNativeInstall(false)
          setIsInstalled(true)
        }
        setIsOpen(false)
        return
      } catch {
        deferredPromptRef.current = null
        setCanNativeInstall(false)
      }
    }

    downloadApk(apkDownloadUrl)
    setShowInstructions(true)
    setIsOpen(true)
  }, [apkDownloadUrl])

  useEffect(() => {
    const dismissedAt = Number(localStorage.getItem(storageKey) || 0)
    const recentlyDismissed = Date.now() - dismissedAt < 12 * 60 * 60 * 1000
    if (!recentlyDismissed && !isAppInstalled()) setIsOpen(true)

    const onBeforeInstall = (event) => {
      event.preventDefault()
      deferredPromptRef.current = event
      setCanNativeInstall(true)
      setIsOpen(true)
    }

    const onInstalled = () => {
      setIsInstalled(true)
      setIsOpen(false)
      setShowInstructions(false)
      deferredPromptRef.current = null
      setCanNativeInstall(false)
    }

    const onInstallRequest = () => {
      runInstall()
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    window.addEventListener(APP_INSTALL_REQUEST_EVENT, onInstallRequest)
    window.horizoneInstallApp = runInstall

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
      window.removeEventListener(APP_INSTALL_REQUEST_EVENT, onInstallRequest)
      if (window.horizoneInstallApp === runInstall) delete window.horizoneInstallApp
    }
  }, [runInstall])

  const closePrompt = () => {
    localStorage.setItem(storageKey, String(Date.now()))
    setIsOpen(false)
    setShowInstructions(false)
  }

  if (isInstalled || !isOpen) return null

  const actionLabel = canNativeInstall ? 'Install App' : 'Download App'

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
          <strong>{showInstructions ? instructions.title : 'Install HorizonInvest App'}</strong>
          <p className="muted small">
            {showInstructions
              ? 'Follow these steps if install did not start automatically.'
              : 'Faster access, full-screen experience, and instant updates.'}
          </p>
        </div>
      </div>
      {showInstructions ? (
        <ol className="install-instructions-list">
          {instructions.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : null}
      <div className="install-prompt-actions">
        <button className="mini-btn" type="button" onClick={closePrompt}>
          Not now
        </button>
        <button className="primary-btn" type="button" onClick={runInstall}>
          <Download size={14} /> {actionLabel}
        </button>
      </div>
    </div>
  )
}

export default AppInstallPrompt
