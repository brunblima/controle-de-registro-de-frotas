import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {useAuth} from '../../context/AuthContext';

export default function LoginScreen() {
  const {signInWithEmailAndPassword} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);

    if (!email || !password) {
      Alert.alert('Erro de Login', 'Por favor, preencha todos os campos.');
      setIsLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(email, password);
    } catch (error) {
      console.error('Erro de login:', error);
    } finally {
      setIsLoading(false); // Garante que isLoading seja sempre definido como false
    }
  };

  return (
    <View style={styles.container}>
      <Animatable.View
        delay={600}
        animation="fadeInDown"
        style={styles.viewLogo}>
        <Image
          source={require('../../assets/Ane_gota_branca.png')}
          style={{width: '60%'}}
          resizeMode="contain"
        />
      </Animatable.View>

      <Animatable.View
        delay={600}
        animation="fadeInUp"
        style={styles.viewInput}>
        <Text style={styles.title}>E-mail</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Digite o seu e-mail"
          placeholderTextColor="#A9A9A9" // Cor do placeholder
          onChangeText={text => setEmail(text)}
          value={email}
        />

        <Text style={styles.title}>Senha</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Digite a sua senha"
          placeholderTextColor="#A9A9A9" // Cor do placeholder
          secureTextEntry={true}
          onChangeText={text => setPassword(text)}
          value={password}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  viewLogo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
    backgroundColor: '#319DD9',
  },
  viewInput: {
    flex: 2,
    paddingStart: '10%',
    paddingEnd: '10%',
  },
  title: {
    fontSize: 18,
    marginTop: 10,
    fontWeight: 'bold',
    color: '#242424',
  },
  textInput: {
    height: 50,
    width: '100%',
    borderBottomWidth: 1.1,
    color: '#242424',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    height: 50,
    width: '100%',
    borderRadius: 50,
    backgroundColor: '#1D4696',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%', // Centralizar verticalmente
    left: '50%', // Centralizar horizontalmente
    transform: [{translateX: -25}, {translateY: -25}], // Ajustar o posicionamento
  },
});
