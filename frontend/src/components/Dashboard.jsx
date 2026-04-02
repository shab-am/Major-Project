import React, { useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { Leaf, Activity, TrendingUp, AlertTriangle, CheckCircle, Droplets, Thermometer, Sun } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { dummyPlants, weeklyTrendData } from '../data/dummyPlants';

const Dashboard = ({ theme, isDarkMode, onViewAllPlants, onToggleTheme }) => {
  // Use dummy plants data
  const plants = dummyPlants;

  // Calculate stats from dummy plants
  const stats = useMemo(() => {
    const total = plants.length;
    const healthy = plants.filter(p => p.healthStatus === 'Healthy').length;
    const moderate = plants.filter(p => p.healthStatus === 'Moderate Stress').length;
    const stressed = plants.filter(p => p.healthStatus === 'High Stress').length;
    
    // Calculate average values
    const avgPH = (plants.reduce((sum, p) => sum + p.ph, 0) / total).toFixed(2);
    const avgTemp = (plants.reduce((sum, p) => sum + p.temperature, 0) / total).toFixed(1);
    const avgHumidity = (plants.reduce((sum, p) => sum + p.humidity, 0) / total).toFixed(1);
    
    return {
      totalPlants: total,
      activeMonitoring: total,
      healthyPlants: healthy,
      avgGrowthRate: Math.round((healthy / total) * 100),
      moderateStress: moderate,
      highStress: stressed,
      avgPH,
      avgTemp,
      avgHumidity
    };
  }, []);

  // Plant health distribution for pie chart
  const plantHealthData = useMemo(() => {
    const healthy = plants.filter(p => p.healthStatus === 'Healthy').length;
    const moderate = plants.filter(p => p.healthStatus === 'Moderate Stress').length;
    const stressed = plants.filter(p => p.healthStatus === 'High Stress').length;
    
    return [
      { name: 'Healthy', value: healthy, color: '#d3ff5c' },
      { name: 'Moderate Stress', value: moderate, color: '#ffa500' },
      { name: 'High Stress', value: stressed, color: '#ff6b6b' }
    ].filter(item => item.value > 0);
  }, []);

  // Recent plants (all 5 plants)
  const recentPlants = useMemo(() => {
    return plants.map(plant => {
      const getStressColor = (status) => {
        if (status === 'Healthy') return '#d3ff5c';
        if (status === 'Moderate Stress') return '#ffa500';
        return '#ff6b6b';
      };

      return {
        name: plant.name,
        status: plant.healthStatus,
        ph: plant.ph.toFixed(1),
        temp: plant.temperature.toFixed(1),
        avatar: '🌱',
        stressLevel: plant.stressLevel,
        stressColor: getStressColor(plant.healthStatus)
      };
    });
  }, []);

  return (
    <div style={{ marginBottom: '40px' }}>
      <PageHeader 
        title="Dashboard" 
        subtitle="Plant monitoring overview"
        theme={theme} 
        isDarkMode={isDarkMode} 
        onToggleTheme={onToggleTheme}
      />

      {/* Stats Cards with Icons */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '32px' 
      }}>
        <div style={{ 
          background: `linear-gradient(135deg, ${theme.card} 0%, ${theme.surface} 100%)`,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.1 }}>
            <Leaf size={60} color={theme.accent} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ 
              padding: '10px', 
              borderRadius: '12px', 
              background: `${theme.accent}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Leaf size={20} color={theme.accent} />
            </div>
            <div style={{ color: theme.textMuted, fontSize: '14px' }}>Total Plants</div>
          </div>
          <div style={{ color: theme.text, fontSize: '32px', fontWeight: 'bold' }}>{stats.totalPlants}</div>
        </div>

        <div style={{ 
          background: `linear-gradient(135deg, ${theme.card} 0%, ${theme.surface} 100%)`,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.1 }}>
            <Activity size={60} color="#4ade80" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ 
              padding: '10px', 
              borderRadius: '12px', 
              background: '#4ade8020',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Activity size={20} color="#4ade80" />
            </div>
            <div style={{ color: theme.textMuted, fontSize: '14px' }}>Active Monitoring</div>
          </div>
          <div style={{ color: theme.text, fontSize: '32px', fontWeight: 'bold' }}>{stats.activeMonitoring}</div>
        </div>

        <div style={{ 
          background: `linear-gradient(135deg, ${theme.card} 0%, ${theme.surface} 100%)`,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.1 }}>
            <CheckCircle size={60} color="#d3ff5c" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ 
              padding: '10px', 
              borderRadius: '12px', 
              background: '#d3ff5c20',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={20} color="#d3ff5c" />
            </div>
            <div style={{ color: theme.textMuted, fontSize: '14px' }}>Healthy Plants</div>
          </div>
          <div style={{ color: '#d3ff5c', fontSize: '32px', fontWeight: 'bold' }}>{stats.healthyPlants}</div>
        </div>

        <div style={{ 
          background: `linear-gradient(135deg, ${theme.card} 0%, ${theme.surface} 100%)`,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.1 }}>
            <TrendingUp size={60} color={theme.accent} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ 
              padding: '10px', 
              borderRadius: '12px', 
              background: `${theme.accent}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={20} color={theme.accent} />
            </div>
            <div style={{ color: theme.textMuted, fontSize: '14px' }}>Health Rate</div>
          </div>
          <div style={{ color: theme.accent, fontSize: '32px', fontWeight: 'bold' }}>{stats.avgGrowthRate}%</div>
        </div>
      </div>

      {/* Additional Insights Row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '32px' 
      }}>
        <div style={{ 
          background: theme.card,
          borderRadius: '16px',
          padding: '20px',
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ 
            padding: '12px', 
            borderRadius: '12px', 
            background: '#ff6b6b20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={24} color="#ff6b6b" />
          </div>
          <div>
            <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>High Stress</div>
            <div style={{ color: '#ff6b6b', fontSize: '24px', fontWeight: 'bold' }}>{stats.highStress}</div>
          </div>
        </div>

        <div style={{ 
          background: theme.card,
          borderRadius: '16px',
          padding: '20px',
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ 
            padding: '12px', 
            borderRadius: '12px', 
            background: '#ffa50020',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={24} color="#ffa500" />
          </div>
          <div>
            <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Moderate Stress</div>
            <div style={{ color: '#ffa500', fontSize: '24px', fontWeight: 'bold' }}>{stats.moderateStress}</div>
          </div>
        </div>

        <div style={{ 
          background: theme.card,
          borderRadius: '16px',
          padding: '20px',
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ 
            padding: '12px', 
            borderRadius: '12px', 
            background: `${theme.accent}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Droplets size={24} color={theme.accent} />
          </div>
          <div>
            <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Avg pH</div>
            <div style={{ color: theme.text, fontSize: '24px', fontWeight: 'bold' }}>{stats.avgPH}</div>
          </div>
        </div>

        <div style={{ 
          background: theme.card,
          borderRadius: '16px',
          padding: '20px',
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ 
            padding: '12px', 
            borderRadius: '12px', 
            background: '#ff6b6b20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Thermometer size={24} color="#ff6b6b" />
          </div>
          <div>
            <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Avg Temperature</div>
            <div style={{ color: theme.text, fontSize: '24px', fontWeight: 'bold' }}>{stats.avgTemp}°C</div>
          </div>
        </div>

        <div style={{ 
          background: theme.card,
          borderRadius: '16px',
          padding: '20px',
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ 
            padding: '12px', 
            borderRadius: '12px', 
            background: `${theme.accent}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sun size={24} color={theme.accent} />
          </div>
          <div>
            <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Avg Humidity</div>
            <div style={{ color: theme.text, fontSize: '24px', fontWeight: 'bold' }}>{stats.avgHumidity}%</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '24px', 
        marginBottom: '32px' 
      }}>
        {/* Weekly Trends */}
        <div style={{ 
          background: theme.card,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <TrendingUp size={20} color={theme.accent} />
            <h3 style={{ color: theme.text, fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
              Weekly Trends
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={weeklyTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
              <XAxis dataKey="day" stroke={theme.textMuted} />
              <YAxis stroke={theme.textMuted} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme.card, 
                  border: `1px solid ${theme.border}`, 
                  borderRadius: '8px',
                  color: theme.text
                }} 
              />
              <Area type="monotone" dataKey="health" stroke="#d3ff5c" fill="#d3ff5c" fillOpacity={0.3} />
              <Area type="monotone" dataKey="temp" stroke={theme.accent} fill={theme.accent} fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Plant Status Pie Chart */}
        <div style={{ 
          background: theme.card,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Activity size={20} color={theme.accent} />
            <h3 style={{ color: theme.text, fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
              Plant Status Distribution
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={plantHealthData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {plantHealthData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme.card, 
                  border: `1px solid ${theme.border}`, 
                  borderRadius: '8px',
                  color: theme.text
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Plant Entries */}
      <div style={{ 
        background: theme.card,
        borderRadius: '16px',
        padding: '24px',
        border: `1px solid ${theme.border}`,
        boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Leaf size={20} color={theme.accent} />
            <h3 style={{ color: theme.text, fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
              Recent Plant Entries
            </h3>
          </div>
          <button
            onClick={onViewAllPlants}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`,
              background: 'transparent',
              color: theme.text,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = theme.surface;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            View All
          </button>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {recentPlants.map((plant, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: theme.surface,
                borderRadius: '12px',
                border: `1px solid ${theme.border}`,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(4px)';
                e.currentTarget.style.borderColor = plant.stressColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.borderColor = theme.border;
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>{plant.avatar}</div>
                <div>
                  <div style={{ color: theme.text, fontWeight: '600', marginBottom: '4px' }}>
                    {plant.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: plant.stressColor
                    }} />
                    <span style={{ color: theme.textMuted, fontSize: '12px' }}>
                      {plant.stressLevel} Stress
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: theme.textMuted, fontSize: '12px' }}>pH</div>
                  <div style={{ color: theme.text, fontWeight: '600' }}>{plant.ph}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: theme.textMuted, fontSize: '12px' }}>Temp</div>
                  <div style={{ color: theme.text, fontWeight: '600' }}>{plant.temp}°C</div>
                </div>
                <div style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: `${plant.stressColor}20`,
                  border: `1px solid ${plant.stressColor}40`
                }}>
                  <span style={{ color: plant.stressColor, fontSize: '12px', fontWeight: '600' }}>
                    {plant.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
