import React, {useState} from 'react';
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

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const {user, signOut, setUser} = useAuth();
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
  const [isTracking, setIsTracking] = useState(false);
  const [observation, setObservation] = useState('');
  const [isObservationEnabled, setIsObservationEnabled] = useState(true);
  const navigation = useNavigation();
  const [isToggleAllChecked, setIsToggleAllChecked] = useState(false);

  const handleViewHistorico = () => {
    navigation.navigate('History', {startDate, endDate, selectedOption});
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirmação',
      'Tem certeza de que deseja sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel', // Estilo do botão para cancelar
        },
        {
          text: 'Sair',
          onPress: async () => {
            try {
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

  //Essa função irá selecionar ou desmarcar todos os checkbox
  const handleToggleAllCheckboxes = () => {
    if (!isTracking) {
      const updatedItems = checklistItems.map(item => ({
        ...item,
        checked: !isToggleAllChecked, // Usar o estado do botão
      }));
      setChecklistItems(updatedItems);
      setIsToggleAllChecked(!isToggleAllChecked); // Alternar o estado do botão
    }
  };

  //Essa função irá alterar o valor do Picker
  const handlePickerChange = value => {
    if (!isTracking) {
      setSelectedOption(value);
    }
  };

  const handleChecklistChange = index => {
    if (!isTracking) {
      const updatedItems = [...checklistItems];
      updatedItems[index].checked = !updatedItems[index].checked;
      setChecklistItems(updatedItems);
    }
  };

  //Essa é a função do botão 'Iniciar/Finalizar
  const handleTrackingToggle = async () => {
    setIsLoading(true);
    const user = firebase.auth().currentUser; // Obtenha o usuário autenticado

    if (isTracking) {
      setIsObservationEnabled(false);
      const end = new Date();
      const endString = end.toISOString();
      setEndDate(endString);

      // Consulta a coleção para obter o último sequenceId
      const querySnapshot = await firestore()
        .collection('trackingData')
        .where('userId', '==', user.uid)
        .limit(1)
        .get();

      try {
        // Define o novo documento com o sequenceId incrementado
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
          'Após finalizar o percurso, você será deslogado, para que o proximo usuario entre.',
          [
            {
              text: 'OK',
              onPress: async () => {
                setIsLoading(false); // Desativar o indicador de loading
                signOut(true); // Deslogar o usuário após o aviso
              },
            },
          ],
        );
      } catch (error) {
        console.error('Erro ao salvar os dados no Firestore:', error);
        setIsLoading(false);
      }

      // Redefine o estado de checklistItems para false
      const resetChecklistItems = checklistItems.map(item => ({
        ...item,
        checked: false,
      }));

      // Redefine selectedOption para 'opcao0'
      setSelectedOption('opcao0');
      setChecklistItems(resetChecklistItems);
      setObservation('');
      setIsObservationEnabled(true);
    } else {
      if (!verificarPlacaSelecionada() || !verificarCheckboxesMarcados()) {
        return;
      }
      const start = new Date();
      const startString = start.toISOString();
      setStartDate(startString);
      setIsObservationEnabled(false);
    }
    setIsLoading(false);
    setIsTracking(!isTracking);
  };
  //Essa função verifica se alguma placa valida foi selecionada
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

  //Essa função verifica se todos os checkbox foram selecionados
  const verificarCheckboxesMarcados = () => {
    const isAllChecked = checklistItems.every(item => item.checked);
    if (!isAllChecked) {
      Alert.alert(
        'Aviso',
        'É necessario está com os conformes de acordo com a lista de verificação.',
      );
      return false;
    }
    return true;
  };

  const getDisabledStyle = () => {
    return isTracking ? styles.disabled : null;
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
          enabled={!isTracking} // Desabilitar o Picker quando estiver rastreando
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
          onChangeText={text => setObservation(text)}
          value={observation}
          placeholder="Adicione uma observação (opcional)"
          editable={isObservationEnabled}
          multiline={true}
          numberOfLines={10}
        />
      </ScrollView>
      <TouchableOpacity
        style={[styles.start, isTracking ? styles.finish : null]}
        onPress={handleTrackingToggle}>
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
    alignSelf: 'flex-end',
    marginLeft: 140,
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
});
