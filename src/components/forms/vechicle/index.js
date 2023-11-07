import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PickerVehicles({onValueChange, enabled, selectedVehicle, style, dropdownIconColor}) {
  const [pickerItems, setPickerItems] = useState([]);
  const [selectedValue, setSelectedValue] = useState('opcao0');

  useEffect(() => {
    // Consulta com ordenação
    const query = firestore().collection('pickerVehicles').orderBy('order');

    // Função para buscar opções do Firebase Firestore
    const fetchPickerOptions = async () => {
      try {
        const querySnapshot = await query.get();
        const items = [];

        querySnapshot.forEach((documentSnapshot) => {
          const data = documentSnapshot.data();
          items.push({ label: data.label, value: data.value });
        });

        setPickerItems(items);
      } catch (error) {
        console.error('Erro ao buscar opções do Firestore:', error);
      }
    };

    // Inicialmente, carregue as opções do Firestore.
    fetchPickerOptions();
  }, []);

  useEffect(() => {
    const loadSelectedValue = async () => {
      try {
        const storedValue = await AsyncStorage.getItem('selectedVehicle');
        if (storedValue !== null) {
          setSelectedValue(storedValue);
        }
      } catch (error) {
        console.error('Erro ao carregar valor do AsyncStorage:', error);
      }
    };

    loadSelectedValue();
  }, []);

  const handlePickerChange = async (itemValue) => {
    setSelectedValue(itemValue);
    const updatedDataToSave = {
      selectedVehicle: itemValue,
    };
    
    onValueChange(updatedDataToSave.selectedVehicle);

    await AsyncStorage.setItem('selectedVehicle', updatedDataToSave.selectedVehicle)
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Selecione a placa de veiculo:</Text>
      <View style={{borderWidth: 1, borderRadius: 60, marginTop: 10, marginBottom: 10, paddingBottom: 4}}>
      <Picker
        selectedValue={selectedVehicle}
        onValueChange={handlePickerChange}
        enabled={enabled}
        style={style}
        dropdownIconColor={dropdownIconColor}
      >
        {pickerItems.map((item, index) => (
          <Picker.Item key={index} label={item.label} value={item.value} />
        ))}
      </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#242424',
  },
});
