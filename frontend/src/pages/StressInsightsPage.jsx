import React, { useState, useMemo } from 'react';
import { AlertTriangle, Filter, CheckCircle, Bell } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const StressInsightsPage = ({
  theme,
  isDarkMode,
  plants = [],
  onToggleTheme,
  notifications,
  isNotificationsOpen,
  onOpenNotifications,
  onOpenStressInsights
}) => {
  const [completedRecommendations, setCompletedRecommendations] = useState([]);
  const [filterPlant, setFilterPlant] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [animatingCard, setAnimatingCard] = useState(null);

  const analyzeStress = (plant) => {
    const recommendations = [];
    const ranges = plant.optimal_ranges || {};
    const metrics = plant.metrics || {};

    Object.entries(ranges).forEach(([parameter, range]) => {
      const value = Number(metrics[parameter]);
      if (Number.isNaN(value)) return;
      if (value < range.min || value > range.max) {
        recommendations.push({
          id: `${plant.plant_code}-${parameter}-${value < range.min ? 'low' : 'high'}`,
          plantId: plant.plant_code,
          plantName: plant.display_name,
          parameter: parameter.replace(/_/g, ' '),
          action: value < range.min ? `Increase ${parameter.replace(/_/g, ' ')}` : `Decrease ${parameter.replace(/_/g, ' ')}`,
          steps: [
            `Target range: ${range.label}`,
            'Adjust gradually and verify the next live reading',
            'Monitor the reservoir after circulation'
          ],
          priority: parameter === 'ph' || parameter === 'tds' ? 'High' : 'Medium',
          currentValue: value.toFixed(parameter === 'humidity' || parameter === 'tds' ? 0 : 2),
          targetValue: range.label
        });
      }
    });

    return recommendations;
  };

  const allRecommendations = useMemo(() => plants.flatMap(analyzeStress), [plants]);

  const filteredRecommendations = useMemo(() => {
    return allRecommendations.filter(rec => {
      const plantMatch = filterPlant === 'all' || rec.plantName === filterPlant;
      const priorityMatch = filterPriority === 'all' || rec.priority.toLowerCase() === filterPriority.toLowerCase();
      return plantMatch && priorityMatch && !completedRecommendations.includes(rec.id);
    });
  }, [allRecommendations, filterPlant, filterPriority, completedRecommendations]);

  const completedRecs = useMemo(() => {
    return allRecommendations.filter(rec => completedRecommendations.includes(rec.id));
  }, [allRecommendations, completedRecommendations]);

  const markAsCompleted = (recId) => {
    setAnimatingCard(recId);
    setTimeout(() => {
      setCompletedRecommendations(prev => [...prev, recId]);
      setAnimatingCard(null);
    }, 600);
  };

  const getPriorityColor = (priority) => {
    return priority === 'High' ? '#ff6b6b' : '#ffa500';
  };

  const getPriorityBg = (priority) => {
    return priority === 'High' ? 'rgba(255, 107, 107, 0.2)' : 'rgba(255, 165, 0, 0.2)';
  };

  const plantNames = useMemo(() => ['all', ...new Set(plants.map((p) => p.display_name))], [plants]);

  return (
    <div style={{ marginBottom: '40px' }}>
      <PageHeader 
        title="Stress Insights & Alerts" 
        subtitle="Individual plant stress analysis and recommendations"
        theme={theme} 
        isDarkMode={isDarkMode} 
        onToggleTheme={onToggleTheme}
        notifications={notifications}
        isNotificationsOpen={isNotificationsOpen}
        onOpenNotifications={onOpenNotifications}
        onOpenStressInsights={onOpenStressInsights}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: theme.textMuted, marginBottom: '18px', fontSize: '13px' }}>
        <Bell size={16} color={theme.accent} />
        Notification center for live alert recommendations and completed actions.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: `linear-gradient(135deg, ${theme.card} 0%, ${theme.surface} 100%)`, padding: '20px', borderRadius: '12px', border: `1px solid ${theme.border}`, textAlign: 'center', boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '8px' }}>Total Plants</div>
          <div style={{ color: theme.text, fontSize: '28px', fontWeight: 'bold' }}>{plants.length}</div>
        </div>
        <div style={{ background: `linear-gradient(135deg, ${theme.card} 0%, ${theme.surface} 100%)`, padding: '20px', borderRadius: '12px', border: `1px solid ${theme.border}`, textAlign: 'center', boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '8px' }}>Stressed Plants</div>
          <div style={{ color: '#ff6b6b', fontSize: '28px', fontWeight: 'bold' }}>{new Set(allRecommendations.map((r) => r.plantName)).size}</div>
        </div>
        <div style={{ background: `linear-gradient(135deg, ${theme.card} 0%, ${theme.surface} 100%)`, padding: '20px', borderRadius: '12px', border: `1px solid ${theme.border}`, textAlign: 'center', boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '8px' }}>Active Alerts</div>
          <div style={{ color: '#ff6b6b', fontSize: '28px', fontWeight: 'bold' }}>{filteredRecommendations.length}</div>
        </div>
        <div style={{ background: `linear-gradient(135deg, ${theme.card} 0%, ${theme.surface} 100%)`, padding: '20px', borderRadius: '12px', border: `1px solid ${theme.border}`, textAlign: 'center', boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '8px' }}>Completed</div>
          <div style={{ color: '#4ade80', fontSize: '28px', fontWeight: 'bold' }}>{completedRecs.length}</div>
        </div>
      </div>

      <div style={{ background: theme.card, borderRadius: '16px', padding: '20px', border: `1px solid ${theme.border}`, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} color={theme.accent} />
          <span style={{ color: theme.text, fontSize: '14px', fontWeight: '600' }}>Filters:</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ color: theme.textMuted, fontSize: '13px' }}>Plant:</label>
          <select value={filterPlant} onChange={(e) => setFilterPlant(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.surface, color: theme.text, fontSize: '13px', cursor: 'pointer' }}>
            {plantNames.map(name => (
              <option key={name} value={name}>{name === 'all' ? 'All Plants' : name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ color: theme.textMuted, fontSize: '13px' }}>Priority:</label>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.surface, color: theme.text, fontSize: '13px', cursor: 'pointer' }}>
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(600px, 1fr) minmax(400px, 1fr)', gap: '24px', alignItems: 'start' }}>
        <div style={{ minWidth: '600px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <AlertTriangle size={24} color="#ff6b6b" />
            <h2 style={{ color: theme.text, fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Active Alerts - Action Required</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: 'calc(100vh - 400px)', overflowY: 'auto', paddingRight: '8px', width: '100%' }}>
            {filteredRecommendations.length > 0 ? (
              filteredRecommendations.map((rec) => {
                const priorityColor = getPriorityColor(rec.priority);
                const priorityBg = getPriorityBg(rec.priority);
                const isAnimating = animatingCard === rec.id;
                
                return (
                  <div
                    key={rec.id}
                    style={{
                      background: `linear-gradient(135deg, ${theme.card} 0%, ${theme.surface} 100%)`,
                      borderRadius: '16px',
                      padding: '26px',
                      border: `2px solid ${priorityColor}60`,
                      boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'visible',
                      opacity: isAnimating ? 0 : 1,
                      transform: isAnimating ? 'translateX(-100px) scale(0.8)' : 'translateX(0) scale(1)',
                      pointerEvents: isAnimating ? 'none' : 'auto',
                      minWidth: '580px',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                    onMouseEnter={(e) => {
                      if (!isAnimating) {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = isDarkMode ? '0 8px 25px rgba(0, 0, 0, 0.4)' : '0 8px 25px rgba(0, 0, 0, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isAnimating) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)';
                      }
                    }}
                  >
                    <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.1 }}>
                      <AlertTriangle size={80} color={priorityColor} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ color: theme.text, fontSize: '20px', fontWeight: 'bold', margin: 0, marginBottom: '8px' }}>
                          {rec.plantName} - {rec.parameter}
                        </h3>
                        <div style={{ display: 'inline-block', padding: '6px 12px', borderRadius: '12px', background: priorityBg, border: `1px solid ${priorityColor}40` }}>
                          <span style={{ color: priorityColor, fontSize: '12px', fontWeight: '600' }}>
                            {rec.priority} Priority - Action Required Now
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: theme.surface, padding: '12px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginBottom: '12px' }}>
                      <p style={{ color: theme.text, fontSize: '16px', margin: '0 0 12px 0', fontWeight: '500' }}>{rec.action}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '6px' }}>
                        <span style={{ color: theme.textMuted }}>Current: <strong style={{ color: theme.text }}>{rec.currentValue}</strong></span>
                        <span style={{ color: theme.textMuted }}>Target: <strong style={{ color: '#d3ff5c' }}>{rec.targetValue}</strong></span>
                      </div>
                    </div>

                    <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px', color: theme.textMuted, fontSize: '13px' }}>
                      {rec.steps.map((step, stepIdx) => (
                        <li key={stepIdx} style={{ marginBottom: '4px' }}>{step}</li>
                      ))}
                    </ul>

                    <button
                      onClick={() => markAsCompleted(rec.id)}
                      disabled={isAnimating}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: '#4ade80', opacity: 0.75, color: 'white', fontSize: '14px', fontWeight: '600', cursor: isAnimating ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease' }}
                      onMouseEnter={(e) => {
                        if (!isAnimating) {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(74, 222, 128, 0.3)';
                          e.target.style.opacity = '1';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isAnimating) {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                          e.target.style.opacity = '0.75';
                        }
                      }}
                    >
                      ✓ Mark as Completed
                    </button>
                  </div>
                );
              })
            ) : (
              <div style={{ background: theme.card, padding: '32px', borderRadius: '16px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                <h3 style={{ color: theme.text, fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>No Active Alerts</h3>
                <p style={{ color: theme.textMuted, fontSize: '14px' }}>All recommendations have been completed or no alerts match the current filters.</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ minWidth: '400px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <CheckCircle size={24} color="#4ade80" />
            <h2 style={{ color: theme.text, fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Completed Recommendations</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: 'calc(100vh - 400px)', overflowY: 'auto', paddingRight: '8px', width: '100%' }}>
            {completedRecs.length > 0 ? (
              completedRecs.map((rec, index) => {
                const priorityColor = getPriorityColor(rec.priority);
                return (
                  <div
                    key={rec.id}
                    style={{
                      background: theme.surface,
                      borderRadius: '12px',
                      padding: '24px',
                      border: `1px solid ${theme.border}`,
                      opacity: 0.85,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.3s ease',
                      animation: `slideInRight 0.5s ease ${index * 0.1}s both`,
                      minWidth: '380px',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'translateX(4px)';
                      e.currentTarget.style.borderColor = '#4ade80';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.85';
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.borderColor = theme.border;
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h3 style={{ color: theme.text, fontSize: '18px', fontWeight: '600', margin: 0, marginBottom: '6px' }}>
                        {rec.plantName} - {rec.parameter}
                      </h3>
                      <p style={{ color: theme.textMuted, fontSize: '14px', margin: 0, marginBottom: '6px' }}>{rec.action}</p>
                      <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '8px', background: `${priorityColor}20`, border: `1px solid ${priorityColor}40`, marginTop: '4px' }}>
                        <span style={{ color: priorityColor, fontSize: '12px', fontWeight: '500' }}>{rec.priority} Priority</span>
                      </div>
                    </div>
                    <CheckCircle size={28} color="#4ade80" style={{ flexShrink: 0, marginLeft: '16px' }} />
                  </div>
                );
              })
            ) : (
              <div style={{ background: theme.card, padding: '32px', borderRadius: '16px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
                <p style={{ color: theme.textMuted, fontSize: '14px' }}>No completed recommendations yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 0.85;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default StressInsightsPage;
