import React, {useState} from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity, Button} from 'react-native';

export default function HistoryScreen({route}) {

  const [historico, setHistorico] = useState([]);
  const { startDate, endDate, selectedOption } = route.params;

  const dateStart = new Date(startDate);
  const dateEnd = new Date(endDate);

  return (
    <View style={styles.container}>
      <Text style={styles.tittle}>Histórico de Uso do Veículo</Text>
      <FlatList
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('History', {
                selectedOption: item.selectedOption,
                startDate: item.startDate,
                endDate: item.endDate,
              })
            }
            style={styles.item}
          >
            <Text>Placa do Veículo: {item.selectedOption}</Text>
            <Text>Data de Início: {new Date(item.startDate).toLocaleString()}</Text>
            <Text>Data de Fim: {new Date(item.endDate).toLocaleString()}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  tittle:{
    fontSize: 18,
    fontWeight: 'bold',
  },
  item: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 8,
  },
});
