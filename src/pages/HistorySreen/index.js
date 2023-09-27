import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity, Button} from 'react-native';

export default function HistoryScreen({route}) {

   const { startDate, endDate, selectedOption } = route.params;
   const [historico, setHistorico] = useState([]);
   
  useEffect(() => {
    if (startDate || endDate) {
      const newEntry = {
        id: new Date().getTime().toString(), 
        selectedOption,
        startDate,
        endDate,
      };
     
      setHistorico((prevHistorico) => [...prevHistorico, newEntry]);
    }
  }, [startDate, endDate, selectedOption]);


  return (
    <View style={styles.container}>
      <Text style={styles.tittle}>Histórico de Uso do Veículo</Text>
      <FlatList
        data={historico}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>Placa do Veículo: {item.selectedOption}</Text>
            <Text>Data de Início: {new Date(item.startDate).toLocaleString()}</Text>
            <Text>
              Data de Fim: {item.endDate ? new Date(item.endDate).toLocaleString() : 'Em Andamento'}
            </Text>
          </View>
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
