import React from 'react';
import PageHeader from '../components/PageHeader';
import SensorElectrodePanel from '../components/SensorElectrodePanel';
import BioSignalsPage from './BioSignalsPage';
import { useLiveSensor } from '../context/LiveSensorContext';

export default function SystemsPage(props) {
  const { latestSnapshot, bioSeriesElectrochemical, pollIntervalMs } = useLiveSensor();

  return (
    <section style={{ marginBottom: 32 }}>
      <PageHeader
        title="Sensors"
        subtitle="Bio-signals and latest ingest rows from the live stream"
        theme={props.theme}
      />

      <SensorElectrodePanel
        theme={props.theme}
        isDarkMode={props.isDarkMode}
        latestSnapshot={latestSnapshot}
        bioSeries={bioSeriesElectrochemical}
        pollIntervalMs={pollIntervalMs}
      />

      <section style={{ marginBottom: 24 }}>
        <BioSignalsPage {...props} embedded />
      </section>
    </section>
  );
}

