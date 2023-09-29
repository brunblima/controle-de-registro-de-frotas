import React, {createContext, useContext, useEffect, useState} from 'react';
import {Alert} from 'react-native';
import firebase from '../services/firebaseConfig';
const AuthContext = createContext();

const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Adicione um listener para observar o estado de autenticação do usuário
    const unsubscribe = firebase
      .auth()
      .onAuthStateChanged(authenticatedUser => {
        setUser(authenticatedUser);
      });

    // Limpe o listener quando o componente é desmontado
    return () => unsubscribe();
  }, []);

  const signInWithEmailAndPassword = async (email, password) => {
    try {
      const userCredentials = await firebase
        .auth()
        .signInWithEmailAndPassword(email, password);
      setUser(userCredentials.user);
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        Alert.alert(
          'Erro de Login',
          'E-mail ou senha incorretos. Por favor, verifique suas credenciais.',
        );
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert(
          'Erro de Login',
          'Endereço de e-mail inválido. Por favor, verifique o formato do e-mail.',
        );
      } else {
        Alert.alert(
          'Erro de Login',
          'Ocorreu um erro ao fazer login. Por favor, tente novamente mais tarde.',
        );
      }
    }
  };

  const signOut = async () => {
    try {
      await firebase.auth().signOut();
      setUser(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{signed: !!user, user, signInWithEmailAndPassword, signOut}}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export {AuthProvider, useAuth};
