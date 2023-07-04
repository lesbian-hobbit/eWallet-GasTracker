  import React, { useState, useEffect } from "react";
  import { View, Text, StyleSheet, TouchableOpacity, TextInput, ImageBackground, Alert } from "react-native";
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { Ionicons } from '@expo/vector-icons';
  import { collection, query, where, onSnapshot, writeBatch, runTransaction, doc, getDocs, setDoc, addDoc, Timestamp } from "firebase/firestore";
  import { auth, db, firebase } from "../firebase";
  import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
  import * as SMS from "expo-sms";



  const SendCash = ({ route, navigation }) => {
    const [balance, setBalance] = useState(5000); // Initial balance
    const [email, setEmail] = useState();
    const [userInfo, setUserInfo] = useState([]);
    const [transactions, setTransactions] = useState();
    const [fullname, setName] = useState();
    const [recipientEmail, setRecipientEmail] = useState();
    const [amount, setAmount] = useState();
    const [recentContacts, setRecentContacts] = useState([]);
    const [ConfirmPassword, setPassword] = useState("");
    const [password, setPin] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOTP] = useState('');

    const saveDataToStorage = async (recipientEmail, recentContacts) => {
      try {
        const data = JSON.stringify({ recipientEmail, recentContacts });
        await AsyncStorage.setItem('userData', data);
        console.log('Data saved to AsyncStorage');
      } catch (error) {
        console.log('Error saving data to AsyncStorage:', error);
      }
    };

    const loadDataFromStorage = async () => {
      try {
        const data = await AsyncStorage.getItem('userData');
        if (data) {
          const { recipientEmail, recentContacts } = JSON.parse(data);
          setRecipientEmail(recipientEmail);
          setRecentContacts(recentContacts);
          console.log('Data loaded from AsyncStorage');
        }
      } catch (error) {
        console.log('Error loading data from AsyncStorage:', error);
      }
    };

    useEffect(() => {
      loadDataFromStorage();
    }, []);

    useEffect(() => {
      saveDataToStorage(recipientEmail, recentContacts);
    }, [recipientEmail, recentContacts]);

    const getRecipientUid = async (email) => {  
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const recipient = querySnapshot.docs[0];
        return recipient.id;
      }
      throw new Error('Recipient not found');
    };

    const ConfirmPin = async () => {
      onAuthStateChanged(auth, async () => {
        const user = auth.currentUser;
        if (user) {
          const uid = user.uid;     
          setEmail(user.email);  
            const userCredential = await signInWithEmailAndPassword(auth, user.email, ConfirmPassword).then((res)=>{
              const user = auth.currentUser;
              if (user.emailVerified) {
                console.log(res);
                transferFunds();
                const userData = userCredential.user;
            console.log("User password:", userData.password, uid, userData.email);
              }else {
                  alert("Password does not match");
                }
            });

       
            


            
    
          
        
        }
      });
    };

    const generateOTP = () => {
      const digits = '0123456789';
      let OTP = '';
      for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
      }
      return OTP;
    };
  
    const sendOTP = async () => {
      const generatedOTP = generateOTP();
      setOTP(generatedOTP);
  
      try {
        const { result } = await SMS.sendSMSAsync(
          [phoneNumber],
          `Your OTP is: ${generatedOTP}`
        );
        if (result) {
          Alert.alert('OTP Sent', 'Please check your phone for the OTP.');
        } else {
          Alert.alert('Error', 'Failed to send OTP.');
        }
      } catch (error) {
        console.log('Error sending OTP:', error);
      }
    };
  
    const handleVerifyOTP = () => {
      // Add your OTP verification logic here
      if (otp === '') {
        Alert.alert('Error', 'Please generate and enter the OTP first.');
      } else if (otp === enteredOTP) {
        Alert.alert('Success', 'OTP verification successful!');
      } else {
        Alert.alert('Error', 'Invalid OTP.');
      }
    };


    const transferFunds = async () => {
      try {
        const recipientUid = await getRecipientUid(recipientEmail);
        

        const sfDocRef = doc(db, 'users', recipientUid);
        
        await runTransaction(db, async (transaction) => {
          const sfDoc = await transaction.get(sfDocRef);
          if (!sfDoc.exists()) {
            throw new Error('Document does not exist!');
          }
          const newWallet = sfDoc.data().wallet + Number(amount);
          transaction.update(sfDocRef, { wallet: newWallet });
        });
        console.log('Transaction successfully committed!: ' + Number(amount) + ' ' + recipientUid);

        const deduct = async () => {
          const user = auth.currentUser.uid;
          if (user) {
            const uid = user;
            try {
              await runTransaction(db, async (transaction) => {
                const userRef = firebase.firestore().collection('users').doc(uid);
                const sf = await transaction.get(userRef);
                if (!sf.exists) {
                  throw new Error('Document does not exist!');
                }
                const deductedWallet = sf.data().wallet - Number(amount);
                transaction.update(userRef, {
                  wallet: deductedWallet,
                });
                alert('Successfully sent ₱' + Number(amount) + ' to ' + recipientEmail);
                console.log('Successfully sent ₱' + Number(amount) + ' to ' + recipientEmail);
              });
            } catch (error) {
              alert('Error updating wallet:', error);
              console.error('Error updating wallet:', error);
            }
          }
        };
        await deduct();

        const user = auth.currentUser.uid;
        if (user) {
          const uid = user;
          const SenderEmail = auth.currentUser.email;
          const newTransactions = async () => {
            await addDoc(collection(db, 'users', uid, 'history', 'DUgVrFDJhas4wAuX07re', 'Sent'), {
              transactions: amount,
              Timestamp: new Date(),
              ReceiverUid: recipientUid,
              ReceiverEmail: recipientEmail,
            });
          };
          await newTransactions();

          const recievedHis = async () => {
            await addDoc(collection(db, 'users', recipientUid, 'history', 'DUgVrFDJhas4wAuX07re', 'Recieved'), {
              transactions: amount,
              Timestamp: new Date(),
              Sender: uid,
              SenderEmail: SenderEmail,
            });
          };
          await recievedHis();

          const updatedContacts = [recipientEmail, ...recentContacts.slice(0, 4)];
          setRecentContacts(updatedContacts);
          saveDataToStorage(recipientEmail, updatedContacts);
        }
      } catch (error) {
        console.error('Error transferring funds:', error);
      }
    };

    useEffect(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          const uid = user.uid;
          setEmail(user.email);

          const getWallet = async () => {
            const docRef = doc(db, 'users', uid);
            const unsubscribe = onSnapshot(docRef, (docSnap) => {
              if (docSnap.exists()) {
                console.log('Document data:', docSnap.data());
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

    const handleTransferFunds = () => {
      setBalance(balance - 100);
    };

    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ImageBackground source={require('../assets/background1.jpg')} resizeMode="cover" style={styles.image}>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceText}>Current Balance</Text>
            <View style={styles.currentBalanceContainer}>
              <Text style={styles.amountText}>₱ {userInfo.wallet}</Text>
            </View>
            <View style={styles.recentContactsContainer}>
              <Text style={styles.recentContactsText}>Recent Contacts:</Text>
              <View style={styles.recentContactsRow}></View>
              {recentContacts.map((contact, index) => (
              <TouchableOpacity key={index} onPress={() => setRecipientEmail(contact)}>
              <View style={styles.contactIconContainer}>
                <Ionicons name="person-circle-outline" size={24} color="white" />
                <Text style={styles.recentContactText}>{contact}</Text>
              </View>
            </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={{padding: 20}}>
          <TextInput
            style={styles.input}
            placeholder="Input Recipient's Email: "
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
            value={recipientEmail}
            onChangeText={setRecipientEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Input Amount: "
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
            value={amount}
            onChangeText={setAmount}
          />
            <TextInput
        style={{ borderWidth: 1, padding: 10 }}
        placeholder="Enter Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
          <TouchableOpacity
            style={styles.transferButton}
            onPress={transferFunds}
          >
            <Text style={styles.transferButtonText}>Send Funds</Text>
          </TouchableOpacity>
          <TextInput
    style={styles.input}
    placeholder="Enter Password"
    placeholderTextColor="rgba(0, 0, 0, 0.5)"
    secureTextEntry
    value={ConfirmPassword}
    onChangeText={setPassword}  
  />
          </View>
        </ImageBackground>
      </View>
    );
  };

  const styles = StyleSheet.create({
    image: {
      flex: 1,
      justifyContent: 'center',
    },
    balanceContainer: {
      alignItems: 'center',
      marginBottom: 30,
    },
    balanceText: {
      fontSize: 40,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#fff',
      fontFamily: 'Roboto',
    },
    currentBalanceContainer: {
      backgroundColor: '#fff',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 5,
      marginBottom: 10,
    },
    amountText: {
      fontSize: 23,
      fontWeight: 'bold',
      color: '#333',
    },
    recentContactsContainer: {
      alignItems: 'center',
    },
    recentContactsText: {
      fontSize: 16,
      color: '#fff',
      marginBottom: 5,
    },
    recentContactText: {
      fontSize: 14,
      color: '#fff',
      marginBottom: 3,
    },
    input: {
      height: 40,
      borderColor: "black",
      borderWidth: 2,
      borderRadius: 5,
      marginBottom: 10,
      padding: 10,
      margin: 10,
      fontFamily: 'Roboto',
      backgroundColor: 'white'
    },
    transferButton: {
      marginHorizontal: 80,
      backgroundColor: "#111827",
      paddingVertical: 10,
      borderRadius: 5,
      marginTop: 15,
      alignItems: 'center'
    },
    transferButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    recentContactsRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    contactIconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 10,
    },
    
  });

  export default SendCash;
