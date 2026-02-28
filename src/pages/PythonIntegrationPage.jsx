import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import pythonService from '../services/pythonService';

const PythonIntegrationPage = ({ styles, theme, isDarkMode, onToggleTheme }) => {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [datasets, setDatasets] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [selectedScript, setSelectedScript] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [retrain, setRetrain] = useState(false);

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth();
    loadDatasets();
    loadScripts();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const health = await pythonService.healthCheck();
      setBackendStatus('connected');
      console.log('Backend health:', health);
    } catch (err) {
      setBackendStatus('disconnected');
      console.error('Backend not available:', err);
    }
  };

  const loadDatasets = async () => {
    try {
      const response = await pythonService.listDatasets();
      setDatasets(response.datasets || []);
    } catch (err) {
      console.error('Error loading datasets:', err);
      setDatasets([]);
    }
  };

  const loadScripts = async () => {
    try {
      const response = await pythonService.listScripts();
      setScripts(response.scripts || []);
      // Prefer plant_health_model if available, otherwise use first script
      if (response.scripts && response.scripts.length > 0) {
        const preferredScript = response.scripts.find(s => s === 'plant_health_model');
        setSelectedScript(preferredScript || response.scripts[0]);
      }
    } catch (err) {
      console.error('Error loading scripts:', err);
      setScripts([]);
    }
  };

  const runScript = async () => {
    if (!selectedScript) {
      setError('Please select a script');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const params = {};
      if (selectedScript === 'plant_health_model') {
        params.retrain = retrain;
        params.epochs = 200;
        params.k_folds = 5;
      }
      
      const response = await pythonService.runScript(
        selectedScript,
        selectedDataset || null,
        params
      );
      setResult(response);
    } catch (err) {
      setError(err.message || 'Failed to run script');
      console.error('Error running script:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'connected':
        return '#4ade80';
      case 'disconnected':
        return '#f87171';
      default:
        return '#fbbf24';
    }
  };

  const getStatusText = () => {
    switch (backendStatus) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Checking...';
    }
  };

  return (
    <div style={{ marginBottom: '40px' }}>
      <PageHeader
        title="Python Integration"
        subtitle="Run Python scripts and process datasets"
        theme={theme}
        isDarkMode={isDarkMode}
        onToggleTheme={onToggleTheme}
      />

      {/* Backend Status */}
      <div
        style={{
          background: theme.card,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode
            ? '0 4px 20px rgba(0, 0, 0, 0.3)'
            : '0 2px 10px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(),
              animation:
                backendStatus === 'checking' ? 'pulse 2s infinite' : 'none',
            }}
          />
          <span style={{ color: theme.text, fontWeight: '600' }}>
            Python Backend: {getStatusText()}
          </span>
          <button
            onClick={checkBackendHealth}
            style={{
              marginLeft: 'auto',
              padding: '6px 12px',
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              color: theme.text,
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Refresh
          </button>
        </div>
        {backendStatus === 'disconnected' && (
          <p
            style={{
              color: theme.textMuted,
              fontSize: '14px',
              marginTop: '12px',
              padding: '12px',
              background: theme.surface,
              borderRadius: '8px',
            }}
          >
            Make sure the Python backend is running. Navigate to the{' '}
            <code style={{ color: theme.accent }}>backend</code> directory and
            run: <code style={{ color: theme.accent }}>python app.py</code>
          </p>
        )}
      </div>

      {/* Script Selection and Execution */}
      <div
        style={{
          background: theme.card,
          borderRadius: '16px',
          padding: '32px',
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode
            ? '0 4px 20px rgba(0, 0, 0, 0.3)'
            : '0 2px 10px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px',
        }}
      >
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: theme.text,
            marginBottom: '24px',
          }}
        >
          Run Python Script
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Script Selection */}
          <div>
            <label
              style={{
                display: 'block',
                color: theme.text,
                marginBottom: '8px',
                fontWeight: '500',
              }}
            >
              Select Script
            </label>
            <select
              value={selectedScript}
              onChange={(e) => setSelectedScript(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: theme.surface,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                color: theme.text,
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              <option value="">-- Select a script --</option>
              {scripts.map((script) => (
                <option key={script} value={script}>
                  {script}
                  {script === 'plant_health_model' ? ' (ML Model - Train Plant Health Classifier)' : ''}
                  {script === 'main' ? ' (Template - Basic Data View)' : ''}
                </option>
              ))}
            </select>
            {selectedScript === 'main' && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '12px',
                  background: isDarkMode ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.15)',
                  border: `1px solid ${theme.accent}`,
                  borderRadius: '8px',
                }}
              >
                <p style={{ color: theme.text, fontSize: '14px', margin: 0 }}>
                  💡 <strong>Tip:</strong> This is the template script that shows basic data info. 
                  To train the ML model for plant health classification, select <strong style={{color: theme.accent}}>plant_health_model</strong> instead.
                </p>
              </div>
            )}
          </div>

          {/* Dataset Selection */}
          <div>
            <label
              style={{
                display: 'block',
                color: theme.text,
                marginBottom: '8px',
                fontWeight: '500',
              }}
            >
              Select Dataset (Optional)
            </label>
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: theme.surface,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                color: theme.text,
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              <option value="">-- No dataset --</option>
              {datasets.map((dataset) => (
                <option key={dataset} value={dataset}>
                  {dataset}
                </option>
              ))}
            </select>
          </div>

          {/* Retrain Option for ML Models */}
          {selectedScript === 'plant_health_model' && (
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: theme.text,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={retrain}
                  onChange={(e) => setRetrain(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                  }}
                />
                <span>Retrain model (uncheck to use existing model if available)</span>
              </label>
            </div>
          )}

          {/* Run Button */}
          <button
            onClick={runScript}
            disabled={loading || !selectedScript || backendStatus !== 'connected'}
            style={{
              padding: '14px 28px',
              background:
                loading || !selectedScript || backendStatus !== 'connected'
                  ? theme.surface
                  : theme.accent,
              color:
                loading || !selectedScript || backendStatus !== 'connected'
                  ? theme.textMuted
                  : 'black',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor:
                loading || !selectedScript || backendStatus !== 'connected'
                  ? 'not-allowed'
                  : 'pointer',
              transition: 'all 0.2s ease',
              opacity:
                loading || !selectedScript || backendStatus !== 'connected'
                  ? 0.6
                  : 1,
            }}
            onMouseEnter={(e) => {
              if (
                !loading &&
                selectedScript &&
                backendStatus === 'connected'
              ) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = isDarkMode
                  ? '0 6px 20px rgba(211, 255, 92, 0.3)'
                  : '0 6px 20px rgba(0, 229, 255, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            {loading ? 'Running...' : 'Run Script'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div
          style={{
            background: theme.card,
            borderRadius: '16px',
            padding: '24px',
            border: `1px solid #f87171`,
            boxShadow: isDarkMode
              ? '0 4px 20px rgba(0, 0, 0, 0.3)'
              : '0 2px 10px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px',
          }}
        >
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#f87171',
              marginBottom: '12px',
            }}
          >
            Error
          </h3>
          <p style={{ color: theme.text, whiteSpace: 'pre-wrap' }}>{error}</p>
        </div>
      )}

      {/* Next Steps Guide */}
      {result && result.result && result.result.success && (
        result.result.metadata?.mean_accuracy !== undefined || 
        result.result.mean_accuracy !== undefined
      ) && (
        <div
          style={{
            background: theme.surface,
            borderRadius: '16px',
            padding: '24px',
            border: `1px solid ${theme.border}`,
            marginBottom: '24px',
          }}
        >
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: theme.text,
              marginBottom: '16px',
            }}
          >
            ✅ Model Trained Successfully! What's Next?
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ color: theme.accent, fontSize: '20px' }}>1.</div>
              <div>
                <p style={{ color: theme.text, fontWeight: '600', margin: 0, marginBottom: '4px' }}>
                  Go to Dashboard
                </p>
                <p style={{ color: theme.textMuted, fontSize: '14px', margin: 0 }}>
                  The Dashboard will automatically show health predictions for your plant data
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ color: theme.accent, fontSize: '20px' }}>2.</div>
              <div>
                <p style={{ color: theme.text, fontWeight: '600', margin: 0, marginBottom: '4px' }}>
                  Visit ML Model Page
                </p>
                <p style={{ color: theme.textMuted, fontSize: '14px', margin: 0 }}>
                  Click "Predict Health" to see detailed predictions with confidence scores
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ color: theme.accent, fontSize: '20px' }}>3.</div>
              <div>
                <p style={{ color: theme.text, fontWeight: '600', margin: 0, marginBottom: '4px' }}>
                  Add Plant Data
                </p>
                <p style={{ color: theme.textMuted, fontSize: '14px', margin: 0 }}>
                  Add new plant entries in the Entry page - predictions will update automatically
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div
          style={{
            background: theme.card,
            borderRadius: '16px',
            padding: '32px',
            border: `1px solid ${theme.border}`,
            boxShadow: isDarkMode
              ? '0 4px 20px rgba(0, 0, 0, 0.3)'
              : '0 2px 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h3
            style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: theme.text,
              marginBottom: '20px',
            }}
          >
            Results
          </h3>
          
          {/* Enhanced ML Model Results Display */}
          {result.result && result.result.success && (
            result.result.metadata?.mean_accuracy !== undefined || 
            result.result.mean_accuracy !== undefined
          ) ? (
            <div>
              {/* Model Status */}
              <div
                style={{
                  background: theme.surface,
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: `1px solid ${theme.border}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: result.result.retrain ? '#fbbf24' : '#4ade80',
                    }}
                  />
                  <span style={{ color: theme.text, fontWeight: '600' }}>
                    {result.result.retrain ? 'Model Trained' : 'Using Existing Model'}
                  </span>
                </div>
                <p style={{ color: theme.textMuted, fontSize: '14px', margin: 0 }}>
                  {result.result.message}
                </p>
              </div>

              {/* Main Metrics */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    background: theme.surface,
                    padding: '20px',
                    borderRadius: '12px',
                    border: `1px solid ${theme.border}`,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '8px' }}>
                    Mean Accuracy
                  </div>
                  <div
                    style={{
                      color: theme.accent,
                      fontSize: '28px',
                      fontWeight: 'bold',
                    }}
                  >
                    {result.result.metadata 
                      ? (result.result.metadata.mean_accuracy * 100).toFixed(2)
                      : (result.result.mean_accuracy * 100).toFixed(2)}%
                  </div>
                  <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>
                    ± {result.result.metadata
                      ? (result.result.metadata.std_accuracy * 100).toFixed(2)
                      : (result.result.std_accuracy * 100).toFixed(2)}%
                  </div>
                </div>

                <div
                  style={{
                    background: theme.surface,
                    padding: '20px',
                    borderRadius: '12px',
                    border: `1px solid ${theme.border}`,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '8px' }}>
                    Mean F1-Score
                  </div>
                  <div
                    style={{
                      color: theme.accent,
                      fontSize: '28px',
                      fontWeight: 'bold',
                    }}
                  >
                    {result.result.metadata
                      ? result.result.metadata.mean_f1_score.toFixed(4)
                      : result.result.mean_f1_score.toFixed(4)}
                  </div>
                  <div style={{ color: theme.textMuted, fontSize: '12px', marginTop: '4px' }}>
                    ± {result.result.metadata
                      ? result.result.metadata.std_f1_score.toFixed(4)
                      : result.result.std_f1_score.toFixed(4)}
                  </div>
                </div>

                {result.result.metadata && (
                  <>
                    <div
                      style={{
                        background: theme.surface,
                        padding: '20px',
                        borderRadius: '12px',
                        border: `1px solid ${theme.border}`,
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '8px' }}>
                        Features
                      </div>
                      <div
                        style={{
                          color: theme.text,
                          fontSize: '24px',
                          fontWeight: 'bold',
                        }}
                      >
                        {result.result.metadata.num_features}
                      </div>
                    </div>

                    <div
                      style={{
                        background: theme.surface,
                        padding: '20px',
                        borderRadius: '12px',
                        border: `1px solid ${theme.border}`,
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '8px' }}>
                        Classes
                      </div>
                      <div
                        style={{
                          color: theme.text,
                          fontSize: '24px',
                          fontWeight: 'bold',
                        }}
                      >
                        {result.result.metadata.num_classes}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Fold Results Table */}
              {result.result.fold_results && result.result.fold_results.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h4
                    style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: theme.text,
                      marginBottom: '12px',
                    }}
                  >
                    Cross-Validation Fold Results
                  </h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        background: theme.surface,
                        borderRadius: '8px',
                        overflow: 'hidden',
                      }}
                    >
                      <thead>
                        <tr style={{ background: theme.bg }}>
                          <th
                            style={{
                              padding: '12px',
                              textAlign: 'left',
                              color: theme.text,
                              borderBottom: `1px solid ${theme.border}`,
                              fontSize: '14px',
                              fontWeight: '600',
                            }}
                          >
                            Fold
                          </th>
                          <th
                            style={{
                              padding: '12px',
                              textAlign: 'left',
                              color: theme.text,
                              borderBottom: `1px solid ${theme.border}`,
                              fontSize: '14px',
                              fontWeight: '600',
                            }}
                          >
                            Accuracy
                          </th>
                          <th
                            style={{
                              padding: '12px',
                              textAlign: 'left',
                              color: theme.text,
                              borderBottom: `1px solid ${theme.border}`,
                              fontSize: '14px',
                              fontWeight: '600',
                            }}
                          >
                            F1-Score
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.result.fold_results.map((fold, idx) => (
                          <tr key={idx}>
                            <td
                              style={{
                                padding: '12px',
                                color: theme.text,
                                borderBottom: `1px solid ${theme.border}`,
                              }}
                            >
                              {fold.fold}
                            </td>
                            <td
                              style={{
                                padding: '12px',
                                color: theme.accent,
                                borderBottom: `1px solid ${theme.border}`,
                                fontWeight: '600',
                              }}
                            >
                              {(fold.accuracy * 100).toFixed(2)}%
                            </td>
                            <td
                              style={{
                                padding: '12px',
                                color: theme.accent,
                                borderBottom: `1px solid ${theme.border}`,
                                fontWeight: '600',
                              }}
                            >
                              {fold.f1_score.toFixed(4)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Model Metadata */}
              {result.result.metadata && (
                <div style={{ marginTop: '24px' }}>
                  <h4
                    style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: theme.text,
                      marginBottom: '12px',
                    }}
                  >
                    Model Information
                  </h4>
                  <div
                    style={{
                      background: theme.surface,
                      padding: '16px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <div style={{ display: 'grid', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: theme.textMuted }}>Device:</span>
                        <span style={{ color: theme.text }}>{result.result.metadata.device || 'CPU'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: theme.textMuted }}>Epochs:</span>
                        <span style={{ color: theme.text }}>{result.result.metadata.epochs || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: theme.textMuted }}>K-Folds:</span>
                        <span style={{ color: theme.text }}>{result.result.metadata.k_folds || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: theme.textMuted }}>Dataset Size:</span>
                        <span style={{ color: theme.text }}>
                          {result.result.metadata.dataset_shape 
                            ? `${result.result.metadata.dataset_shape[0]} rows × ${result.result.metadata.dataset_shape[1]} columns`
                            : 'N/A'}
                        </span>
                      </div>
                      {result.result.metadata.classes && (
                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${theme.border}` }}>
                          <div style={{ color: theme.textMuted, marginBottom: '4px', fontSize: '14px' }}>Health Classes:</div>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {result.result.metadata.classes.map((className, idx) => (
                              <span
                                key={idx}
                                style={{
                                  padding: '4px 12px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  background: className.includes('Healthy') 
                                    ? 'rgba(211, 255, 92, 0.2)' 
                                    : className.includes('Moderate')
                                    ? 'rgba(255, 165, 0, 0.2)'
                                    : 'rgba(255, 107, 107, 0.2)',
                                  color: className.includes('Healthy')
                                    ? '#d3ff5c'
                                    : className.includes('Moderate')
                                    ? '#ffa500'
                                    : '#ff6b6b'
                                }}
                              >
                                {className}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {result.result.metadata.feature_names && (
                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${theme.border}` }}>
                          <div style={{ color: theme.textMuted, marginBottom: '4px', fontSize: '14px' }}>
                            Features ({result.result.metadata.feature_names.length}):
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: '6px',
                            maxHeight: '120px',
                            overflowY: 'auto'
                          }}>
                            {result.result.metadata.feature_names.map((feature, idx) => (
                              <span
                                key={idx}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  background: theme.bg,
                                  color: theme.textMuted,
                                  border: `1px solid ${theme.border}`
                                }}
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Default JSON Display for other results */
            <pre
              style={{
                background: theme.surface,
                padding: '20px',
                borderRadius: '8px',
                overflow: 'auto',
                color: theme.text,
                fontSize: '14px',
                lineHeight: '1.6',
                border: `1px solid ${theme.border}`,
                maxHeight: '500px',
              }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default PythonIntegrationPage;

