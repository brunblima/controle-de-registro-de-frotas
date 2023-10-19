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
import CheckBox from '@react-native-community/checkbox';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import firestore from '@react-native-firebase/firestore';
import firebase from '../../services/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const {signOut} = useAuth();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedOption, setSelectedOption] = useState('opcao0');
  const [checklistItems, setChecklistItems] = useState([
    {label: 'Chave de Roda', checked: false},
    {label: 'Pneus/Step', checked: false},
    {label: 'Triângulo', checked: false},
    {label: 'Macaco', checked: false},
    {label: 'Pala Interna/Parasol', checked: false},
    {label: 'Pisca Alerta', checked: false},
    {label: 'Freios', checked: false},
    {label: 'Buzina', checked: false},
    {label: 'Cinto de Segurança', checked: false},
    {label: 'Velocimetro', checked: false},
    {label: 'Parabrisa/Vidros', checked: false},
    {label: 'Limpador de Parabrisa', checked: false},
    {label: 'Faróis/Lanternas', checked: false},
    {label: 'Placas', checked: false},
    {label: 'Parachoque', checked: false},
    {label: 'Estofado', checked: false},
    {label: 'Tapetes', checked: false},
    {label: 'Funilaria/Pintura', checked: false},
    {label: 'Documento (CNH/CRLV)', checked: false},
    {label: 'Direção Defensiva', checked: false},
    {
      label: 'Condutor sem ingestão de alcool e/ou medicamentos',
      checked: false,
    },
    {
      label: 'Condições (Fisica, mental e emocional) do condutor',
      checked: false,
    },
  ]);
  const [isTracking, setIsTracking] = useState();
  const [observation, setObservation] = useState('');
  const [isObservationEnabled, setIsObservationEnabled] = useState(true);
  const navigation = useNavigation();
  const [isToggleAllChecked, setIsToggleAllChecked] = useState(false);

  const handleViewHistorico = () => {
    navigation.navigate('History', {startDate, endDate, selectedOption});
  };
  
  useEffect(() => {
    loadData();
  }, []);

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

  const handleToggleAllCheckboxes = () => {
    if (!isTracking) {
      const updatedItems = checklistItems.map(item => ({
        ...item,
        checked: !isToggleAllChecked,
      }));
      setChecklistItems(updatedItems);
      setIsToggleAllChecked(!isToggleAllChecked);
    }
  };

  const handlePickerChange = async value => {
    if (!isTracking) {
      setSelectedOption(value);
      const dataToSave = {
        startDate,
        endDate,
        selectedOption: value,
        checklistItems,
        isTracking,
        observation,
        isObservationEnabled,
      };
      await saveData(dataToSave); // Use 'await' para garantir que o salvamento seja concluído antes de continuar
    }
  };
  

  const handleChecklistChange = async (index) => {
    if (!isTracking) {
      const updatedItems = [...checklistItems];
      updatedItems[index].checked = !updatedItems[index].checked;
      setChecklistItems(updatedItems);
  
      const dataToSave = {
        startDate,
        endDate,
        selectedOption,
        checklistItems: updatedItems,
        isTracking,
        observation,
        isObservationEnabled,
      };
      
      // Salvar os dados atualizados no AsyncStorage
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

  //Função antiga do botão
  const handleTrackingToggle = async () => {
    setIsLoading(true);

    const user = firebase.auth().currentUser;

    const start = new Date();
    const startString = start.toISOString();
    setStartDate(startString);

    if (isTracking) {
      const end = new Date();
      const endString = end.toISOString();
      setEndDate(endString);

      try {
        await firestore().collection('trackingData').add({
          userId: user.uid,
          email: user.email,
          startDate,
          endDate: endString,
          selectedOption,
          observation,
        });
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
                await AsyncStorage.removeItem('userData');
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
        checked: false,
      }));

      setSelectedOption('opcao0');
      setChecklistItems(resetChecklistItems);
      setObservation('');
      setIsObservationEnabled(true);
    } else {
      if (!verificarPlacaSelecionada() || !verificarCheckboxesMarcados()) {
        setIsLoading(false);
        return;
      }
      setIsObservationEnabled(false);
      setIsTracking(true);
    }
    saveData();
    setIsLoading(false);
  };

  const verificarPlacaSelecionada = () => {
    if (selectedOption === 'opcao0') {
      Alert.alert(
        'Aviso',
        'Selecione uma placa válida antes de iniciar o percurso.',
      );
      return false;
    }
    return true;
  };

  const verificarCheckboxesMarcados = () => {
    const isAllChecked = checklistItems.every(item => item.checked);
    if (!isAllChecked) {
      Alert.alert(
        'Aviso',
        'É necessário estar conforme de acordo com a lista de verificação.',
      );
      return false;
    }
    return true;
  };

  const getDisabledStyle = () => {
    return isTracking ? styles.disabled : null;
  };

  const saveData = async (data) => {
    try {
      if (data) {
        console.log(data);
        await AsyncStorage.setItem('userData', JSON.stringify(data));
      } else {
        // Trate o caso em que 'data' é null ou undefined, se necessário.
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
        setSelectedOption(parsedData.selectedOption);
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
    if (!verificarPlacaSelecionada() || !verificarCheckboxesMarcados()) {
      setIsLoading(false);
      return;
    }
    const start = new Date();
    const startString = start.toISOString();
    setStartDate(startString);

    setIsLoading(false);

    const updatedIsObeservationEnabled = false;
    setIsObservationEnabled(updatedIsObeservationEnabled)
    const updatedIsTracking = true;
    setIsTracking(updatedIsTracking);

    const dataToSave = {
      startDate: startString,
      endDate,
      selectedOption,
      checklistItems,
      isTracking: updatedIsTracking, 
      observation,
      isObservationEnabled: updatedIsObeservationEnabled,
    };
    
    // Salva os dados atualizados no AsyncStorage
    await saveData(dataToSave);

  };
  const handleStopTracking = async () => {
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
        selectedOption,
        observation,
        checklistItems,
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
        ]
      );
    } catch (error) {
      console.error('Erro ao salvar os dados no Firestore:', error);
      setIsLoading(false);
    }
    const resetChecklistItems = checklistItems.map(item => ({
      ...item,
      checked: false,
    }));
    // Redefina os estados para os valores iniciais
    setStartDate(null);
    setEndDate(null);
    setSelectedOption('opcao0');
    setChecklistItems(resetChecklistItems);
    setObservation('');
    setIsObservationEnabled(true);
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Registro de Frota</Text>
          <TouchableOpacity style={styles.logout} onPress={handleLogout}>
            <Text style={styles.textLogout}>Sair</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Selecione a Placa de Veiculo:</Text>
        <Picker
          selectedValue={selectedOption}
          onValueChange={handlePickerChange}
          enabled={!isTracking}
          style={[{color: '#242424'}, getDisabledStyle()]}>
          <Picker.Item label="Nenhuma opção selecionada" value="opcao0" />
          <Picker.Item label="RNX7D00" value="RNX7D00" />
          <Picker.Item label="RNU2C66" value="RNU2C66" />
          <Picker.Item label="RTB0E67" value="RTB0E67" />
          <Picker.Item label="RTE2I68" value="RTE2I68" />
          <Picker.Item label="RVG6E70" value="RVG6E70" />
          <Picker.Item label="RVL8D62" value="RVL8D62" />
          <Picker.Item label="RVQ3F64" value="RVQ3F64" />
          <Picker.Item label="SIB2H46" value="SIB2H46" />
          <Picker.Item label="QQJ5615" value="QQJ5615" />
          <Picker.Item label="RUL1B06" value="RUL1B06" />
          <Picker.Item label="FLV5A34" value="FLV5A34" />
          <Picker.Item label="RNL5B43" value="RNL5B43" />
          <Picker.Item label="RNT8I57" value="RNT8I57" />
          <Picker.Item label="RUK7I52" value="RUK7I52" />
          <Picker.Item label="RUU5G79" value="RUU5G79" />
          <Picker.Item label="RVG8E68" value="RVG8E68" />
          <Picker.Item label="RVL0J09" value="RVL0J09" />
          <Picker.Item label="RVP6C76" value="RVP6C76" />
          <Picker.Item label="RVV9I52" value="RVV9I52" />
          <Picker.Item label="SDW4H71" value="SDW4H71" />
          <Picker.Item label="SIB6I29" value="SIB6I29" />
        </Picker>

        <View style={styles.viewTitle}>
          <Text style={styles.label}>Lista de Verificação:</Text>
          <TouchableOpacity
            style={[styles.toggleButton, getDisabledStyle()]}
            onPress={handleToggleAllCheckboxes}
            disabled={isTracking}>
            <Text style={styles.toggleButtonText}>Marcar/Desmarcar Todos</Text>
          </TouchableOpacity>
        </View>

        {checklistItems.map((item, index) => (
          <View key={index} style={[styles.checklistItem, getDisabledStyle()]}>
            <CheckBox
              disabled={isTracking}
              value={item.checked}
              onValueChange={() => handleChecklistChange(index)}
              tintColors={{true: '#242424', false: '#242424'}}
            />
            <Text style={styles.checkbox}>{item.label}</Text>
          </View>
        ))}
        <Text style={styles.label}>Observação:</Text>
        <TextInput
          style={[styles.input, isObservationEnabled ? null : styles.disabled]}
          placeholderTextColor="#808080"
          onChangeText={text => {
            setObservation(text); // Atualize a observação
            saveData(); // Salve a observação após a atualização
          }}
          value={observation}
          placeholder="Adicione uma observação (opcional)"
          editable={isObservationEnabled}
          multiline={true}
          numberOfLines={10}
        />
      </ScrollView>
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
  checklist: {
    marginTop: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
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
    marginTop: 10,
  },
  textStar: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  permissionDeniedText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
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
  checkbox: {
    color: '#242424',
  },
  disabled: {
    opacity: 0.5,
  },
});
