import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ImageBackground, FlatList } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot, writeBatch, runTransaction,getDoc, doc, getDocs, setDoc, addDoc, Timestamp, orderBy, limit } from "firebase/firestore";
import { auth, db, firebase } from "../firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, signInWithPhoneNumber } from "firebase/auth";

import { encode } from 'base-64';


const SendCash = ({ route, navigation }) => {
  const [balance, setBalance] = useState(5000); // Initial balance
  const [email, setEmail] = useState();
  const [userInfo, setUserInfo] = useState([]);
  const [fullname, setName] = useState();
  const [recipientEmail, setRecipientEmail] = useState();
  const [amount, setAmount] = useState();
  const [recentContacts, setRecentContacts] = useState([]);
  const [ConfirmPassword, setPassword] = useState("");
  const [note, setNote] = useState(''); // State for note value
  const [verificationCode, setVerificationCode] = useState('');
  
  const [phoneNumber, setPhoneNumber] = useState('');


  

  const scannedData = route.params?.scannedData
  if (!global.btoa) {
    global.btoa = encode;
  }

  

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
  const currentUserUID = auth.currentUser.uid;
  const userRef = doc(db, 'users', currentUserUID);
  
  try {
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const { password } = userDoc.data();
      if(password == ConfirmPassword) {
            transferFunds();
        // console.log('Password match');
      }
      else {
        alert("Incorrect Password");
      }  
    } else {
      console.log('User document not found');
    }
  } catch (error) {
    console.error('Error retrieving password:', error);
  }

 
};

  const loadRecentTransactions = async () => {
    const currentUserUID = auth.currentUser.uid;
    const recentTransactionsRef = collection(
      db,
      'users',
      currentUserUID,
      'history',
      'DUgVrFDJhas4wAuX07re',
      'Sent'
    );
    const phoneNumber = collection(
      db,
      'users',
      currentUserUID,
      'contact'
    );
  
    onSnapshot(
      query(recentTransactionsRef, orderBy('Timestamp', 'desc'), limit(5)),
      (snapshot) => {
        const emailSet = new Set(); // Use a Set to store unique emails
        snapshot.forEach((doc) => {
          const { ReceiverEmail } = doc.data();
          emailSet.add(ReceiverEmail); // Add email to the Set
        });
        const recentContacts = Array.from(emailSet); // Convert Set back to an array
        setRecentContacts(recentContacts);
      },
      (error) => {
        console.error('Error fetching recent transactions:', error);
      }
    );
  };


  const transferFunds = async () => {
    const user = auth.currentUser;
  if (user && user.emailVerified) {
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



        
        const sentHisNote = async () => {
          const sentRef = collection(db, 'users', uid, "notes", "messages", "sentMessages"); // Reference to the "Notes" collection
          await addDoc(sentRef, {
            transactions: amount,
            Timestamp: new Date(),
            ReceiverUid: recipientUid,
            ReceiverEmail: recipientEmail,
            Note: note, // Add the note value to the document
          });
        };
        await sentHisNote();

        const receivedHisNote = async () => {
          const receivedRef = collection(db, 'users', recipientUid, "notes", "messages", "receivedMessages"); // Reference to the "Notes" collection
          await addDoc(receivedRef, {
            transactions: amount,
            Timestamp: new Date(),
            Sender: uid,
            SenderEmail: SenderEmail,
            Note: note, // Add the note value to the document
          });
        };
        await receivedHisNote();

        const receivedHis = async () => {
          await addDoc(collection(db, 'users', recipientUid, 'history', 'DUgVrFDJhas4wAuX07re', 'Recieved'), {
            transactions: amount,
            Timestamp: new Date(),
            Sender: uid,
            SenderEmail: SenderEmail,
          });
        };
        await receivedHis();

           // Check if the recipient's email is already in the recent contacts list
      const isRecipientInContacts = recentContacts.includes(recipientEmail);
      if (!isRecipientInContacts) {
        const updatedContacts = [recipientEmail, ...recentContacts.slice(0, 4)];
        setRecentContacts(updatedContacts);
      }
      }
    } catch (error) {
      console.error('Error transferring funds:', error);
    }
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

        return () =>{
          unsubscribe();
        };
      } else {
        navigation.navigate('Login');
      }
    });
  }, []);

  useEffect(() => {
    loadRecentTransactions();
    setRecipientEmail(scannedData);
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
 
        </View>
        <View style={styles.recentContactsContainer}>
            <Text style={styles.recentContactsText}>Recent Contacts:</Text>
            
            <View style={styles.recentContactsRow}></View>
  <FlatList
            data={recentContacts}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setRecipientEmail(item)}>
                <View style={styles.contactIconContainer}>
                  <Ionicons name="person-circle-outline" size={24} color="white" />
                  <Text style={styles.recentContactText}>{item}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
          </View>
        <View style={{ padding: 20 }}>
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
          {/* <TextInput
            style={{ borderWidth: 1, padding: 10 }}
            placeholder="Enter Phone Numbe"
            value={phoneNumber}
            
          /> */}
          <TextInput
            style={styles.input}
            placeholder="Enter Note"
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
            value={note}
            onChangeText={setNote}
          />

<TextInput
            style={styles.input}
            placeholder="Enter Password"
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
            secureTextEntry
            value={ConfirmPassword}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.transferButton}
            onPress={ConfirmPin}
          
          >
            <Text style={styles.transferButtonText}>Send Funds</Text>

          </TouchableOpacity>
         
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