import React from 'react';
import PlantCard from './PlantCard';

const PlantGrid = ({ plantInfo, theme, isDarkMode }) => {
  const grid = {
    display: 'grid',
    gap: 24,
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    alignItems: 'stretch'
  };

  return (
    <div style={grid}>
      {Object.keys(plantInfo).map((plantName) => (
        <PlantCard key={plantName} plantName={plantName} plant={plantInfo[plantName]} theme={theme} isDarkMode={isDarkMode} />
      ))}
    </div>
  );
};

export default PlantGrid;


