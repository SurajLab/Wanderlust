import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    const msg = typeof message === 'string' ? message : (message == null ? '' : JSON.stringify(message))
    setToasts(prev => [...(prev || []), { id, message: msg, type }])
    setTimeout(() => {
      setToasts(prev => (prev || []).filter(t => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => (prev || []).filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center justify-between px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium animate-fade-in
              ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
          >
            <span>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="ml-4 opacity-80 hover:opacity-100 text-lg leading-none">&times;</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
