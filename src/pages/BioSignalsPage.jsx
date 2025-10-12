import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import PageHeader from '../components/PageHeader';

const BioSignalsPage = ({ styles, theme, isDarkMode, onToggleTheme }) => {
  const [channel1Data, setChannel1Data] = useState([]);
  const [channel2Data, setChannel2Data] = useState([]);
  const buffer1Ref = useRef([]);
  const buffer2Ref = useRef([]);

  useEffect(() => {
    let t = Date.now();
    const id = setInterval(() => {
      t += 200;
      
      // Channel 1: Higher frequency signal with more variation
      const channel1Value = Math.sin(t / 600) + Math.cos(t / 400) * 0.5 + (Math.random() - 0.5) * 0.3;
      const next1 = { t: new Date(t).toLocaleTimeString(), value: channel1Value };
      buffer1Ref.current.push(next1);
      if (buffer1Ref.current.length > 180) buffer1Ref.current.shift();
      
      // Channel 2: Lower frequency signal with different pattern
      const channel2Value = Math.sin(t / 1000) + Math.sin(t / 800) * 0.3 + (Math.random() - 0.5) * 0.2;
      const next2 = { t: new Date(t).toLocaleTimeString(), value: channel2Value };
      buffer2Ref.current.push(next2);
      if (buffer2Ref.current.length > 180) buffer2Ref.current.shift();
    }, 200);
    
    let raf;
    const tick = () => {
      setChannel1Data(buffer1Ref.current.slice());
      setChannel2Data(buffer2Ref.current.slice());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { clearInterval(id); cancelAnimationFrame(raf); };
  }, []);

  const createChart = (data, color, title) => (
    <div style={{ 
      background: theme.card,
      borderRadius: '16px',
      padding: '24px',
      border: `1px solid ${theme.border}`,
      boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = isDarkMode ? '0 8px 25px rgba(0, 0, 0, 0.4)' : '0 4px 15px rgba(0, 0, 0, 0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)';
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        marginBottom: '20px' 
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 8px ${color}60`
        }} />
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 'bold', 
          color: theme.text, 
          margin: 0 
        }}>
          {title}
        </h2>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
          <XAxis 
            dataKey="t" 
            stroke={theme.textMuted} 
            fontSize={12}
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke={theme.textMuted} 
            fontSize={12}
            domain={[-2, 2]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: theme.surface, 
              border: `1px solid ${theme.border}`, 
              borderRadius: 8, 
              color: theme.text,
              boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)'
            }} 
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: color, stroke: color, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
  return (
    <div style={{ marginBottom: '40px' }}>
      <PageHeader 
        title="Bio-Signals" 
        subtitle="Real-time plant electrical signal monitoring"
        theme={theme} 
        isDarkMode={isDarkMode} 
        onToggleTheme={onToggleTheme}
      />
      
      <div style={{ 
        marginBottom: '24px',
        textAlign: 'center',
        padding: '16px',
        background: isDarkMode ? 'rgba(211, 255, 92, 0.05)' : 'rgba(0, 229, 255, 0.05)',
        borderRadius: '12px',
        border: `1px solid ${isDarkMode ? 'rgba(211, 255, 92, 0.2)' : 'rgba(0, 229, 255, 0.2)'}`
      }}>
        <div style={{ 
          color: theme.accent, 
          fontSize: '16px', 
          fontWeight: '500' 
        }}>
          📡 Live bioelectrical signal stream • Mock data for demonstration
        </div>
        <div style={{ 
          color: theme.textMuted, 
          fontSize: '14px', 
          marginTop: '4px' 
        }}>
          Replace with WebSocket/SSE for real hardware integration
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gap: '24px', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        alignItems: 'start'
      }}>
        {createChart(channel1Data, '#d3ff5c', 'Channel 1 - Primary Signal')}
        {createChart(channel2Data, '#4fc3f7', 'Channel 2 - Secondary Signal')}
      </div>

      <div style={{ 
        marginTop: '32px',
        display: 'grid',
        gap: '16px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
      }}>
        <div style={{
          background: theme.card,
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${theme.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
          <div style={{ color: theme.text, fontWeight: '600', marginBottom: '4px' }}>Signal Quality</div>
          <div style={{ color: theme.accent, fontSize: '14px' }}>Excellent</div>
        </div>
        
        <div style={{
          background: theme.card,
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${theme.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
          <div style={{ color: theme.text, fontWeight: '600', marginBottom: '4px' }}>Frequency</div>
          <div style={{ color: theme.accent, fontSize: '14px' }}>5 Hz</div>
        </div>
        
        <div style={{
          background: theme.card,
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${theme.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔗</div>
          <div style={{ color: theme.text, fontWeight: '600', marginBottom: '4px' }}>Connection</div>
          <div style={{ color: '#34d399', fontSize: '14px' }}>Connected</div>
        </div>
        
        <div style={{
          background: theme.card,
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${theme.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📈</div>
          <div style={{ color: theme.text, fontWeight: '600', marginBottom: '4px' }}>Amplitude</div>
          <div style={{ color: theme.accent, fontSize: '14px' }}>±2.0 V</div>
        </div>
      </div>
    </div>
  );
};

export default BioSignalsPage;


