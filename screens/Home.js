import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Dimensions} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Image } from "expo-image";
import { Color, Border, FontFamily, FontSize, Padding } from "../GlobalStyles";
import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { useNavigation } from '@react-navigation/core'
import { Ionicons} from "@expo/vector-icons"
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Feather } from '@expo/vector-icons';
import { color } from 'react-native-reanimated';


export default function Home() {

  //Gas API's
  const [bnbGasData, setBnbGasData] = useState('');
  const [ethGasData, setEthGasData] = useState('');
  const [polygonGasData, setPolygonGasData] = useState('');
  const [ftmGasData, setFtmGasData] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(null);
  const bnbAPI_KEY = 'TCNY4UT93EH2719XS7KD3HVBP85KKKE273'; 
  const ethAPI_KEY = 'HNYFG59NRZTGXZN6A6A4VZ2A4AWX1C44W3';
  const polygonAPI_KEY = 'SHM1Q2VNZ9MIVKY8IE62F4MHYGCMPJDR31'; 
  const ftmAPI_KEY = '967A93QACPTC6QM1DN66TS5799TT9U861R'; 

  const [userInfo, setUserInfo] = useState([]);
  const navigation = useNavigation()


  useEffect(() => {
    const fetchBnbGasData = async () => {
      try {
        const response = await fetch(
          `https://api.bscscan.com/api?module=gastracker&action=gasoracle&apikey=${bnbAPI_KEY}`
        );

        if (response.ok) {
          const gasData = await response.json();
          setBnbGasData(gasData.result);
          //console.log("bnb data: ", gasData);
        } else {
          console.log('Error fetching BNB gas data:', response.status);
        }
        setLoading(false);
      } catch (error) {
        console.log('Error fetching BNB gas data:', error);
        setLoading(false);
      }
    };

    const fetchEthGasData = async () => {
      try {
        const response = await fetch(
          `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${ethAPI_KEY}`
        );

        if (response.ok) {
          const gasData = await response.json();
          setEthGasData(gasData.result);
          //console.log("ETH data: ", gasData);
        } else {
          console.log('Error fetching Ethereum gas data:', response.status);
        }
      } catch (error) {
        console.log('Error fetching Ethereum gas data:', error);
      }
    };

    const fetchPolygonGasData = async () => {
      try {
        const response = await fetch(
          `https://api.polygonscan.com/api?module=gastracker&action=gasoracle&apikey=${polygonAPI_KEY}`
        );

        if (response.ok) {
          const gasData = await response.json();
          setPolygonGasData(gasData.result);
          //console.log("polygon data: ",gasData);
        } else {
          console.log('Error fetching Polygon gas data:', response.status);
        }
      } catch (error) {
        console.log('Error fetching Polygon gas data:', error);
      }
    };

    const fetchFtmGasData = async () => {
      try {
        const response = await fetch(
          `https://api.ftmscan.com/api?module=gastracker&action=gasoracle&apikey=${ftmAPI_KEY}`
        );

        if (response.ok) {
          const gasData = await response.json();
          setFtmGasData(gasData.result);
          //console.log("fantom data: " ,gasData);
        } else {
          console.log('Error fetching Fantom gas data:', response.status);
        }
      } catch (error) {
        console.log('Error fetching Fantom gas data:', error);
      }
    };

    fetchBnbGasData();
    fetchEthGasData();
    fetchPolygonGasData();
    fetchFtmGasData();

    const intervalId = setInterval(() => {
      fetchBnbGasData();
      fetchEthGasData();
      fetchPolygonGasData();
      fetchFtmGasData();
    }, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString());
    };

    const intervalId = setInterval(() => {
      updateCurrentTime();
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);


  
  //end of gas API BACK

  const sendButton = () =>{
    navigation.navigate("Send")
  }

  const profileButton = () => {
    navigation.navigate("Profile")
  }
  
  const noitificationButton = () => {
    navigation.navigate("Notifications")
  }

  const [email, setEmail] = useState();
  const [uids, setUid] = useState();
  const [uid2, setUid2] = useState();
  const [amount, setAmount] = useState();
  const [fullname, setName] = useState();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        setUid(uid);
        setEmail(user.email);
        setName(user.fullname)

        const getWallet = async() => {
          const docRef = doc(db, "users", uid);
          const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
              console.log("Document data:", docSnap.data());
              const data = docSnap.data();
              setUserInfo(data);
            } else {
              // docSnap.data() will be undefined in this case
              console.log("No such document!");
            }
          });

          return unsubscribe; // Cleanup function to unsubscribe from the snapshot
        }
        const unsubscribe = getWallet();

        return () => {
          // Clean up the snapshot subscription when the component unmounts
          unsubscribe();
        };
      } else {
        navigation.navigate("Login");
      }
    });
  }, []);

  const handleSignOut = () =>{
    signOut(auth).then(() => {
      navigation.navigate('Login');
    }).catch((error) => {
      // An error happened.
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#141414" />

      <View style={styles.upperContainer}>
        <View><Text style={styles.welcomeText}>Welcome</Text></View>
          <View style={styles.welcomeContainer}>
            <TouchableOpacity  onPress={profileButton}>
            <Ionicons name='person-circle' size={45} color='#fff'/>
            </TouchableOpacity>
            <Text style={styles.nameText}>
              {userInfo.fullname && userInfo.fullname
                .split(' ')
                .map((name, index) => (index === 0 ? name : name.charAt(0).toUpperCase() + '.'))
                .join(' ')}
            </Text>
            <TouchableOpacity onPress={noitificationButton}>
            <Ionicons name='notifications' size={35} color='#fff'/>
            </TouchableOpacity>
          </View>
      </View>

      <View style={{paddingHorizontal: 110}}>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceText}>Balance</Text>
        </View>
      </View>

      <View style={styles.blackContainer}>
      <View style={styles.purpleContainer}>
        <Text style={styles.totalBalanceText}>Total balance</Text>
        <Text style={styles.purpleContainerText}>₱ {userInfo.wallet ? userInfo.wallet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</Text>
      </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-around', alignItems:'center', padding: 10}}>
          <TouchableOpacity onPress={sendButton}>
          <Image 
          style={styles.sendImage}
          source={require('../assets/send.png')}/>
          </TouchableOpacity>
          <TouchableOpacity>
          <Image 
          style={styles.sendImage}
          source={require('../assets/receive.png')}/>
          </TouchableOpacity>
          <TouchableOpacity>
          <Image 
          style={styles.sendImage}
          source={require('../assets/others.png')}/>
          </TouchableOpacity>
        </View>
      
        <View style={{flexDirection: 'row', justifyContent:'space-around', alignItems:'center', paddingBottom: 10}}>
        <Text style={{color:'#fff', fontFamily: FontFamily.poppinsMedium, marginLeft: 10}}>Send to</Text>
        <Text style={{color:'#fff', fontFamily: FontFamily.poppinsMedium}}>Receive</Text>
        <Text style={{color:'#fff', fontFamily: FontFamily.poppinsMedium, marginRight:10}}>Others</Text>
        </View>
      </View>

  

      <View style={styles.gasContainer}>
        <ScrollView
          showsHorizontalScrollIndicator = {false} 
          horizontal
          contentContainerStyle = {styles.gasFeeContent}>

          <View style={styles.ethContainer}>
            <View style={styles.ethContent}>
            <Image source={require('../assets/eth.png')}
              style={styles.ethImage}
            />
            <Text style={styles.ethText}>            ETHEREUM               </Text>
            <Image
              source={require('../assets/gasIcon.png')}
              style={styles.gasImage}
            />
            </View>
            <View>
            <View style={styles.gasTextContainer}>
            <Text style={styles.gasFeeText}>   GAS FEE</Text>
            <Text style={styles.time}>{currentTime} UTC</Text>
            </View>
            <Text style={{marginTop: -25}}>         ETH</Text>
            </View>
            <View style={{justifyContent:'center', 
                          alignItems: 'center', 
                          borderBottomColor: '#4657CE',
                          borderBottomWidth: 1,
                          marginHorizontal: 20
                          }}>
              <Text style={styles.gasFeeText}>GWEI</Text>
            </View>
            <View style={styles.gasFeee}>
              <Text style={styles.gasText}>LOW</Text>
              { ethGasData.SafeGasPrice !== null ?
                <Text style={styles.gasText}>{ethGasData.SafeGasPrice}
              </Text>
              :
              console.log('Error')
              }

            </View>
            <View style={styles.gasFeee}>
              <Text style={styles.gasText}>AVERAGE</Text>
            { ethGasData.SafeGasPrice !== null ?
              <Text style={styles.gasText}>{ethGasData.ProposeGasPrice}
              </Text>
               :
               console.log('Error')
               }
            </View>
            <View style={styles.gasFeee}>
              <Text style={styles.gasText}>PRIORITY</Text>
              { ethGasData.SafeGasPrice !== null ?
              <Text style={styles.gasText}>{ethGasData.FastGasPrice}
              </Text>
               :
               console.log('Error')
               }
            </View>
            </View>



            <View style={styles.ethContainer}>
            <View style={styles.ethContent}>
            <Image source={require('../assets/bnb.png')}
              style={styles.ethImage}
            />
            <Text style={styles.ethText}>            BINANCE               </Text>
            <Image
              source={require('../assets/gasIcon.png')}
              style={styles.gasImage}
            />
            </View>
            <View>
            <View style={styles.gasTextContainer}>
            <Text style={styles.gasFeeText}>   GAS FEE</Text>
            <Text style={styles.time}>{currentTime} UTC</Text>
            </View>
            <Text style={{marginTop: -25}}>         BNB</Text>
            </View>
            <View style={{justifyContent:'center', 
                          alignItems: 'center',
                          alignItems: 'center', 
                          borderBottomColor: '#4657CE',
                          borderBottomWidth: 1,
                          marginHorizontal: 20
                          }}>
              <Text style={styles.gasFeeText}>GWEI</Text>
            </View>
            <View style={styles.gasFeee}>
              <Text style={styles.gasText}>LOW</Text>
              <Text style={styles.gasText}>{bnbGasData.SafeGasPrice}
              </Text>
            </View>
            <View style={styles.gasFeee}>
              <Text style={styles.gasText}>AVERAGE</Text>
              <Text style={styles.gasText}>{bnbGasData.ProposeGasPrice}
              </Text>
            </View>
            <View style={styles.gasFeee}>
              <Text style={styles.gasText}>PRIORITY</Text>
              <Text style={styles.gasText}>{bnbGasData.FastGasPrice}
              </Text>
            </View>
            </View>




            <View style={styles.ethContainer}>
            <View style={styles.ethContent}>
            <Image source={require('../assets/polygon.png')}
              style={styles.ethImage}
            />
            <Text style={styles.ethText}>            POLYGON               </Text>
            <Image
              source={require('../assets/gasIcon.png')}
              style={styles.gasImage}
            />
            </View>
            <View>
            <View style={styles.gasTextContainer}>
            <Text style={styles.gasFeeText}>   GAS FEE</Text>
            <Text style={styles.time}>{currentTime} UTC</Text>
            </View>
            <Text style={{marginTop: -25}}>    POLYGON</Text>
            </View>
            <View style={{justifyContent:'center', 
                          alignItems: 'center',
                          alignItems: 'center', 
                          borderBottomColor: '#4657CE',
                          borderBottomWidth: 1,
                          marginHorizontal: 20
                          }}>
              <Text style={styles.gasFeeText}>GWEI</Text>
            </View>
            <View style={styles.gasFeee}>
              <Text style={styles.gasText}>LOW</Text>
              <Text style={styles.gasText}> {polygonGasData.SafeGasPrice}
              </Text>
            </View>
            <View style={styles.gasFeee}>
              <Text style={styles.gasText}>AVERAGE</Text>
              <Text style={styles.gasText}>{polygonGasData.ProposeGasPrice}
              </Text>
            </View>
            <View style={styles.gasFeee}>
              <Text style={styles.gasText}>PRIORITY</Text>
              <Text style={styles.gasText}>{polygonGasData.FastGasPrice}
              </Text>
            </View>
            </View>




            <View style={styles.ethContainer}>
            <View style={styles.ethContent}>
            <Image source={require('../assets/fantom.png')}
              style={styles.ethImage}
            />
            <Text style={styles.ethText}>            FANTOM               </Text>
            <Image
              source={require('../assets/gasIcon.png')}
              style={styles.gasImage}
            />
            </View>
            <View>
            <View style={styles.gasTextContainer}>
            <Text style={styles.gasFeeText}>   GAS FEE</Text>
            <Text style={styles.time}>{currentTime} UTC</Text>
            </View>
            <Text style={{marginTop: -25}}>        FTM</Text>
            </View>
            <View style={{justifyContent:'center', 
                          alignItems: 'center',
                          alignItems: 'center', 
                          borderBottomColor: '#4657CE',
                          borderBottomWidth: 1,
                          marginHorizontal: 20
                          }}>
              <Text style={styles.gasFeeText}>GWEI</Text>
            </View>
            <View style={styles.gasFeee}>
              <Text style={styles.gasText}>LOW</Text>
              <Text style={styles.gasText}> {ftmGasData.SafeGasPrice}
              </Text>
            </View>
            <View style={styles.gasFeee}>
              <Text style={styles.gasText}>AVERAGE</Text>
              <Text style={styles.gasText}>{ftmGasData.ProposeGasPrice}
              </Text>
            </View>
            <View style={styles.gasFeee}>
              <Text style={styles.gasText}>PRIORITY</Text>
              <Text style={styles.gasText}>{ftmGasData.FastGasPrice}
              </Text>
            </View>
            </View>

        </ScrollView>
      </View>
        
    </SafeAreaView>
    
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: Color.blackModePrimaryDark,
    paddingHorizontal: 10
  },
  nameText:{
    color: "white",
    fontSize: 25,
    fontFamily: FontFamily.poppinsBold,
    textAlign: "center",
  },
  welcomeText:{
    color: "white",
    fontSize: 17,
    fontFamily: FontFamily.poppinsMedium,
    textAlign: "center",
  },
  welcomeContainer:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upperContainer:{
    marginTop: 20
  },
  balanceContainer:{
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 50,
    borderColor: Color.gray_100,
    borderWidth: 3,
    margin: 10,
  },
  balanceText:{
    fontSize: 20,
    fontFamily: FontFamily.poppinsMedium
  },
  purpleContainer:{
    alignItems: 'center',
    backgroundColor: '#7B61FF',
    borderRadius: 38,
    borderColor: Color.gray_100,
    borderWidth: 1,
  },
  blackContainer:{
    flexDirection: 'column',
    backgroundColor: '#262329',
    borderRadius: 40,
    borderColor: Color.gray_100,
    
  },
  purpleContainerText:{
    color: '#fff',
    fontSize: 45,
    fontFamily: FontFamily.poppinsMedium
  },
  totalBalanceText:{
    color: '#C9C9C9',
    marginTop: 10, 
    fontSize: 15, 
    fontFamily: FontFamily.poppinsMedium
  },
  sendImage:{
    height: 50,
    width: 50
  },
  gasContainer:{
    marginTop: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  gasFeeContent:{
    justifyContent: 'center',
    alignItems: 'center',
  },
  ethContainer:{
    backgroundColor: '#D9D9D9',
    borderRadius: 35,
    marginLeft: 10
    // paddingHorizontal: 70,
    
  },
  ethContent:{
    justifyContent: 'space-around',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10
  },
  ethImage:{
    marginTop: 5,
    width: 70,
    height: 70,
  },
  gasImage:{
    width: 40,
    height: 40,
  },
  ethText:{
    fontFamily: FontFamily.poppinsBold,
    fontSize: 20
  },
  gasTextContainer:{
    justifyContent:'center',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: -30
  },
  gasFeeText:{
    fontFamily: FontFamily.poppinsBold,
    fontSize: 20
  },
  gasFeee:{
    flexDirection: 'row', 
    alignItems:'center', 
    justifyContent:'space-around',
    padding: 8
  },
  gasText:{
    fontFamily: FontFamily.poppinsMedium,
    fontSize: 15
  },

});
