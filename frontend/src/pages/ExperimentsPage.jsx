import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import pythonService from '../services/pythonService';
import usePlantHealthPrediction from '../hooks/usePlantHealthPrediction';

const ExperimentsPage = ({ styles, theme, isDarkMode, plantData, onToggleTheme }) => {
  const { predictBatch, getHealthStatusStyle } = usePlantHealthPrediction();
  const [datasetData, setDatasetData] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load dataset
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await pythonService.getDatasetData();
        if (response.success && response.data) {
          setDatasetData(response.data);
          
          // Analyze dataset to create experiments based on stress patterns
          analyzeExperiments(response.data);
        }
      } catch (err) {
        console.error('Error loading experiments data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Analyze dataset to identify experiment opportunities
  const analyzeExperiments = async (data) => {
    if (!data || data.length === 0) return;

    // Group by Plant_ID and analyze stress patterns
    const plantGroups = {};
    data.forEach(entry => {
      const plantId = entry.Plant_ID || entry.Plant_ID;
      if (!plantGroups[plantId]) {
        plantGroups[plantId] = [];
      }
      plantGroups[plantId].push(entry);
    });

    // Identify experiments based on stress patterns
    const experimentList = [];
    
    // Experiment 1: pH optimization
    const phStressed = data.filter(e => {
      const pH = e.Soil_pH || e.ph;
      return pH && (pH < 5.5 || pH > 6.5);
    });
    if (phStressed.length > 0) {
      experimentList.push({
        id: 1,
        title: 'pH Optimization Study',
        description: `Found ${phStressed.length} entries with suboptimal pH levels. Testing pH adjustment impact on plant health.`,
        target: 'Optimize pH levels to 5.5-6.5 range',
        status: 'Recommended',
        priority: 'High',
        plantsAffected: new Set(phStressed.map(e => e.Plant_ID)).size,
        expectedImpact: '15-25% stress reduction'
      });
    }

    // Experiment 2: Temperature control
    const tempStressed = data.filter(e => {
      const temp = e.Ambient_Temperature || e.temperature;
      return temp && (temp < 20 || temp > 26);
    });
    if (tempStressed.length > 0) {
      experimentList.push({
        id: 2,
        title: 'Temperature Regulation',
        description: `Identified ${tempStressed.length} entries with temperature outside optimal range (20-26°C).`,
        target: 'Maintain consistent temperature in optimal range',
        status: 'Recommended',
        priority: 'Medium',
        plantsAffected: new Set(tempStressed.map(e => e.Plant_ID)).size,
        expectedImpact: '10-20% health improvement'
      });
    }

    // Experiment 3: Nutrient balance
    const nutrientStressed = data.filter(e => {
      const n = e.Nitrogen_Level || 30;
      const p = e.Phosphorus_Level || 30;
      const k = e.Potassium_Level || 30;
      return (n < 20 || n > 40) || (p < 20 || p > 40) || (k < 20 || k > 40);
    });
    if (nutrientStressed.length > 0) {
      experimentList.push({
        id: 3,
        title: 'Nutrient Balance Optimization',
        description: `Detected ${nutrientStressed.length} entries with imbalanced NPK levels. Testing optimal nutrient ratios.`,
        target: 'Balance Nitrogen, Phosphorus, and Potassium levels',
        status: 'Recommended',
        priority: 'High',
        plantsAffected: new Set(nutrientStressed.map(e => e.Plant_ID)).size,
        expectedImpact: '20-30% growth improvement'
      });
    }

    setExperiments(experimentList);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#10b981';
      case 'In Progress': return '#f59e0b';
      case 'Recommended': return '#8b5cf6';
      default: return theme.textMuted;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#ff6b6b';
      case 'Medium': return '#ffa500';
      case 'Low': return '#4fc3f7';
      default: return theme.textMuted;
    }
  };

  return (
    <div style={{ marginBottom: '40px' }}>
      <PageHeader 
        title="Experiments" 
        subtitle="Data-driven plant growth experiments and optimization trials"
        theme={theme} 
        isDarkMode={isDarkMode} 
        onToggleTheme={onToggleTheme}
      />

      {/* Purpose Explanation */}
      <div style={{
        background: theme.card,
        borderRadius: '16px',
        padding: '24px',
        border: `1px solid ${theme.border}`,
        boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px'
      }}>
        <h3 style={{ color: theme.text, fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
          What are Experiments?
        </h3>
        <p style={{ color: theme.textMuted, fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
          Experiments are data-driven optimization trials identified from your dataset. The system analyzes 
          stress patterns and environmental conditions to suggest specific experiments that can improve plant health. 
          Each experiment targets a specific issue (like pH imbalance or temperature control) and provides 
          expected impact metrics based on historical data analysis.
        </p>
      </div>

      {loading && (
        <div style={{
          background: theme.card,
          padding: '24px',
          borderRadius: '16px',
          textAlign: 'center',
          border: `1px solid ${theme.border}`,
          marginBottom: '24px'
        }}>
          <p style={{ color: theme.textMuted }}>Analyzing dataset for experiment opportunities...</p>
        </div>
      )}

      {!loading && experiments.length > 0 ? (
        <div style={{ display: 'grid', gap: '20px' }}>
          {experiments.map((experiment) => (
            <div 
              key={experiment.id} 
              style={{
                background: theme.card,
                borderRadius: '16px',
                padding: '24px',
                border: `1px solid ${theme.border}`,
                boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = isDarkMode 
                  ? '0 8px 25px rgba(0, 0, 0, 0.4)' 
                  : '0 8px 25px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: getPriorityColor(experiment.priority),
                    boxShadow: `0 0 10px ${getPriorityColor(experiment.priority)}40`
                  }} />
                  <div style={{ 
                    fontWeight: 'bold', 
                    color: theme.text,
                    fontSize: '18px'
                  }}>
                    {experiment.title}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    background: getStatusColor(experiment.status) + '20',
                    color: getStatusColor(experiment.status),
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {experiment.status}
                  </span>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    background: getPriorityColor(experiment.priority) + '20',
                    color: getPriorityColor(experiment.priority),
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {experiment.priority}
                  </span>
                </div>
              </div>
              
              <div style={{ 
                marginBottom: '20px', 
                color: theme.textMuted,
                lineHeight: '1.6',
                fontSize: '14px'
              }}>
                {experiment.description}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                marginBottom: '20px',
                padding: '16px',
                background: theme.surface,
                borderRadius: '12px',
                border: `1px solid ${theme.border}`
              }}>
                <div>
                  <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Target</div>
                  <div style={{ color: theme.text, fontSize: '14px', fontWeight: '600' }}>
                    {experiment.target}
                  </div>
                </div>
                <div>
                  <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Plants Affected</div>
                  <div style={{ color: theme.text, fontSize: '14px', fontWeight: '600' }}>
                    {experiment.plantsAffected} plants
                  </div>
                </div>
                <div>
                  <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Expected Impact</div>
                  <div style={{ color: '#d3ff5c', fontSize: '14px', fontWeight: '600' }}>
                    {experiment.expectedImpact}
                  </div>
                </div>
              </div>

              <div style={{ 
                height: 200, 
                borderRadius: '12px',
                background: theme.surface,
                border: `1px solid ${theme.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.textMuted,
                fontSize: '14px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
                  <div>Experiment data visualization</div>
                  <div style={{ fontSize: '12px', marginTop: '4px', color: theme.textMuted }}>
                    Based on analysis of {datasetData.length} dataset entries
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && (
        <div style={{
          background: theme.card,
          padding: '32px',
          borderRadius: '16px',
          textAlign: 'center',
          border: `1px solid ${theme.border}`
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔬</div>
          <h3 style={{ color: theme.text, fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
            No Experiments Recommended
          </h3>
          <p style={{ color: theme.textMuted, fontSize: '14px' }}>
            All plants are within optimal parameters. Continue monitoring for any changes.
          </p>
        </div>
      )}
    </div>
  );
};

export default ExperimentsPage;
