import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, StyleSheet, ScrollView} from 'react-native';
import firebase from '../../services/firebaseConfig';

export default function HistoryScreen({route}) {
  const {selectedOption} = route.params;
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    const user = firebase.auth().currentUser;

    if (user) {
      firebase
        .firestore()
        .collection('trackingData')
        .where('userId', '==', user.uid)
        .get()
        .then(querySnapshot => {
          const userHistory = [];

          querySnapshot.forEach(doc => {
            const data = doc.data();
            userHistory.push({
              id: doc.id,
              selectedOption: data.selectedOption,
              startDate: data.startDate,
              endDate: data.endDate,
              observation: data.observation,
              sequenceId: data.sequenceId || 0,
            });
          });
          
          userHistory.sort((a, b) => {
            return new Date(b.endDate) - new Date(a.endDate);
            
          });
          setHistorico(userHistory);
        })
        .catch(error => {
          console.error('Erro ao buscar histórico:', error);
        });
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.tittle}>Histórico de Uso do Veículo</Text>
      <FlatList
        data={historico}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.item}>
            <Text>Placa do Veículo: {item.selectedOption}</Text>
            <Text>
              Data de Início: {new Date(item.startDate).toLocaleString()}
            </Text>
            <Text>
              Data de Fim:{' '}
              {item.endDate
                ? new Date(item.endDate).toLocaleString()
                : 'Em Andamento'}
            </Text>
            <Text>
              Observação: {item.observation}
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
  tittle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingBottom: 16,
  },
  item: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 8,
  },
});
