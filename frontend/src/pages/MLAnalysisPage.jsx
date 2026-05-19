import React, { useEffect, useMemo, useState } from 'react';
import { Brain, Database, Layers, Microscope } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import PageHeader from '../components/PageHeader';
import usePlantHealthPrediction from '../hooks/usePlantHealthPrediction';

const CLUSTER_COLORS = {
  'High Stress': '#f87171',
  Healthy: '#4ade80',
  'Moderate Stress': '#fbbf24'
};

const MLAnalysisPage = ({ theme, isDarkMode }) => {
  const { loadModelInfo, modelInfo } = usePlantHealthPrediction();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadModelInfo();
      setLoading(false);
    })();
  }, [loadModelInfo]);

  const meta = modelInfo?.metadata || {};
  const exists = modelInfo?.model_exists;
  const silhouette = meta.overall_silhouette_score ?? meta.mean_silhouette_score ?? null;

  const clusterChartData = useMemo(() => {
    const counts = meta.cluster_counts || {};
    const labels = meta.cluster_labels || {};
    return Object.entries(counts).map(([id, count]) => ({
      id,
      name: labels[id] || `Cluster ${id}`,
      count,
      fill: CLUSTER_COLORS[labels[id]] || theme.accent
    }));
  }, [meta, theme.accent]);

  const deviationData = useMemo(() => {
    const scores = meta.cluster_deviation_scores || {};
    const labels = meta.cluster_labels || {};
    return Object.entries(scores).map(([id, score]) => ({
      id,
      name: labels[id] || `Cluster ${id}`,
      score: Number(score),
      fill: CLUSTER_COLORS[labels[id]] || theme.accent
    }));
  }, [meta, theme.accent]);

  const pipelineSteps = [
    { step: '1', title: 'Sensor features', desc: 'EC, TDS, DO, pH, bio-signal (+ derived ratios)' },
    { step: '2', title: 'DEC pretrain', desc: 'Deep embedded clustering learns latent representation' },
    { step: '3', title: 'NAM', desc: 'Per-feature shape functions for interpretable contributions' },
    { step: '4', title: 'GMM clusters', desc: 'Gaussian mixtures assign stress regime labels' }
  ];

  return (
    <section style={{ marginBottom: 32 }}>
      <PageHeader
        title="ML analysis"
        subtitle="Unsupervised DEC · NAM · GMM pipeline for hydroponic stress grouping"
        theme={theme}
      />

      {loading && <p style={{ color: theme.textMuted }}>Loading model metadata…</p>}

      {!loading && !exists && (
        <p style={{ color: theme.textMuted, textAlign: 'center', padding: 32 }}>
          No trained model found. Run the NAM + GMM training script on the backend first.
        </p>
      )}

      {!loading && exists && (
        <>
          <Section title="Pipeline overview" icon={<Layers size={20} color={theme.accent} />} theme={theme}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              {pipelineSteps.map((s) => (
                <div
                  key={s.step}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: theme.surface,
                    border: `1px solid ${theme.border}`,
                    position: 'relative'
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      fontSize: 11,
                      fontWeight: 800,
                      color: theme.accent,
                      opacity: 0.6
                    }}
                  >
                    {s.step}
                  </span>
                  <div style={{ color: theme.text, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{s.title}</div>
                  <div style={{ color: theme.textMuted, fontSize: 11, lineHeight: 1.45 }}>{s.desc}</div>
                </div>
              ))}
            </div>
            <p style={{ color: theme.textMuted, fontSize: 12, margin: '12px 0 0', lineHeight: 1.5 }}>
              Unsupervised — no manual labels at train time. Clusters are discovered from sensor profiles, then mapped
              to Healthy / Moderate / High stress for the UI.
            </p>
          </Section>

          <Section title="Cluster quality" icon={<Brain size={20} color={theme.accent} />} theme={theme}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <MetricCard theme={theme} label="Silhouette score" value={silhouette != null ? silhouette.toFixed(3) : '—'} large />
              <MetricCard theme={theme} label="Pipeline" value="DEC · NAM · GMM" />
              <MetricCard theme={theme} label="Clusters" value={meta.num_classes ?? meta.classes?.length ?? '—'} />
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ color: theme.textMuted, fontSize: 12, marginBottom: 6 }}>Separation quality (0–1)</div>
              <div style={{ height: 10, borderRadius: 5, background: theme.surface, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, (silhouette || 0) * 100)}%`,
                    height: '100%',
                    background:
                      (silhouette || 0) >= 0.4 ? theme.success : (silhouette || 0) >= 0.25 ? theme.warning : theme.danger
                  }}
                />
              </div>
              <p style={{ color: theme.textMuted, fontSize: 12, margin: '8px 0 0', lineHeight: 1.5 }}>
                Higher silhouette means clearer separation between stress groups in latent space. Day-to-day decisions
                still use live SOP bands on Overview and Stress pages.
              </p>
            </div>
          </Section>

          {clusterChartData.length > 0 && (
            <Section title="Training set cluster sizes" icon={<Database size={20} color={theme.accent} />} theme={theme}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={clusterChartData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                  <XAxis dataKey="name" stroke={theme.textMuted} tick={{ fontSize: 11 }} />
                  <YAxis stroke={theme.textMuted} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: theme.card,
                      border: `1px solid ${theme.border}`,
                      borderRadius: 8,
                      color: theme.text
                    }}
                  />
                  <Bar dataKey="count" name="Samples" radius={[6, 6, 0, 0]}>
                    {clusterChartData.map((entry) => (
                      <Cell key={entry.id} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p style={{ color: theme.textMuted, fontSize: 12, margin: '10px 0 0' }}>
                How many training rows fell into each discovered group — imbalance suggests one regime dominates the dataset.
              </p>
            </Section>
          )}

          {deviationData.length > 0 && (
            <Section title="Cluster deviation from ideal" icon={<Microscope size={20} color={theme.accent} />} theme={theme}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={deviationData} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                  <XAxis type="number" stroke={theme.textMuted} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" stroke={theme.textMuted} width={100} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: theme.card,
                      border: `1px solid ${theme.border}`,
                      borderRadius: 8,
                      color: theme.text
                    }}
                  />
                  <Bar dataKey="score" name="Deviation" radius={[0, 4, 4, 0]}>
                    {deviationData.map((entry) => (
                      <Cell key={entry.id} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p style={{ color: theme.textMuted, fontSize: 12, margin: '10px 0 0', lineHeight: 1.45 }}>
                Average distance from ideal nutrient profile per cluster — higher means that group’s centroid is farther
                from the target hydroponic chemistry.
              </p>
            </Section>
          )}

          <Section title="Training configuration" icon={<Database size={20} color={theme.accent} />} theme={theme}>
            <KeyValueGrid
              theme={theme}
              rows={[
                ['Approach', 'Neural Additive Model + Gaussian Mixture'],
                ['Features', meta.num_features ?? '—'],
                ['Latent dim', meta.latent_dim ?? '—'],
                ['Pretrain epochs', meta.pretrain_epochs ?? '—'],
                ['DEC epochs', meta.dec_epochs ?? '—'],
                ['Device', meta.device ?? 'CPU'],
                ['Dataset shape', meta.dataset_shape ? `${meta.dataset_shape[0]} × ${meta.dataset_shape[1]}` : '—']
              ]}
            />
            {meta.feature_names?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                {meta.feature_names.map((f) => (
                  <span
                    key={f}
                    style={{
                      fontSize: 10,
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: theme.surface,
                      border: `1px solid ${theme.border}`,
                      color: theme.textMuted
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
          </Section>

          {meta.classes?.length > 0 && (
            <Section title="Discovered groups" icon={<Layers size={20} color={theme.accent} />} theme={theme}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {meta.classes.map((c) => (
                  <span
                    key={c}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600,
                      background: `${CLUSTER_COLORS[c] || theme.accent}22`,
                      border: `1px solid ${CLUSTER_COLORS[c] || theme.accent}55`,
                      color: CLUSTER_COLORS[c] || theme.text
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </Section>
          )}
        </>
      )}
    </section>
  );
};

function Section({ title, icon, theme, children }) {
  return (
    <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        {icon}
        <h2 style={{ margin: 0, fontSize: 16, color: theme.text }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function MetricCard({ theme, label, value, large }) {
  return (
    <div style={{ background: theme.surface, borderRadius: 10, padding: 14, border: `1px solid ${theme.border}`, textAlign: 'center' }}>
      <div style={{ color: theme.textMuted, fontSize: 11, marginBottom: 6 }}>{label}</div>
      <div style={{ color: theme.accent, fontSize: large ? 28 : 18, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function KeyValueGrid({ theme, rows }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span style={{ color: theme.textMuted }}>{k}</span>
          <span style={{ color: theme.text, fontWeight: 600 }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

export default MLAnalysisPage;
