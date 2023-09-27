import {createStackNavigator} from '@react-navigation/stack';

import HomeScreen from '../pages/HomeScreen';
import HistoricoScreen from '../pages/HistorySreen';

const Stack = createStackNavigator();

export default function AppRoutes() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="History"
        component={HistoricoScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}
