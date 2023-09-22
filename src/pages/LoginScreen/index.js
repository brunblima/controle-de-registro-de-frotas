import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

export default function LoginScreen() {
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const navigation = useNavigation();

  const user = 'blima';
  const code = 123;

  const login = () => {
    if (email === user && password == code) {
      navigation.navigate('Home');
    } else {
      alert('dados incorretos');
      console.log({code});
    }
  };
  const logout = () => {
    console.log('logout');
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
          placeholder="Digite seu e-mail"
          onChangeText={text => setEmail(text)}
          value={email}></TextInput>

        <Text style={styles.title}>Senha</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Digite sua senha"
          secureTextEntry={true}
          onChangeText={text => setPassword(text)}
          value={password}></TextInput>

        <TouchableOpacity style={styles.button} onPress={login}>
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
