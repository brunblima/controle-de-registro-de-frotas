import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import firestore from '@react-native-firebase/firestore';
import firebase from '../../services/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';

import PickerVehicles from '../../components/forms/vechicle';

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const {signOut} = useAuth();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [checklistItems, setChecklistItems] = useState([
    {label: 'Chave de Roda', status: ''},
    {label: 'Pneus/Step', status: ''},
    {label: 'Triângulo', status: ''},
    {label: 'Macaco', status: ''},
    {label: 'Pala Interna/Parasol', status: ''},
    {label: 'Pisca Alerta', status: ''},
    {label: 'Freios', status: ''},
    {label: 'Buzina', status: ''},
    {label: 'Cinto de Segurança', status: ''},
    {label: 'Velocimetro', status: ''},
    {label: 'Parabrisa/Vidros', status: ''},
    {label: 'Limpador de Parabrisa', status: ''},
    {label: 'Faróis/Lanternas', status: ''},
    {label: 'Placas', status: ''},
    {label: 'Parachoque', status: ''},
    {label: 'Estofado', status: ''},
    {label: 'Tapetes', status: ''},
    {label: 'Funilaria/Pintura', status: ''},
    {label: 'Documento (CNH/CRLV)', status: ''},
    {label: 'Direção Defensiva', status: ''},
    {
      label: 'Condutor sem ingestão de alcool e/ou medicamentos',
      status: '',
    },
    {
      label: 'Condições (Fisica, mental e emocional) do condutor',
      status: '',
    },
  ]);
  const [isTracking, setIsTracking] = useState();
  const [observation, setObservation] = useState('');
  const [isObservationEnabled, setIsObservationEnabled] = useState(true);
  const navigation = useNavigation();
  const [startKM, setStartKM] = useState('');
  const [endKM, setEndKM] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('opcao0');

  const handleViewHistorico = () => {
    navigation.navigate('History', {
      startDate,
      endDate,
      selectedVehicle,
      checklistItems,
    });
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirmação',
      'Tem certeza de que deseja sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userData');
              await signOut(true);
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
            }
          },
        },
      ],
      {cancelable: false},
    );
  };

  const handleSetAllConforme = () => {
    if (!isTracking) {
      const updatedItems = checklistItems.map(item => ({
        ...item,
        status: 'Conforme',
      }));
      setChecklistItems(updatedItems);
    }
  };

  const handleChecklistChange = async (index, status) => {
    if (!isTracking) {
      const updatedItems = [...checklistItems];
      updatedItems[index].status = status;
      setChecklistItems(updatedItems);

      const dataToSave = {
        startDate,
        endDate,
        selectedVehicle,
        startKM,
        endKM,
        checklistItems: updatedItems,
        isTracking,
        observation,
        isObservationEnabled,
      };

      await saveData(dataToSave);
    }
  };

  const handleCancelTracking = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      setIsTracking(!isTracking);
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao limpar os dados:', error);
    }
    setIsLoading(false);
  };

  const verificarPlacaSelecionada = () => {
    if (selectedVehicle === 'opcao0') {
      Alert.alert(
        'Aviso',
        'Selecione uma placa válida antes de iniciar o percurso.',
      );
      return false;
    }
    return true;
  };

  const verificarQuilometragemPreenchida = () => {
    if (selectedVehicle !== 'opcao0' && startKM === '') {
      Alert.alert(
        'Aviso',
        'Você deve preencher a quilometragem antes de iniciar o percurso.',
      );
      return false;
    }
    return true;
  };

  const checkChecklistItems = () => {
    for (const item of checklistItems) {
      if (item.status === 'opcao0') {
        Alert.alert(
          'Aviso',
          'É necessario que a lista de verificação esteja totalmente preenchida.',
        );
        return false;
      }
    }
    return true;
  };

  const getDisabledStyle = () => {
    return isTracking ? styles.disabled : null;
  };

  const saveData = async data => {
    try {
      if (data) {
        await AsyncStorage.setItem('userData', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Erro ao salvar os dados:', error);
    }
  };

  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const parsedData = JSON.parse(data);
        setStartDate(parsedData.startDate);
        setEndDate(parsedData.endDate);
        setSelectedVehicle(parsedData.selectedVehicle);
        setStartKM(parsedData.startKM);
        setEndKM(parsedData.endKM);
        setChecklistItems(parsedData.checklistItems);
        setObservation(parsedData.observation);
        setIsObservationEnabled(parsedData.isObservationEnabled);
        setIsTracking(parsedData.isTracking);
      } 
    } catch (error) {
      console.error('Erro ao carregar os dados:', error);
    }
  };

  const handleStartTracking = async () => {
    if (
      !verificarPlacaSelecionada() ||
      !checkChecklistItems() ||
      !verificarQuilometragemPreenchida()
    ) {
      setIsLoading(false);
      return;
    }
    const start = new Date();
    const startString = start.toISOString();
    setStartDate(startString);

    setIsLoading(false);

    const updatedIsObeservationEnabled = false;
    setIsObservationEnabled(updatedIsObeservationEnabled);
    const updatedIsTracking = true;
    setIsTracking(updatedIsTracking);

    const dataToSave = {
      startDate: startString,
      endDate,
      selectedVehicle,
      startKM,
      endKM,
      checklistItems,
      isTracking: updatedIsTracking,
      observation,
      isObservationEnabled: updatedIsObeservationEnabled,
    };

    await saveData(dataToSave);
  };

  const handleStopTracking = async () => {
    setModalVisible(true);
  };

  const handleConfirmEndTracking = async () => {
    // Verifique se o campo de quilometragem final está preenchido
    if (!endKM) {
      Alert.alert('Aviso', 'Por favor, preencha a quilometragem final.');
      return;
    }

    // Verifique se o KM final é maior ou igual ao KM inicial
    if (parseInt(endKM) < parseInt(startKM)) {
      Alert.alert(
        'Aviso',
        'A quilometragem final não pode ser menor que a quilometragem inicial.',
      );
      return;
    }

    setIsLoading(true);

    const end = new Date();
    const endString = end.toISOString();
    setEndDate(endString);

    const user = firebase.auth().currentUser;
    try {
      await firestore().collection('trackingData').add({
        userId: user.uid,
        email: user.email,
        startDate,
        endDate: endString,
        selectedVehicle,
        observation,
        checklistItems,
        startKM,
        endKM,
      });

      // Remova os dados do AsyncStorage
      await AsyncStorage.removeItem('userData');

      // Mostrar o seu Alert personalizado após o envio bem-sucedido
      Alert.alert(
        'Percurso Finalizado',
        'Após finalizar o percurso, você será deslogado, para que o próximo usuário entre.',
        [
          {
            text: 'Cancelar',
            onPress: () => handleCancelTracking(),
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: async () => {
              setIsTracking(!isTracking);
              setIsLoading(false);
              signOut(true);
            },
          },
        ],
      );
    } catch (error) {
      console.error('Erro ao salvar os dados no Firestore:', error);
      setIsLoading(false);
    }

    const resetChecklistItems = checklistItems.map(item => ({
      ...item,
      status: 'opcao0',
    }));
    
    setStartDate(null);
    setEndDate(null);
    setChecklistItems(resetChecklistItems);
    setSelectedVehicle('opcao0');
    setObservation('');
    setStartKM('');
    setEndKM('');
    setIsObservationEnabled(true);
    setIsLoading(false);
    setModalVisible(false);
  };

  const setEndKMValue = text => {
    setEndKM(text);
  };

  const handleSelectedValueChange = async (itemValue) => {
    setSelectedVehicle(itemValue);
    const dataToSave = {
      startDate,
      endDate,
      selectedVehicle: itemValue,
      startKM,
      endKM,
      checklistItems,
      isTracking,
      observation,
      isObservationEnabled,
    };

    await saveData(dataToSave);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Registro de Percurso</Text>
          <TouchableOpacity style={styles.logout} onPress={handleLogout}>
            <Text style={styles.textLogout}>Sair</Text>
          </TouchableOpacity>
        </View>

        <PickerVehicles
          style={[styles.picker, getDisabledStyle()]}
          onValueChange={handleSelectedValueChange}
          enabled={!isTracking}
          selectedVehicle={selectedVehicle}
          dropdownIconColor="#1D4696"
        />

        <View style={styles.viewKM}>
          <Text style={styles.label}>Quilomatragem ao inicio do percurso</Text>
          <TextInput
            style={[
              {color: '#121212', borderWidth: 1, borderRadius: 50, padding: 12, marginBottom: 10, marginTop: 10, paddingLeft: 20},
              isObservationEnabled ? null : styles.disabled,
            ]}
            placeholderTextColor="#808080"
            placeholder="Digite o KM inicial"
            keyboardType="numeric"
            value={startKM}
            maxLength={6}
            onChangeText={text => {
              setStartKM(text);
              saveData();
            }}
            editable={!isTracking}
          />
        </View>

        <View style={styles.viewTitle}>
          <Text style={styles.label}>Lista de Verificação:</Text>
          <TouchableOpacity
            style={[styles.toggleButton, getDisabledStyle()]}
            onPress={handleSetAllConforme}
            disabled={isTracking}>
            <Text style={styles.toggleButtonText}>Selecionar conforme</Text>
          </TouchableOpacity>
        </View>

        {checklistItems.map((item, index) => (
          <View
            key={index}
            style={[styles.pickerContainer, getDisabledStyle()]}>
            <Text style={styles.listTitle}>{item.label}</Text>
            <Picker
              selectedValue={item.status}
              onValueChange={value => handleChecklistChange(index, value)}
              style={[styles.picker, getDisabledStyle()]}
              enabled={!isTracking}
              dropdownIconColor={'#1D4696'}>
              <Picker.Item label="Nehuma opção selecionada" value="opcao0" />
              <Picker.Item label="Conforme" value="Conforme" />
              <Picker.Item label="Não Conforme" value="NaoConforme" />
              <Picker.Item label="Não Aplicável" value="NaoAplicavel" />
            </Picker>
          </View>
        ))}
      </ScrollView>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.label}>Quilometragem final:</Text>
          <TextInput
            style={{color: '#121212', borderWidth: 1, borderRadius: 20, paddingLeft: 15, marginTop: 10}}
            placeholderTextColor={'#808080'}
            placeholder="Digite o KM final"
            keyboardType="numeric"
            value={endKM}
            maxLength={6}
            onChangeText={setEndKMValue}
          />
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmEndTracking}>
            <Text style={styles.confirmButtonText}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <TouchableOpacity
        style={[styles.start, isTracking ? styles.finish : null]}
        onPress={isTracking ? handleStopTracking : handleStartTracking}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#FFF" />
        ) : (
          <Text style={styles.textStar}>
            {isTracking ? 'Finalizar' : 'Iniciar'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.viewHistorico}
        onPress={handleViewHistorico}>
        <Text style={styles.textHistory}>Ver Histórico</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#242424',
  },
  logout: {
    height: 30,
    width: 60,
    marginLeft: 'auto',
    backgroundColor: '#1D4696',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textLogout: {
    color: '#fff',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#242424',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#121212',
    borderRadius: 10,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#121212',
  },
  input: {
    height: 120,
    borderWidth: 1,
    borderColor: 'gray',
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 16,
    marginTop: 10,
    color: '#121212',
  },
  start: {
    height: 50,
    width: '100%',
    borderRadius: 50,
    backgroundColor: '#1D4696',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 5,
  },
  textStar: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewTitle: {
    flexDirection: 'row',
  },
  toggleButton: {
    flexDirection: 'row',
    paddingVertical: 2,
    paddingHorizontal: 16,
    marginBottom: 15,
  },
  toggleButtonText: {
    color: '#1D4696',
    paddingLeft: '12%',
  },
  finish: {
    backgroundColor: 'red',
  },
  viewHistorico: {
    height: 30,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textHistory: {
    color: '#121212',
    fontWeight: 'bold',
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -25}, {translateY: -25}],
  },
  disabled: {
    opacity: 0.5,
  },
  listTitle: {
    color: '#121212',
    fontSize: 16,
    paddingLeft: 5,
    paddingTop: 5,
  },
  confirmButton: {
    backgroundColor: '#1D4696',
    padding: 12,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20
  },
});
