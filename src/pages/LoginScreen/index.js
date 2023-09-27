import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import {useAuth} from '../../context/AuthContext';
import firebase from '../../services/firebaseConfig';

export default function LoginScreen() {
  const {signInWithEmailAndPassword} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  // const checkIfUserExists = async email => {
  //   try {
  //     const methods = await firebase.auth().fetchSignInMethodsForEmail(email);
  //     // Se o e-mail não estiver associado a nenhum método de login, ele não existe
  //     if (methods.length === 0) {
  //       return false;
  //     }
  //     return true; // O e-mail existe
  //   } catch (error) {
  //     console.error('Erro ao verificar se o e-mail existe:', error);
  //     return false; // Tratamento de erro
  //   }
  // };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro de Login', 'Por favor, preencha todos os campos.');
      return; // Impede a tentativa de login com campos em branco
    }
    await signInWithEmailAndPassword(email, password);
  };
    // const userExists = await checkIfUserExists(email);

    // if (!userExists) {
    //   Alert.alert(
    //     'Erro de Login',
    //     'Usuário não cadastrado. Por favor, verifique suas credenciais ou crie uma conta.',
    //   );
    //   return; // Impede a tentativa de login se o usuário não existir
    // }
     
  

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
          onChangeText={text => setEmail(text)}
          value={email}></TextInput>

        <Text style={styles.title}>Senha</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Digite a sua senha"
          secureTextEntry={true}
          onChangeText={text => setPassword(text)}
          value={password}></TextInput>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  textInput: {
    height: 50,
    width: '100%',
    borderBottomWidth: 1.1,
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
});
