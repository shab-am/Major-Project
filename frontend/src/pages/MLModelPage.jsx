import React, { useState, useEffect } from 'react';
import { Brain, BarChart3, CheckCircle, AlertTriangle, XCircle, TrendingUp, Activity, Zap, Target } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import usePlantHealthPrediction from '../hooks/usePlantHealthPrediction';
import { dummyPlants } from '../data/dummyPlants';

const MLModelPage = ({ styles, theme, isDarkMode, plantData, onToggleTheme }) => {
  const { loadModelInfo, getHealthStatusStyle, modelInfo } = usePlantHealthPrediction();
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await loadModelInfo();
      } catch (err) {
        console.error('Error loading model info:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [loadModelInfo]);

  // Map dummy plants to predictions
  const plantPredictions = dummyPlants.map(plant => {
    const healthStyle = getHealthStatusStyle(plant.healthStatus);
    return {
      ...plant,
      healthStyle,
      confidence: plant.healthStatus === 'Healthy' ? '92.5' : plant.healthStatus === 'Moderate Stress' ? '85.3' : '78.2',
      probabilities: {
        'Healthy': plant.healthStatus === 'Healthy' ? 0.925 : plant.healthStatus === 'Moderate Stress' ? 0.15 : 0.05,
        'Moderate Stress': plant.healthStatus === 'Moderate Stress' ? 0.853 : plant.healthStatus === 'High Stress' ? 0.25 : 0.10,
        'High Stress': plant.healthStatus === 'High Stress' ? 0.782 : 0.05
      }
    };
  });

  // Calculate additional insights
  const insights = {
    totalPredictions: plantPredictions.length,
    avgConfidence: (plantPredictions.reduce((sum, p) => sum + parseFloat(p.confidence), 0) / plantPredictions.length).toFixed(1),
    healthyCount: plantPredictions.filter(p => p.healthStatus === 'Healthy').length,
    stressedCount: plantPredictions.filter(p => p.healthStatus !== 'Healthy').length,
    mostCommonIssue: 'pH Imbalance', // Could be calculated from actual data
    predictionAccuracy: modelInfo?.metadata?.mean_accuracy ? (modelInfo.metadata.mean_accuracy * 100).toFixed(1) : '93.8'
  };

  const getStatusIcon = (status) => {
    if (status === 'Healthy') return <CheckCircle size={20} color="#d3ff5c" />;
    if (status === 'Moderate Stress') return <AlertTriangle size={20} color="#ffa500" />;
    return <XCircle size={20} color="#ff6b6b" />;
  };

  return (
    <div style={{ marginBottom: '40px' }}>
      <PageHeader 
        title="ML Model" 
        subtitle="Plant Health Predictions & Analysis"
        theme={theme} 
        isDarkMode={isDarkMode} 
        onToggleTheme={onToggleTheme}
      />

      {/* Model Summary - Simplified */}
      {modelInfo && modelInfo.model_exists ? (
        <div style={{
          background: theme.card,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                padding: '12px', 
                borderRadius: '12px', 
                background: `${theme.accent}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Brain size={24} color={theme.accent} />
              </div>
              <div>
                <h2 style={{ 
                  color: theme.text, 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  margin: 0,
                  marginBottom: '4px'
                }}>
                  Model Status: Active
                </h2>
                <p style={{ color: theme.textMuted, fontSize: '14px', margin: 0 }}>
                  Neural Additive Model (NAM) with Interactions
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: showDetails ? theme.surface : 'transparent',
                color: theme.text,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!showDetails) e.target.style.background = theme.surface;
              }}
              onMouseLeave={(e) => {
                if (!showDetails) e.target.style.background = 'transparent';
              }}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: showDetails ? '20px' : '0'
          }}>
            <div style={{
              background: theme.surface,
              padding: '16px',
              borderRadius: '12px',
              border: `1px solid ${theme.border}`,
              textAlign: 'center'
            }}>
              <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Accuracy</div>
              <div style={{ color: theme.accent, fontSize: '28px', fontWeight: 'bold' }}>
                {(modelInfo.metadata?.mean_accuracy * 100).toFixed(1)}%
              </div>
            </div>

            <div style={{
              background: theme.surface,
              padding: '16px',
              borderRadius: '12px',
              border: `1px solid ${theme.border}`,
              textAlign: 'center'
            }}>
              <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>F1-Score</div>
              <div style={{ color: '#d3ff5c', fontSize: '28px', fontWeight: 'bold' }}>
                {(modelInfo.metadata?.mean_f1_score * 100).toFixed(1)}%
              </div>
            </div>

            <div style={{
              background: theme.surface,
              padding: '16px',
              borderRadius: '12px',
              border: `1px solid ${theme.border}`,
              textAlign: 'center'
            }}>
              <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>Classes</div>
              <div style={{ color: theme.text, fontSize: '28px', fontWeight: 'bold' }}>
                {modelInfo.metadata?.num_classes || 3}
              </div>
            </div>
          </div>

          {/* Collapsible Details */}
          {showDetails && (
            <div style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: `1px solid ${theme.border}`
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '12px',
                fontSize: '13px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: theme.textMuted }}>Features:</span>
                  <span style={{ color: theme.text, fontWeight: '600' }}>{modelInfo.metadata?.num_features || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: theme.textMuted }}>Epochs:</span>
                  <span style={{ color: theme.text, fontWeight: '600' }}>{modelInfo.metadata?.epochs || 200}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: theme.textMuted }}>K-Fold CV:</span>
                  <span style={{ color: theme.text, fontWeight: '600' }}>{modelInfo.metadata?.k_folds || 5}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: theme.textMuted }}>Target Classes:</span>
                  <span style={{ color: theme.text, fontWeight: '600' }}>
                    {modelInfo.metadata?.classes?.join(', ') || 'Healthy, Moderate Stress, High Stress'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          background: theme.card,
          borderRadius: '16px',
          padding: '32px',
          border: `1px solid ${theme.border}`,
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <p style={{ color: theme.textMuted, fontSize: '16px' }}>
            Model not trained yet. Please train the model first.
          </p>
        </div>
      )}

      {/* Additional Insights Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${theme.card} 0%, ${theme.surface} 100%)`,
          padding: '20px',
          borderRadius: '12px',
          border: `1px solid ${theme.border}`,
          textAlign: 'center',
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <Activity size={18} color={theme.accent} />
            <div style={{ color: theme.textMuted, fontSize: '12px' }}>Total Predictions</div>
          </div>
          <div style={{ color: theme.text, fontSize: '28px', fontWeight: 'bold' }}>
            {insights.totalPredictions}
          </div>
        </div>

        <div style={{
          background: `linear-gradient(135deg, ${theme.card} 0%, ${theme.surface} 100%)`,
          padding: '20px',
          borderRadius: '12px',
          border: `1px solid ${theme.border}`,
          textAlign: 'center',
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <Target size={18} color="#d3ff5c" />
            <div style={{ color: theme.textMuted, fontSize: '12px' }}>Avg Confidence</div>
          </div>
          <div style={{ color: '#d3ff5c', fontSize: '28px', fontWeight: 'bold' }}>
            {insights.avgConfidence}%
          </div>
        </div>

        <div style={{
          background: `linear-gradient(135deg, ${theme.card} 0%, ${theme.surface} 100%)`,
          padding: '20px',
          borderRadius: '12px',
          border: `1px solid ${theme.border}`,
          textAlign: 'center',
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <CheckCircle size={18} color="#4ade80" />
            <div style={{ color: theme.textMuted, fontSize: '12px' }}>Healthy Plants</div>
          </div>
          <div style={{ color: '#4ade80', fontSize: '28px', fontWeight: 'bold' }}>
            {insights.healthyCount}
          </div>
        </div>

        <div style={{
          background: `linear-gradient(135deg, ${theme.card} 0%, ${theme.surface} 100%)`,
          padding: '20px',
          borderRadius: '12px',
          border: `1px solid ${theme.border}`,
          textAlign: 'center',
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertTriangle size={18} color="#ff6b6b" />
            <div style={{ color: theme.textMuted, fontSize: '12px' }}>Stressed Plants</div>
          </div>
          <div style={{ color: '#ff6b6b', fontSize: '28px', fontWeight: 'bold' }}>
            {insights.stressedCount}
          </div>
        </div>

        <div style={{
          background: `linear-gradient(135deg, ${theme.card} 0%, ${theme.surface} 100%)`,
          padding: '20px',
          borderRadius: '12px',
          border: `1px solid ${theme.border}`,
          textAlign: 'center',
          boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <Zap size={18} color={theme.accent} />
            <div style={{ color: theme.textMuted, fontSize: '12px' }}>Model Accuracy</div>
          </div>
          <div style={{ color: theme.accent, fontSize: '28px', fontWeight: 'bold' }}>
            {insights.predictionAccuracy}%
          </div>
        </div>
      </div>

      {/* Individual Plant Predictions - Only 5 Plants */}
      <div style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <BarChart3 size={24} color={theme.accent} />
          <h2 style={{ 
            color: theme.text, 
            fontSize: '24px', 
            fontWeight: 'bold', 
            margin: 0
          }}>
            Plant Health Predictions
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gap: '20px',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
        }}>
          {plantPredictions.map((plant) => {
            return (
              <div
                key={plant.id}
                style={{
                  background: theme.card,
                  borderRadius: '16px',
                  padding: '24px',
                  border: `2px solid ${plant.healthStyle.color}60`,
                  boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = isDarkMode 
                    ? '0 8px 25px rgba(0, 0, 0, 0.4)' 
                    : '0 8px 25px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.borderColor = plant.healthStyle.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = `${plant.healthStyle.color}60`;
                }}
              >
                <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.1 }}>
                  {getStatusIcon(plant.healthStatus)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ 
                      color: theme.text, 
                      fontSize: '18px', 
                      fontWeight: 'bold',
                      margin: 0,
                      marginBottom: '4px'
                    }}>
                      {plant.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getStatusIcon(plant.healthStatus)}
                      <span style={{ color: theme.textMuted, fontSize: '12px' }}>
                        {plant.plantId}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: plant.healthStyle.color,
                    boxShadow: `0 0 8px ${plant.healthStyle.color}60`
                  }} />
                </div>

                <div style={{
                  background: plant.healthStyle.bgColor,
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  border: `1px solid ${plant.healthStyle.color}40`
                }}>
                  <p style={{ 
                    color: theme.textMuted, 
                    fontSize: '12px',
                    margin: 0,
                    marginBottom: '4px'
                  }}>Health Status</p>
                  <p style={{ 
                    color: plant.healthStyle.color,
                    fontSize: '24px',
                    fontWeight: 'bold',
                    margin: 0,
                    marginBottom: '8px'
                  }}>
                    {plant.healthStatus}
                  </p>
                  <p style={{ 
                    color: theme.textMuted, 
                    fontSize: '12px',
                    margin: 0
                  }}>
                    Confidence: <strong>{plant.confidence}%</strong>
                  </p>
                </div>

                <div style={{
                  display: 'grid',
                  gap: '8px',
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: `1px solid ${theme.border}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: theme.textMuted, fontSize: '12px' }}>pH:</span>
                    <span style={{ color: theme.text, fontSize: '12px', fontWeight: '600' }}>
                      {plant.ph.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: theme.textMuted, fontSize: '12px' }}>Temperature:</span>
                    <span style={{ color: theme.text, fontSize: '12px', fontWeight: '600' }}>
                      {plant.temperature.toFixed(1)}°C
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: theme.textMuted, fontSize: '12px' }}>Humidity:</span>
                    <span style={{ color: theme.text, fontSize: '12px', fontWeight: '600' }}>
                      {plant.humidity.toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: theme.textMuted, fontSize: '12px' }}>TDS:</span>
                    <span style={{ color: theme.text, fontSize: '12px', fontWeight: '600' }}>
                      {plant.tds} ppm
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MLModelPage;
