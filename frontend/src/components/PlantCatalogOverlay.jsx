import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import PlantRoster from './PlantRoster';

export default function PlantCatalogOverlay({ open, onClose, plants, theme, isDarkMode }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.55)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '48px 16px',
        overflowY: 'auto'
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="plant-catalog-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 900,
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: 16,
          padding: 20,
          boxShadow: isDarkMode ? '0 24px 48px rgba(0,0,0,0.5)' : '0 16px 40px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 id="plant-catalog-title" style={{ margin: 0, color: theme.text, fontSize: 18 }}>
            Plant details
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              border: `1px solid ${theme.border}`,
              background: theme.surface,
              borderRadius: 8,
              padding: 6,
              cursor: 'pointer',
              color: theme.text
            }}
          >
            <X size={18} />
          </button>
        </div>
        <p style={{ color: theme.textMuted, fontSize: 13, marginTop: 0, marginBottom: 16 }}>
          Tap outside this panel to close. Metrics use live readings mapped to each sensor profile.
        </p>
        <PlantRoster plants={plants} theme={theme} isDarkMode={isDarkMode} compact />
      </div>
    </div>
  );
}
