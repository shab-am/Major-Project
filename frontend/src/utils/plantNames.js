export function genericPlantName(index) {
  return `Plant ${index + 1}`;
}

export function withGenericPlantLabels(plants = []) {
  return plants.map((plant, index) => ({
    ...plant,
    display_name: genericPlantName(index),
    plant_index: index + 1
  }));
}
