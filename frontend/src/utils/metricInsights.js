const DURATION_NOTE =
  'If this continues for roughly 2–4 hours (about 24–48 readings at 5 min intervals), stress risk increases.';

const INSIGHTS = {
  ph: {
    low: {
      cause: 'Nutrient solution became more acidic — uptake imbalance, organic acids, or low alkalinity.',
      effect: 'Iron/manganese uptake can rise; young leaves may yellow; root tips can brown.',
      duration: DURATION_NOTE
    },
    high: {
      cause: 'pH drifted alkaline — carbonates building up, weak acid regulation, or media breakdown.',
      effect: 'Iron lockout and pale new growth; micronutrient uptake drops.',
      duration: DURATION_NOTE
    }
  },
  temperature: {
    low: {
      cause: 'Ambient or water temperature dropped — HVAC, night cycle, or cold reservoir.',
      effect: 'Slower growth and delayed nutrient uptake; risk of chilling stress in the root zone.',
      duration: DURATION_NOTE
    },
    high: {
      cause: 'Heat load rose — lighting, poor airflow, or warm reservoir.',
      effect: 'Wilting, bolting tendency, and reduced dissolved oxygen in solution.',
      duration: DURATION_NOTE
    }
  },
  humidity: {
    low: {
      cause: 'Air is drier than target — ventilation, dehumidification, or seasonal drop.',
      effect: 'Transpiration rises; leaf edges may crisp; sensors read lower VPD balance.',
      duration: DURATION_NOTE
    },
    high: {
      cause: 'Moist air around canopy — limited airflow or dense planting.',
      effect: 'Higher fungal pressure; stomata may stay closed; slower transpiration.',
      duration: DURATION_NOTE
    }
  },
  tds: {
    low: {
      cause: 'Nutrient concentration fell — dilution from top-up water or heavy uptake in the reservoir.',
      effect: 'Nitrogen/potassium deficiency signs; pale or slow growth.',
      duration: DURATION_NOTE
    },
    high: {
      cause: 'Salts accumulated — evaporation, over-concentration, or low top-up volume in the system.',
      effect: 'Salt burn on leaf margins; osmotic stress and reduced water uptake.',
      duration: DURATION_NOTE
    }
  },
  dissolved_oxygen: {
    low: {
      cause: 'Less oxygen in solution — warm water, stagnant flow, or biofilm.',
      effect: 'Root stress, browning roots, higher susceptibility to pathogens.',
      duration: DURATION_NOTE
    },
    high: {
      cause: 'Unusually high DO reading — aeration spike or sensor calibration.',
      effect: 'Usually less critical; verify sensor if value is far above normal.',
      duration: DURATION_NOTE
    }
  }
};

export function getRangeInsight(metricKey, direction) {
  const block = INSIGHTS[metricKey]?.[direction];
  if (!block) {
    return {
      cause: 'Reading is outside the hydroponic target band for this parameter.',
      effect: 'Growth may slow until the parameter returns to range.',
      duration: DURATION_NOTE
    };
  }
  return block;
}

const SAMPLE_MINUTES = 5;

export function analyzeMetricWindow(data, dataKey, optimalRange, metricKey) {
  if (!data?.length || !optimalRange) return null;

  const latest = data[data.length - 1]?.[dataKey];
  if (latest == null || Number.isNaN(Number(latest))) return null;

  let outOfBandStreak = 0;
  for (let i = data.length - 1; i >= 0; i -= 1) {
    const v = data[i][dataKey];
    if (v == null || Number.isNaN(Number(v))) continue;
    if (v < optimalRange.min || v > optimalRange.max) outOfBandStreak += 1;
    else break;
  }

  const insightKeyMap = { dissolvedOxy: 'dissolved_oxygen' };
  const insightKey = insightKeyMap[metricKey] || metricKey;

  const direction =
    latest < optimalRange.min ? 'low' : latest > optimalRange.max ? 'high' : null;
  const insight = direction ? getRangeInsight(insightKey, direction) : null;
  const durationMinutes = outOfBandStreak * SAMPLE_MINUTES;

  let durationLabel;
  if (!direction) {
    durationLabel =
      outOfBandStreak === 0
        ? `In target band across the last ${data.length} readings in this window.`
        : 'Returned to band — recent readings are stable.';
  } else if (outOfBandStreak <= 1) {
    durationLabel =
      'Latest point only — if the next 2–4 readings stay out of band (~10–20 min), treat as an active drift.';
  } else if (durationMinutes < 60) {
    durationLabel = `Out of band for ~${durationMinutes} min (${outOfBandStreak} readings at ~${SAMPLE_MINUTES} min spacing).`;
  } else {
    const hours = (durationMinutes / 60).toFixed(1);
    durationLabel = `Sustained for ~${hours} h (${outOfBandStreak} readings) — elevated plant stress risk.`;
  }

  return {
    inRange: !direction,
    direction,
    outOfBandStreak,
    durationMinutes,
    durationLabel,
    insight
  };
}

export function getSpikeInsight(metricKey, value, optimalRange) {
  const insightKeyMap = { dissolvedOxy: 'dissolved_oxygen' };
  const key = insightKeyMap[metricKey] || metricKey;
  if (value == null || !optimalRange) {
    return 'Unusual point compared with recent readings — verify sensor contact and recirculation.';
  }
  const direction = value < optimalRange.min ? 'low' : value > optimalRange.max ? 'high' : null;
  if (!direction) {
    return 'Spike vs recent pattern but still inside SOP band — watch the next 2–3 readings.';
  }
  const block = getRangeInsight(key, direction);
  return `Spike detected: ${block.cause} ${block.effect}`;
}

export function getBioSignalInsight(prev, current) {
  if (prev == null || current == null) return 'Not enough history to explain this point.';
  const delta = current - prev;
  if (Math.abs(delta) < 0.05) return 'Signal is stable — plant electrical response is steady.';
  if (delta > 0) {
    return `Signal rose by ${delta.toFixed(2)}. Often linked to active stress response or changing ion flow at the electrode. Sustained rises over 1–2 hours can precede visible stress.`;
  }
  return `Signal fell by ${Math.abs(delta).toFixed(2)}. Often linked to calmer tissue response or settling after an environmental shift. Prolonged low activity over 2+ hours may indicate recovery or sensor contact change.`;
}
