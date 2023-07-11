import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, SafeAreaView } from 'react-native';
import { auth } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged, signOut } from 'firebase/auth';



const MainDashboard = () => {
  const [userInfo, setUserInfo] = useState([]);
  const navigation = useNavigation();
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState(null);

  const sendButton = () => {
    navigation.navigate('Send');
  };

  const logOutButton = () => {
    auth
      .signOut()
      .then(() => {
        navigation.replace('Login');
      })
      .catch(error => alert(error.message));
  };

  const ScanQRButton = () => {
    navigation.navigate('ScanQR');
  };

  const editProfileButton = () => {
    navigation.navigate('EditProfile');
  };

  const currencyButton = () => {
    navigation.navigate('Currency');
  };

  const historyLogsButton = () => {
    navigation.navigate('Logs');
  };

  const [email, setEmail] = useState();
  const [uids, setUid] = useState();
  const [uid2, setUid2] = useState();
  const [amount, setAmount] = useState();
  const [fullname, setName] = useState();



  useEffect(() => {
    onAuthStateChanged(auth, user => {
      if (user) {
        const uid = user.uid;
        setUid(uid);
        setEmail(user.email);
        setName(user.fullname);

        const getWallet = async () => {
          const docRef = doc(db, 'users', uid);
          const unsubscribe = onSnapshot(docRef, docSnap => {
            if (docSnap.exists()) {
              // console.log('Document data:', docSnap.data());
              const data = docSnap.data();
              setUserInfo(data);
            } else {
              console.log('No such document!');
            }
          });

          return unsubscribe;
        };

        const unsubscribe = getWallet();

        return () => {
          unsubscribe();
        };
      } else {
        navigation.navigate('Login');
      }
    });
  }, []);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigation.navigate('Login');
      })
      .catch(error => {
        console.error('An error happened:', error);
      });
  };

 

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground source={require('../assets/background1.jpg')} resizeMode="cover" style={styles.image}>
        {/* Balance tab */}
        <View style={{ padding: 20 }}>
          <View style={styles.header}>
            <View>
              <Text style={{ fontWeight: 'bold', color: 'white' }}>Balance</Text>
              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.regularText, { color: 'white' }]}>₱ {userInfo.wallet}</Text>
              </View>
            </View>
          </View>
        </View>
        {/* Balance tab */}

        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Welcome, {userInfo.fullname}</Text>
        </View>
        <View style={{ borderBottomColor: 'lightgray', borderBottomWidth: StyleSheet.hairlineWidth, margin: 20 }} />

        <View style={{ justifyContent: 'center', flex: 1 }}>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.mediumButtonContainer} onPress={sendButton}>
              <View style={styles.circleContainer}>
                <View style={[styles.circle, { width: 100, height: 100 }]}>
                  <Ionicons name="send" size={30} color="white" />
                  <Text style={[styles.titleText, styles.boldText, { color: 'white', marginTop: 5, textAlign: 'center' }]}>Send</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mediumButtonContainer} onPress={editProfileButton}>
              <View style={styles.circleContainer}>
                <View style={[styles.circle, { width: 100, height: 100 }]}>
                  <Ionicons name="person-outline" size={30} color="white" />
                  <Text style={[styles.titleText, styles.boldText, { color: 'white', marginTop: 5, textAlign: 'center' }]}>Edit Profile</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonsContainer}>
            <View style={{ marginRight: 10 }}>
              <TouchableOpacity style={{ alignItems: 'center' }} onPress={logOutButton}>
                <View style={[styles.smallButtonContainer, { width: 100, height: 100 }]}>
                  <Ionicons name="log-out-outline" size={45} color="white" />
                  <Text style={[styles.titleText, styles.boldText, { color: 'white', marginTop: 5, textAlign: 'center' }]}>Logout</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.footbar}>
        <TouchableOpacity style={styles.iconContainer} onPress={currencyButton}>
          <Ionicons name="logo-bitcoin" size={21} color="#111827" />
          <Text style={styles.iconLabel}>Currency</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconContainer} onPress={ScanQRButton}>
          <Ionicons name="md-qr-code" size={21} color="#111827" />
          <Text style={styles.iconLabel}>Scan QR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconContainer} onPress={historyLogsButton}>
          <Ionicons name="md-time" size={21} color="#111827" />
          <Text style={styles.iconLabel}>History</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default MainDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    borderRadius: 50,
    backgroundColor: 'blue',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediumButtonContainer: {
    marginRight: 10,
  },
  smallButtonContainer: {
    borderRadius: 15,
    backgroundColor: 'blue',
    alignItems: 'center',
    justifyContent: 'center',
  },
  regularText: {
    fontSize: 18,
  },
  titleText: {
    fontSize: 16,
  },
  boldText: {
    fontWeight: 'bold',
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
  footbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F9FAFB',
  },
  iconContainer: {
    alignItems: 'center',
  },
  iconLabel: {
    fontSize: 12,
    color: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});