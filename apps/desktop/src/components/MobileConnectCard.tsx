import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import './MobileConnectCard.css'

const STORAGE_KEY = 'pawsense_expo_dev_url'

export function MobileConnectCard() {
  const [url, setUrl] = useState(() => localStorage.getItem(STORAGE_KEY) || '')
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<'expo' | 'api' | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, url)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!url.trim()) {
      setQrDataUrl(null)
      return
    }

    debounceRef.current = setTimeout(() => {
      QRCode.toDataURL(url.trim(), {
        margin: 1,
        width: 176,
        color: { dark: '#1a3a2a', light: '#fdfaf4' },
      })
        .then(setQrDataUrl)
        .catch(() => setQrDataUrl(null))
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [url])

  // Extract the host from whatever was pasted, e.g. "exp://192.168.1.12:8081"
  // → "192.168.1.12", used to suggest the matching EXPO_PUBLIC_API_URL value
  // for apps/mobile/.env so the phone can actually reach the API server.
  const hostMatch = url.trim().match(/^[a-z]+:\/\/([^:/]+)/i)
  const apiHost = hostMatch?.[1]
  const showApiHint = !!apiHost && apiHost !== 'localhost' && apiHost !== '127.0.0.1'
  const suggestedEnvLine = apiHost ? `EXPO_PUBLIC_API_URL=http://${apiHost}:3000/api` : ''

  const handleCopy = async (text: string, field: 'expo' | 'api') => {
    if (!text.trim()) return
    try {
      await navigator.clipboard.writeText(text.trim())
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 1800)
    } catch {
      // Clipboard API unavailable in this context — silently ignore
    }
  }

  return (
    <div className="mc-card">
      <div className="mc-header">
        <div className="mc-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="6" y="2" width="8" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M9 15.5h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <div className="mc-title">Test on Mobile</div>
          <div className="mc-subtitle">Scan with Expo Go to preview PawSense on your phone</div>
        </div>
      </div>

      <div className="mc-body">
        <div className="mc-qr-wrap">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR code linking to the Expo Go dev server" className="mc-qr-img" />
          ) : (
            <div className="mc-qr-placeholder">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="3" y="3" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                <rect x="16" y="3" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                <rect x="3" y="16" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M16 20h4M20 16v4M20 22h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <span>Paste your Expo URL to generate a QR code</span>
            </div>
          )}
        </div>

        <div className="mc-controls">
          <label className="form-label" htmlFor="mc-expo-url">
            Expo dev server URL
          </label>
          <div className="mc-input-row">
            <input
              id="mc-expo-url"
              type="text"
              className="form-input"
              placeholder="exp://192.168.1.12:8081"
              value={url}
              onChange={e => setUrl(e.target.value)}
              spellCheck={false}
              autoComplete="off"
            />
            <button
              type="button"
              className="mc-copy-btn"
              onClick={() => handleCopy(url, 'expo')}
              disabled={!url.trim()}
              aria-label="Copy Expo dev server URL"
              title="Copy link"
            >
              {copiedField === 'expo' ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="5" y="5" width="8" height="8" rx="1.3" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M3.5 9.5H2.8A.8.8 0 012 8.7V2.8c0-.44.36-.8.8-.8h5.9c.44 0 .8.36.8.8v.7" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              )}
            </button>
          </div>
          <p className="mc-hint">
            Run <code>npx expo start</code> inside your mobile app folder, then paste the{' '}
            <code>exp://</code> link it prints here.
          </p>

          {showApiHint && (
            <div className="mc-tip">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
                <path d="M7 6.2v3.3M7 4.5h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <div className="mc-tip-content">
                <span>
                  Mobile reads its API base from <code>EXPO_PUBLIC_API_URL</code> in{' '}
                  <code>apps/mobile/.env</code>. For a physical device, set it to your
                  machine's LAN IP, then restart <code>npx expo start</code>.
                </span>
                <div className="mc-tip-line-row">
                  <code className="mc-tip-line">{suggestedEnvLine}</code>
                  <button
                    type="button"
                    className="mc-tip-copy"
                    onClick={() => handleCopy(suggestedEnvLine, 'api')}
                    aria-label="Copy suggested .env line"
                    title="Copy"
                  >
                    {copiedField === 'api' ? '✓' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}