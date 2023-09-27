import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAL1fmkxrEAXUBu4o_F75Nl8sZsGGZLdo8',
  authDomain: 'frota-1e566.firebaseapp.com',
  databaseURL: 'https://frota-1e566-default-rtdb.firebaseio.com',
  projectId: 'frota-1e566',
  storageBucket: 'frota-1e566.appspot.com',
  messagingSenderId: '791859704307',
  appId: '1:791859704307:web:6bc4e37c4fdd6646fe2286',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
