import { View, Text, StyleSheet, TouchableOpacity,ImageBackground,SafeAreaView, } from 'react-native';
import { useNavigation } from '@react-navigation/core'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Currency from './Currency';
import Card from './Card';
import ScanQR from './ScanQR';
import Logs from './Logs';
import Home from './Home';
import CustomBottomTab from '../components/CustomBottomTabs';

const MainDashboard = () => {
  const Tab = createBottomTabNavigator();

  return (

        <Tab.Navigator tabBar={props => <CustomBottomTab {...props}/>}>
            <Tab.Group
              screenOptions={{
                headerShown: false,
              }}>
                <Tab.Screen 
                options={{tabBarLabel: 'Home'}}
                name="Home" 
                component={Home}
                />
                <Tab.Screen 
                options={{tabBarLabel: 'Card'}}
                name="Card" 
                component={Card}
                />
                <Tab.Screen 
                options={{tabBarLabel: 'Scan'}}
                name="ScanQR" 
                component={ScanQR}
                />
                <Tab.Screen 
                options={{tabBarLabel: 'History'}}
                name="Logs" 
                component={Logs}
                />
                <Tab.Screen 
                options={{tabBarLabel: 'Currency'}}
                name="Currency" 
                component={Currency}
                />
            </Tab.Group>
        </Tab.Navigator>
  

      // {/* <View style={styles.footbar}>
      //   <TouchableOpacity style={styles.iconContainer} onPress={currencyButton}>
      //   <Ionicons name="logo-bitcoin" size={21} color="#111827" />
      //     <Text style={styles.iconLabel}>Currency</Text>
      //   </TouchableOpacity>
      //   <TouchableOpacity style={styles.iconContainer} onPress={ScanQRButton}>
      //     <Ionicons name="md-qr-code" size={21} color="#111827" />
      //     <Text style={styles.iconLabel}>Scan QR</Text>
      //   </TouchableOpacity>
      //   <TouchableOpacity style={styles.iconContainer} onPress={historyLogsButton}>
      //     <Ionicons name="md-time" size={21} color="#111827" />
      //     <Text style={styles.iconLabel}>History</Text>
      //   </TouchableOpacity>
      // </View> */}
   

  );
};

export default MainDashboard;

const styles = StyleSheet.create({
  
});
