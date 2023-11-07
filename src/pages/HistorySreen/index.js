import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import firebase from '../../services/firebaseConfig';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import XLSX from 'xlsx';
import { request, PERMISSIONS } from 'react-native-permissions';

export default function HistoryScreen({ route }) {
  const { selectedOption } = route.params;
  const [historico, setHistorico] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const user = firebase.auth().currentUser;

    if (user) {
      const query =
        user.email === 'root@ane.com.br'
          ? firebase.firestore().collection('trackingData')
          : firebase
              .firestore()
              .collection('trackingData')
              .where('userId', '==', user.uid);

      query
        .get()
        .then((querySnapshot) => {
          const userHistory = [];

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            userHistory.push({
              id: doc.id,
              email: data.email,
              selectedOption: data.selectedVehicle,
              startKM: data.startKM,
              endKM: data.endKM,
              startDate: data.startDate,
              endDate: data.endDate,
              observation: data.observation,
              checkListItems: data.checklistItems,
            });
          });

          userHistory.sort((a, b) => {
            return new Date(b.endDate) - new Date(a.endDate);
          });

          setHistorico(userHistory);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Erro ao buscar histórico:', error);
        });
    }
  }, []);

  const exportToExcel = async () => {
    // Solicitar permissão de armazenamento
    const permissionStatus = await request(
      PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
    );

    if (permissionStatus === 'granted') {
      // Mapeamento dos nomes das colunas
      const columnMapping = {
        id: 'ID',
        email: 'Email',
        selectedVehicle: 'Placa do Veiculo',
        startKM: 'KM Inicial',
        endKM: 'KM Final',
        startDate: 'Data de Início',
        endDate: 'Data de Fim',
        observation: 'Observação',
        checkListItems: 'Lista de Verificação',
      };

      // Renomear as colunas e processar a lista de verificação
      const historicoComNomesDeColuna = historico.map((item) => {
        const newItem = {};
        for (const key in item) {
          if (columnMapping[key]) {
            newItem[columnMapping[key]] = key === 'checkListItems'
              ? item[key].map((checklistItem) => `${checklistItem.label}: ${checklistItem.status}`).join('\n')
              : item[key];
          }
        }
        return newItem;
      });

      const worksheet = XLSX.utils.json_to_sheet(historicoComNomesDeColuna);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Histórico');

      // Caminho para o arquivo Excel na pasta temporária
      const tempExcelPath = `${RNFS.TemporaryDirectoryPath}/historico.xlsx`;

      // Caminho para o arquivo Excel na pasta de compartilhamento externa
      const sharedExcelPath = `${RNFS.ExternalDirectoryPath}/historico.xlsx`;

      try {
        // Converte o arquivo Excel para uma string
        const excelData = XLSX.write(workbook, {
          bookType: 'xlsx',
          type: 'base64',
        });

        // Cria o arquivo Excel na pasta temporária
        await RNFS.writeFile(tempExcelPath, excelData, 'base64');

        // Move o arquivo temporário para a pasta de compartilhamento externa
        await RNFS.moveFile(tempExcelPath, sharedExcelPath);

        // Compartilha o arquivo Excel internamente no aplicativo
        await Share.open({
          url: `file://${sharedExcelPath}`,
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
      } catch (error) {
        // Ignora o erro "User did not share"
      }
    } else {
      console.log('Permissão de armazenamento negada');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titlePage}>Histórico de Uso do Veículo</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={exportToExcel}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>EXPORTAR PARA EXCEL</Text>
        )}
      </TouchableOpacity>
      <FlatList
        data={historico}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.title}>Usuario: {item.email}</Text>
            <Text style={styles.title}>
              Placa do Veículo: {item.selectedOption}
            </Text>
            <Text style={styles.title}>KM inicial: {item.startKM}</Text>
            <Text style={styles.title}>KM final: {item.endKM}</Text>
            <Text style={styles.title}>
              Data de Início: {new Date(item.startDate).toLocaleString()}
            </Text>
            <Text style={styles.title}>
              Data de Fim: {new Date(item.endDate).toLocaleString()}
            </Text>
            <Text style={styles.title}>Lista de Verificação:</Text>
            <FlatList
              data={item.checkListItems}
              keyExtractor={(checklistItem, index) => `checklist-${index}`}
              renderItem={({ item: checklistItem }) => (
                <Text style={styles.content}>
                  - <Text style={styles.boldLabel}>{checklistItem.label}:</Text>{' '}
                  {checklistItem.status}
                </Text>
              )}
            />
            <Text style={styles.title}>
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
    backgroundColor: '#fff',
  },
  titlePage: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingBottom: 16,
    color: '#242424',
  },
  item: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 8,
  },
  button: {
    height: 40,
    width: '100%',
    borderRadius: 50,
    backgroundColor: '#1D4696',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },

  title: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 15,
  },
  content: {
    color: '#242424',
    fontSize: 15,
  },
  boldLabel: {
    fontWeight: 'bold',
  },
});
