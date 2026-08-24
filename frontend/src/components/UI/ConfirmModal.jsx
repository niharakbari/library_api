import React from 'react';
import { Loader2 } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  isProcessing = false,
  confirmVariant = "primary"
}) {
  if (!isOpen) return null;

  const confirmStyle = confirmVariant === 'danger' 
    ? { backgroundColor: 'var(--error)', color: 'white', borderColor: 'var(--error)' }
    : {};

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      zIndex: 1000, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px' 
    }}>
      <div className="card" style={{ 
        padding: '32px', 
        width: '100%', 
        maxWidth: '400px', 
        backgroundColor: 'var(--bg)', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', color: 'var(--text-dark)' }}>{title}</h3>
        <p style={{ margin: '0 0 24px 0', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button 
            className="btn-secondary" 
            onClick={onCancel} 
            disabled={isProcessing}
          >
            {cancelText}
          </button>
          <button 
            className="btn-primary" 
            style={confirmStyle}
            onClick={onConfirm} 
            disabled={isProcessing}
          >
            {isProcessing ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}