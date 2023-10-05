import React, {useState, useEffect} from 'react';
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
import {request, PERMISSIONS} from 'react-native-permissions';

export default function HistoryScreen({route}) {
  const {selectedOption} = route.params;
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
        .then(querySnapshot => {
          const userHistory = [];

          querySnapshot.forEach(doc => {
            const data = doc.data();
            userHistory.push({
              id: doc.id,
              email: data.email,
              selectedOption: data.selectedOption,
              startDate: data.startDate,
              endDate: data.endDate,
              observation: data.observation,
            });
          });

          userHistory.sort((a, b) => {
            return new Date(b.endDate) - new Date(a.endDate);
          });

          setHistorico(userHistory);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Erro ao buscar histórico:', error);
        });
    }
  }, []);

  const exportToExcel = async () => {
    // Solicitar permissão de armazenamento
    const permissionStatus = await request(
      PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
    );

    if (permissionStatus === 'granted') {
      // Mapeamento dos nomes das colunas
      const columnMapping = {
        id: 'ID',
        email: 'Email',
        selectedOption: 'Placa do Veiculo',
        startDate: 'Data de Início',
        endDate: 'Data de Fim',
        observation: 'Observação',
      };

      // Renomear as colunas
      const historicoComNomesDeColuna = historico.map(item => {
        const newItem = {};
        for (const key in item) {
          if (columnMapping[key]) {
            newItem[columnMapping[key]] = item[key];
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
        Share.open({
          url: `file://${sharedExcelPath}`,
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
      } catch (error) {
        console.error('Erro ao exportar para Excel:', error);
      }
    } else {
      console.log('Permissão de armazenamento negada');
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.tittle}>Histórico de Uso do Veículo</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={exportToExcel}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>EXPORTAR PARA EXCEL</Text>
        )}
      </TouchableOpacity>
      <FlatList
        data={historico}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.item}>
            <Text style={{color: '#242424'}}>Usuario: {item.email}</Text>
            <Text style={{color: '#242424'}}>
              Placa do Veículo: {item.selectedOption}
            </Text>
            <Text style={{color: '#242424'}}>
              Data de Início: {new Date(item.startDate).toLocaleString()}
            </Text>
            <Text style={{color: '#242424'}}>
              Data de Fim:{' '}
              {item.endDate
                ? new Date(item.endDate).toLocaleString()
                : 'Em Andamento'}
            </Text>
            <Text style={{color: '#242424'}}>
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
  tittle: {
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
});
