import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const BioSignalsPage = ({ styles, theme, isDarkMode }) => {
  const [data, setData] = useState([]);
  const bufferRef = useRef([]);
  useEffect(() => {
    let t = Date.now();
    const id = setInterval(() => {
      t += 200;
      const next = { t: new Date(t).toLocaleTimeString(), value: Math.sin(t / 800) + (Math.random() - 0.5) * 0.2 };
      bufferRef.current.push(next);
      if (bufferRef.current.length > 180) bufferRef.current.shift();
    }, 200);
    let raf;
    const tick = () => {
      setData(bufferRef.current.slice());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { clearInterval(id); cancelAnimationFrame(raf); };
  }, []);

  const chart = (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'} />
        <XAxis dataKey="t" stroke={isDarkMode ? '#94a3b8' : '#555'} hide={false} />
        <YAxis stroke={isDarkMode ? '#94a3b8' : '#555'} />
        <Tooltip contentStyle={{ backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : '#fff', border: 'none', borderRadius: 8, color: theme.text }} />
        <Line type="monotone" dataKey="value" stroke={isDarkMode ? '#8ab4f8' : '#1a73e8'} dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <h1 style={{ ...styles.pageTitle, textAlign: 'center' }}>Bio-Signals (Live)</h1>
        </div>
        <div style={{ color: theme.textMuted, textAlign: 'center', marginBottom: 16 }}>Live mock stream shown below. Replace with WebSocket/SSE.</div>
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
          <div style={{ background: isDarkMode ? 'rgba(255,255,255,0.04)' : '#fafafa', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: theme.text, marginBottom: 16 }}>Channel 1</h2>
            {chart}
          </div>
          <div style={{ background: isDarkMode ? 'rgba(255,255,255,0.04)' : '#fafafa', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: theme.text, marginBottom: 16 }}>Channel 2</h2>
            {chart}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BioSignalsPage;


