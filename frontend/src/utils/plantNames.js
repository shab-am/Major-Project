export function genericPlantName() {
  return 'Plant';
}

export function withGenericPlantLabels(plants = []) {
  return plants.map((plant) => ({
    ...plant,
    display_name: genericPlantName()
  }));
}
