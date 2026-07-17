import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import './ConfirmDialog.css'

interface ConfirmOptions {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts)
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
    })
  }, [])

  const handleClose = (result: boolean) => {
    resolveRef.current?.(result)
    resolveRef.current = null
    setOptions(null)
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {options && createPortal(
        <div className="confirm-overlay" onClick={() => handleClose(false)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            {options.title && <h3 className="confirm-title">{options.title}</h3>}
            <p className="confirm-message">{options.message}</p>
            <div className="confirm-actions">
              <button
                className={`btn ${options.danger ? 'btn-danger' : 'btn-primary'}`}
                style={{ width: 'auto', flex: 1 }}
                onClick={() => handleClose(true)}
                autoFocus
              >
                {options.confirmLabel || (options.danger ? 'Delete' : 'Confirm')}
              </button>
              <button
                className="btn btn-secondary"
                style={{ width: 'auto' }}
                onClick={() => handleClose(false)}
              >
                {options.cancelLabel || 'Cancel'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx.confirm
}