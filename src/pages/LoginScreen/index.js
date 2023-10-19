import React, { useState } from 'react';
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
import { useAuth } from '../../context/AuthContext';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

export default function LoginScreen() {
  const { signInWithEmailAndPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);

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
      setIsLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleFocusEmail = () => {
    setIsFocusedEmail(true);
  };

  const handleBlurEmail = () => {
    setIsFocusedEmail(false);
  };

  const handleFocusPassword = () => {
    setIsFocusedPassword(true);
  };

  const handleBlurPassword = () => {
    setIsFocusedPassword(false);
  };

  return (
    <View style={styles.container}>
      <Animatable.View delay={600} animation="fadeInDown" style={styles.viewLogo}>
        <Image
          source={require('../../assets/Ane_gota_branca.png')}
          style={{ width: '60%' }}
          resizeMode="contain"
        />
      </Animatable.View>

      <Animatable.View delay={600} animation="fadeInUp" style={styles.viewInput}>
        <Text style={styles.title}>E-mail</Text>
        <TextInput
          style={[
            styles.textInput,
            isFocusedEmail ? { borderColor: 'blue' } : { borderColor: 'gray' },
          ]}
          placeholder="Digite o seu e-mail"
          placeholderTextColor="#A9A9A9"
          onChangeText={(text) => setEmail(text)}
          value={email}
          onFocus={handleFocusEmail}
          onBlur={handleBlurEmail}
        />

        <Text style={styles.title}>Senha</Text>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={[
              styles.textInput,
              isFocusedPassword
                ? { borderColor: 'blue' }
                : { borderColor: 'gray' },
            ]}
            placeholder="Digite a sua senha"
            placeholderTextColor="#A9A9A9"
            secureTextEntry={!showPassword}
            onChangeText={(text) => setPassword(text)}
            value={password}
            onFocus={handleFocusPassword}
            onBlur={handleBlurPassword}
          />
          <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeIcon}>
            <FontAwesomeIcon
              name={showPassword ? 'eye' : 'eye-slash'}
              size={20}
              color="gray"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={isLoading}
        >
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
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
