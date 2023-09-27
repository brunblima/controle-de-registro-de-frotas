import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import CheckBox from '@react-native-community/checkbox';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen() {

  const { user, signOut } = useAuth();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedOption, setSelectedOption] = useState('opcao0'); // Estado para o selecionador
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

  const handleViewHistorico = () => {
    navigation.navigate('History', {startDate, endDate, selectedOption});
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigation.navigate('Login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  //Essa função irá selecionar ou desmarcar todos os checkbox
  const handleToggleAllCheckboxes = () => {
    if (!isTracking) {
      const updatedItems = checklistItems.map(item => ({
        ...item,
        checked: !checklistItems.every(item => item.checked),
      }));
      setChecklistItems(updatedItems);
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

  const handleTrackingToggle = () => {
    if (isTracking) {
      setIsObservationEnabled(false);
      const end = new Date();
      const endString = end.toISOString();
      setEndDate(endString);
    } else {
      if (!verificarPlacaSelecionada() || !verificarCheckboxesMarcados()) {
        return;
      }
      const start = new Date();
      const startString = start.toISOString();
      setStartDate(startString);

      setIsObservationEnabled(false);
    }
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
        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <Text style={styles.textLogout}>Sair</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Selecione a Placa de Veiculo:</Text>
        <Picker
          selectedValue={selectedOption}
          onValueChange={handlePickerChange}
          enabled={!isTracking} // Desabilitar o Picker quando estiver rastreando
          style={getDisabledStyle()} // Aplicar estilo condicional
        >
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
            />
            <Text>{item.label}</Text>
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
        <Text style={styles.textStar}>
          {isTracking ? 'Finalizar' : 'Iniciar'}
        </Text>
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
  },
  logout: {
    height: 30,
    width: 60,
    alignSelf:'flex-end',
    backgroundColor: '#1D4696',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textLogout:{
    color: '#fff',
    fontWeight: 'bold'
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  checklist: {
    marginTop: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    height: 120,
    borderWidth: 1,
    borderColor: 'gray',
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 16,
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
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
});
