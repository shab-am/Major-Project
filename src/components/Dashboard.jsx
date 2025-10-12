import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import PageHeader from '../components/PageHeader';


const Dashboard = ({ theme, isDarkMode, plantData, onViewAllPlants, onToggleTheme }) => {
  // Mock data for charts
  const weeklyData = [
    { day: 'Mon', visitors: 85, revenue: 280, tasks: 8 },
    { day: 'Tue', visitors: 92, revenue: 310, tasks: 12 },
    { day: 'Wed', visitors: 112, revenue: 320, tasks: 15 },
    { day: 'Thu', visitors: 98, revenue: 290, tasks: 10 },
    { day: 'Fri', visitors: 105, revenue: 350, tasks: 18 },
    { day: 'Sat', visitors: 88, revenue: 240, tasks: 6 },
    { day: 'Sun', visitors: 75, revenue: 200, tasks: 4 }
  ];

  const plantHealthData = [
    { name: 'Healthy', value: 65, color: '#d3ff5c' },
    { name: 'Moderate', value: 25, color: '#ffa500' },
    { name: 'Stressed', value: 10, color: '#ff6b6b' }
  ];

  const recentPlants = [
    { name: 'Bok Choy', status: 'Healthy', ph: 6.2, temp: 22, avatar: '🥬' },
    { name: 'Chili Plant', status: 'Moderate', ph: 6.8, temp: 25, avatar: '🌶️' },
    { name: 'Purple Basil', status: 'Healthy', ph: 5.8, temp: 20, avatar: '🌿' },
    { name: 'Thai Basil', status: 'Stressed', ph: 7.1, temp: 28, avatar: '🌱' }
  ];

  const cardStyle = {
    background: theme.card,
    borderRadius: '16px',
    padding: '24px',
    border: `1px solid ${theme.border}`,
    boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
  };

  const metricCardStyle = {
    ...cardStyle,
    textAlign: 'center',
    position: 'relative',
  };

  const chartCardStyle = {
    ...cardStyle,
    minHeight: '300px',
  };

  const StatCard = ({ title, value, change, icon, color = theme.accent }) => (
    <div style={metricCardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ color: theme.textMuted, fontSize: '14px', fontWeight: '500', margin: 0 }}>{title}</h3>
        <div style={{ color: color, fontSize: '20px' }}>{icon}</div>
      </div>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color: theme.text, marginBottom: '8px' }}>{value}</div>
      <div style={{ color: change > 0 ? '#d3ff5c' : '#ff6b6b', fontSize: '14px', fontWeight: '500' }}>
        {change > 0 ? '+' : ''}{change}%
      </div>
    </div>
  );

  const ProgressBar = ({ label, percentage, color = theme.accent }) => (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ color: theme.text, fontSize: '14px' }}>{label}</span>
        <span style={{ color: theme.textMuted, fontSize: '14px' }}>{percentage}%</span>
      </div>
      <div style={{
        background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        height: '8px',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          background: color,
          height: '100%',
          width: `${percentage}%`,
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );

  return (
    <div style={{ marginBottom: '40px' }}>
      <PageHeader
        title="Dashboard"
        subtitle="Plant monitoring overview and analytics"
        theme={theme}
        isDarkMode={isDarkMode}
        onToggleTheme={onToggleTheme}
      />

      {/* Dashboard Grid */}
      <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(12, 1fr)', marginTop: '24px' }}>
          {/* Row 1: Key Metrics */}
          <div style={{ gridColumn: 'span 3' }}>
            <StatCard
              title="Total Plants"
              value="24"
              change={12.5}
              icon="🌱"
              color="#d3ff5c"
            />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <StatCard
              title="Active Monitoring"
              value="18"
              change={8.2}
              icon="📊"
              color="#4fc3f7"
            />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <StatCard
              title="Healthy Plants"
              value="15"
              change={-2.1}
              icon="✅"
              color="#66bb6a"
            />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <StatCard
              title="Avg. Growth Rate"
              value="72%"
              change={5.3}
              icon="📈"
              color="#ffa726"
            />
          </div>

          {/* Row 2: Charts */}
          <div style={{ gridColumn: 'span 6' }}>
            <div style={chartCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: theme.text, fontSize: '18px', fontWeight: '600', margin: 0 }}>Plant Health Trends</h3>
                <button style={{
                  background: 'transparent',
                  border: `1px solid ${theme.border}`,
                  color: theme.textMuted,
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}>Weekly</button>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                  <XAxis dataKey="day" stroke={theme.textMuted} fontSize={12} />
                  <YAxis stroke={theme.textMuted} fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: theme.surface,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '8px',
                      color: theme.text
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stroke="#d3ff5c"
                    fill="rgba(211, 255, 92, 0.2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ gridColumn: 'span 3' }}>
            <div style={chartCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: theme.text, fontSize: '18px', fontWeight: '600', margin: 0 }}>Growth Rate</h3>
                <button style={{
                  background: 'transparent',
                  border: `1px solid ${theme.border}`,
                  color: theme.textMuted,
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}>Weekly</button>
              </div>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: theme.text, marginBottom: '8px' }}>72%</div>
                <div style={{ color: theme.textMuted, fontSize: '14px' }}>Average Growth</div>
              </div>
              <div style={{ position: 'relative', height: '60px' }}>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: `conic-gradient(#d3ff5c 0deg ${72 * 3.6}deg, ${theme.border} ${72 * 3.6}deg 360deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: theme.card,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: theme.text
                  }}>72%</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ gridColumn: 'span 3' }}>
            <div style={chartCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: theme.text, fontSize: '18px', fontWeight: '600', margin: 0 }}>Plant Status</h3>
                <button style={{
                  background: 'transparent',
                  border: `1px solid ${theme.border}`,
                  color: theme.textMuted,
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}>Weekly</button>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={plantHealthData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {plantHealthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: theme.surface,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '8px',
                      color: theme.text
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
                {plantHealthData.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                    <span style={{ color: theme.textMuted, fontSize: '12px' }}>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Progress and Recent Plants */}
          <div style={{ gridColumn: 'span 6' }}>
            <div style={chartCardStyle}>
              <h3 style={{ color: theme.text, fontSize: '18px', fontWeight: '600', margin: '0 0 20px 0' }}>Environmental Conditions</h3>
              <ProgressBar label="pH Level" percentage={85} color="#d3ff5c" />
              <ProgressBar label="Temperature" percentage={72} color="#4fc3f7" />
              <ProgressBar label="Humidity" percentage={68} color="#66bb6a" />
              <ProgressBar label="TDS Level" percentage={78} color="#ffa726" />
            </div>
          </div>

          <div style={{ gridColumn: 'span 6' }}>
            <div style={chartCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: theme.text, fontSize: '18px', fontWeight: '600', margin: 0 }}>Recent Plant Entries</h3>
                <button
                  onClick={onViewAllPlants}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${theme.border}`,
                    color: theme.textMuted,
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${theme.accent}20`;
                    e.currentTarget.style.color = theme.text;
                    e.currentTarget.style.borderColor = theme.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = theme.textMuted;
                    e.currentTarget.style.borderColor = theme.border;
                  }}
                >View All</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentPlants.map((plant, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                    borderRadius: '8px',
                    border: `1px solid ${theme.border}`
                  }}>
                    <div style={{ fontSize: '24px' }}>{plant.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: theme.text, fontWeight: '500', fontSize: '14px' }}>{plant.name}</div>
                      <div style={{ color: theme.textMuted, fontSize: '12px' }}>pH: {plant.ph} • Temp: {plant.temp}°C</div>
                    </div>
                    <div style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: plant.status === 'Healthy' ? 'rgba(211, 255, 92, 0.2)' :
                        plant.status === 'Moderate' ? 'rgba(255, 165, 0, 0.2)' : 'rgba(255, 107, 107, 0.2)',
                      color: plant.status === 'Healthy' ? '#d3ff5c' :
                        plant.status === 'Moderate' ? '#ffa500' : '#ff6b6b'
                    }}>
                      {plant.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default Dashboard;