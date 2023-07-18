import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ToastAndroid} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot, runTransaction,getDoc, doc, getDocs, addDoc, Timestamp, orderBy, limit } from "firebase/firestore";
import { auth, db, firebase } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Color, FontFamily} from "../GlobalStyles";
import { useNavigation } from '@react-navigation/core'
import { encode } from 'base-64';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AwesomeAlert from 'react-native-awesome-alerts';



const Dashboard = ({ route }) => {
  const [balance, setBalance] = useState(5000); // Initial balance
  const [email, setEmail] = useState();
  const [userInfo, setUserInfo] = useState([]);
  const [fullname, setName] = useState();
  const [recipientEmail, setRecipientEmail] = useState();
  const [amount, setAmount] = useState();
  const [recentContacts, setRecentContacts] = useState([]);
  const [ConfirmPassword, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedAmount, setSelectedAmount] = useState('');
  const [amountError, setAmountError] = useState(false);
  const [showProgressAlert, setShowProgressAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [note, setNote] = useState(''); // State for note value



  const navigation = useNavigation();
  const backButton = () =>{
    navigation.navigate("Main")
  }

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
          ToastAndroid.show('Invalid Action/no PIN', 
          ToastAndroid.SHORT);
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
    if (Number(amount) < 5) {
        setAmountError(true);
        return;
    }
    if (user && user.emailVerified) {
      setShowProgressAlert(true);
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
                setShowSuccessAlert(true); // Show the success alert
                transaction.update(userRef, {
                  wallet: deductedWallet,
                });
                console.log('Successfully sent ₱' + Number(amount) + ' to ' + recipientEmail);
              });
            } catch (error) {
              alert('Error updating wallet:', error);
              console.error('Error updating wallet:', error);
            } finally {
              setShowProgressAlert(false); // Hide the progress alert
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

    const handleAmountClick = (selectedAmount) => {
      setAmount(selectedAmount);
      setSelectedAmount(selectedAmount);
    };
    

  return (

<KeyboardAwareScrollView
  contentContainerStyle={styles.scrollContainer}
  enableOnAndroid
  extraScrollHeight={Platform.OS === 'ios' ? 20 : 0}
>
    <View style={styles.container}>
      <View style={styles.purpleContainer}>
        <Text style={styles.totalBalanceText}>Total balance</Text>
        <Text style={styles.purpleContainerText}>₱ {userInfo.wallet ? userInfo.wallet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</Text>
      </View>

      <View style={styles.recentContactsContainer}>
            <Text style={styles.recentContactsText}>Recent Contacts:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator = {false} 
            >
            <View style={styles.recentContactsRow}>
            
            {recentContacts.map((contact, index) => (
             <TouchableOpacity key={index} onPress={() => setRecipientEmail(contact)} style={styles.contactsContainer}>
             <View style={styles.contactIconContainer}>
               <Ionicons name="person-circle-outline" size={24} color="white" />
               <Text style={styles.recentContactText}>{contact}</Text>
             </View>
           </TouchableOpacity>
            ))}
            </View>
            </ScrollView>
      </View>

     
      <View style={{flexDirection:'row', padding: 10, marginTop: 10}}>
        <Text style={{color: '#fff', fontFamily: FontFamily.poppinsMedium}}>Recipient: </Text>
        <Text style={{color: 'rgba(255, 255, 255, 0.15)'}}> *input email</Text>
      </View>
      <View style={{justifyContent: 'center', alignItems:'center'}}>
      <View style={{flexDirection: 'row'}}>
        <View style={styles.pesoContainer}>
          <Ionicons style={styles.personIcon} name="person" size={30}/>
        </View>
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
        <TextInput
          placeholder="Input Recipient's Email: "
          placeholderTextColor={Color.gray_500}
          style={styles.input}
          value={recipientEmail}
          onChangeText={setRecipientEmail}
        />
        </View>
      </View>
      </View>
      
      <View style={{flexDirection:'row', padding: 10}}>
        <Text style={{color: '#fff', fontFamily: FontFamily.poppinsMedium}}>Amount</Text>
        <Text style={{color: 'rgba(255, 255, 255, 0.15)'}}> *insert amount (min ₱5.00)</Text>
      </View>
      <View style={{justifyContent: 'center', alignItems:'center'}}>
      <View style={{flexDirection: 'row'}}>
        <View style={styles.pesoContainer}>
          <Text style={styles.pesoText}>₱</Text>
        </View>
        <View style={{alignItems: 'flex-start', justifyContent: 'flex-start'}}>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={amount}
          onChangeText={text => {
            setAmount(text.replace(/[^0-9.]/g, ''));
            setAmountError(false); // Reset the error state when the value changes
          }}
        />
        </View>
      </View>
      </View>
      {amountError && (<Text style={styles.errorText}>Amount should be at least ₱5.00</Text>)}

      <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10}}>
      <TouchableOpacity
  style={[
    styles.optionsContainer,
    selectedAmount === '50' && {
      backgroundColor: '#7B61FF',
      borderColor: '#7B61FF',
    },
  ]}
  onPress={() => handleAmountClick('50')}
>
  <Text
    style={[
      styles.optionsText,
      selectedAmount === '50' && { color: '#fff' },
    ]}
  >
    ₱50
  </Text>
</TouchableOpacity>
<TouchableOpacity
  style={[
    styles.optionsContainer,
    selectedAmount === '100' && {
      backgroundColor: '#7B61FF',
      borderColor: '#7B61FF',
    },
  ]}
  onPress={() => handleAmountClick('100')}
>
  <Text
    style={[
      styles.optionsText,
      selectedAmount === '100' && { color: '#fff' },
    ]}
  >
    ₱100
  </Text>
</TouchableOpacity>
<TouchableOpacity
  style={[
    styles.optionsContainer,
    selectedAmount === '150' && {
      backgroundColor: '#7B61FF',
      borderColor: '#7B61FF',
    },
  ]}
  onPress={() => handleAmountClick('150')}
>
  <Text
    style={[
      styles.optionsText,
      selectedAmount === '150' && { color: '#fff' },
    ]}
  >
    ₱150
  </Text>
</TouchableOpacity>
<TouchableOpacity
  style={[
    styles.optionsContainer,
    selectedAmount === '200' && {
      backgroundColor: '#7B61FF',
      borderColor: '#7B61FF',
    },
  ]}
  onPress={() => handleAmountClick('200')}
>
  <Text
    style={[
      styles.optionsText,
      selectedAmount === '200' && { color: '#fff' },
    ]}
  >
    ₱200
  </Text>
</TouchableOpacity>

      </View>


      <View style={{flexDirection:'row', padding: 10}}>
        <Text style={{color: '#fff', fontFamily: FontFamily.poppinsMedium}}>PIN </Text>
        <Text style={{color: 'rgba(255, 255, 255, 0.15)'}}> *input PIN</Text>
      </View>
      <View style={{justifyContent: 'center', alignItems:'center'}}>
      <View style={{flexDirection: 'row'}}>
        <View style={styles.pesoContainer}>
          <MaterialCommunityIcons style={styles.personIcon} name="form-textbox-password" size={30}/>
        </View>
        <View style={{alignItems: 'flex-start', justifyContent: 'flex-start'}}>
        <TextInput
          placeholder="Enter PIN"
          placeholderTextColor={Color.gray_500}
          secureTextEntry
          keyboardType="numeric"
          style={styles.input}
          value={ConfirmPassword}
          maxLength={6}
          onChangeText={(text) => {
            const numericValue = text.replace(/[^0-9]/g, '');
            setPassword(numericValue);
          }}
        />
        </View>
      </View>
      </View>

      <View style={{flexDirection:'row', padding: 10, marginTop: 10}}>
        <Text style={{color: '#fff', fontFamily: FontFamily.poppinsMedium}}>Notes</Text>
        <Text style={{color: 'rgba(255, 255, 255, 0.15)'}}> *optional</Text>

      </View>

      <View>
      <TextInput
        style={styles.notesContainer}
        placeholder="Your notes here ......."
        placeholderTextColor={Color.gray_400}
        color={'#fff'}
        fontFamily={FontFamily.poppinsMedium}
        fontSize={15}
        value={note}
        onChangeText={setNote}
        
      />

      </View>

      <TouchableOpacity
          style={styles.transferButton}
          onPress={ConfirmPin}
        >
          <Text style={styles.transferText}>Send</Text>
      </TouchableOpacity>
      
    </View>
      <AwesomeAlert
        show={showProgressAlert}
        showProgress={true}
        title="Sending"
        message="Please wait..."
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={false}
        contentContainerStyle={styles.progressAlertContent}
        progressSize={40}
        progressColor="#7B61FF"
      />

    <AwesomeAlert
        show={showSuccessAlert}
        title="Transfer Success!"
        message={`You just sent ₱${Number(amount)} to ${recipientEmail}\n\nNotes: ${note}`}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        confirmText="OK"
        confirmButtonColor="#7B61FF"
        confirmButtonStyle={{backgroundColor: Color.sUNRISECoral}}
        confirmButtonTextStyle={styles.buttonText}
        onConfirmPressed={() => {
           setShowSuccessAlert(false);
           navigation.navigate("Main");
          }
        }
        contentContainerStyle={styles.successAlertContent}
      />
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: Color.blackModePrimaryDark,
    paddingHorizontal: 10
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: Color.blackModePrimaryDark,
    marginBottom: 0,
   
  },
  backIcon:{
    width: 70,
    height: 50,
    color: Color.gray_700
  },
  backImgContainer:{
    padding: 5,
  },
  purpleContainer:{
    marginTop: 15,
    alignItems: 'center',
    backgroundColor: '#7B61FF',
    borderRadius: 38,
    borderColor: Color.gray_100,
    borderWidth: 1
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
  recentContactsContainer: {
    alignItems: 'center',
  },
  contactsContainer:{
    justifyContent:'center',
    alignItems:'center',
    borderColor: Color.gray_400,
    borderWidth: 2,
    borderRadius: 15,
    fontFamily: FontFamily.poppinsMedium,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: '#fff',
    fontSize: 10,
    width: 250,
    height: 30,
    paddingHorizontal: 10,
    marginLeft: 5
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
  recentContactText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 3,
  },
  recentContactsText: {
    fontSize: 15,
    color: '#fff',
    marginBottom: 5,
    padding: 10,
    fontFamily: FontFamily.poppinsBold
  },
  input: {
    flex: 1,
    borderColor: Color.gray_400,
    borderWidth: 2,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    fontFamily: FontFamily.poppinsMedium,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: '#fff',
    fontSize: 20,
    width: 290,
    height: 50,
    paddingHorizontal: 15
  },
  pesoContainer:{
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    borderColor: Color.gray_400,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    height: 50,
    width: 50
  },
  personIcon:{
    color: '#7B61FF',
    padding: 10
  },
  pesoText:{
    color: '#7B61FF',
    marginLeft: 15,
    fontSize: 30
  },
  optionsContainer:{
    alignItems:'center',
    margin: 10,
    backgroundColor: 'rgba(255, 255, 255, 0)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Color.gray_400,
    padding: 3,
    width: '20%'
  },
  optionsText:{
    fontSize: 25,
    color: Color.gray_500
  },
  errorText: {
    color: '#d65047',
    fontSize: 12,
    marginTop: 5,
  },
  notesContainer:{
    backgroundColor: 'rgba(255, 255, 255, 0)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Color.gray_400,
    padding: 10,
  },
  transferButton:{
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 80,
    backgroundColor: "#7B61FF",
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 15,
  },
  transferText:{
    fontFamily: FontFamily.poppinsMedium,
    fontSize: 20,
    color: '#fff'
  },
  buttonText: {
    color: Color.gray_700,
    fontFamily: FontFamily.poppinsBold,
    fontSize: 16,
    textAlign: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
});

export default Dashboard;
