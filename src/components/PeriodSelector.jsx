import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Mise à jour de l'import

const PeriodSelector = ({ selectedPeriod, onPeriodChange }) => {
  const periods = ['Tout', 'Jour', 'Semaine', 'Mois'];

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={selectedPeriod}
        onValueChange={(itemValue) => onPeriodChange(itemValue)}
        style={styles.picker}
      >
        {periods.map((period, index) => (
          <Picker.Item key={index} label={period} value={period} />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  picker: {
    height: 50,
    width: 150,
  },
});

export default PeriodSelector;