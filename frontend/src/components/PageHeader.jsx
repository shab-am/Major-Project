import React from 'react';

const PageHeader = ({ title, subtitle, theme }) => (
  <header
    style={{
      marginTop: 12,
      marginBottom: 16,
      paddingBottom: 12,
      borderBottom: `1px solid ${theme.border}`
    }}
  >
    <h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text, margin: 0 }}>{title}</h1>
    {subtitle ? (
      <p style={{ color: theme.textMuted, margin: '6px 0 0', fontSize: 13, lineHeight: 1.45 }}>{subtitle}</p>
    ) : null}
  </header>
);

export default PageHeader;
