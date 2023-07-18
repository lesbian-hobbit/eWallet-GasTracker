import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, StatusBar} from 'react-native';
import { auth } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import QRCode from 'react-native-qrcode-svg';
import { Color, FontFamily, FontSize } from '../GlobalStyles';
import { Ionicons } from '@expo/vector-icons';


const Card = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [fullname, setFullname] = useState('');
  const [contact, setContact] = useState('');
  const [qrCodeValue, setQrCodeValue] = useState('');

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email);
        setQrCodeValue(user.email);
        const uid = user.uid;
        const userRef = doc(db, 'users', uid);
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFullname(data.fullname); // Update the state with the user's fullname
            setContact(data.contact); // Update the state with the user's contact number
          } else {
            console.log('No such document!');
          }
        });
        return () => unsubscribe();
      } else {
        navigation.navigate('Login');
      }
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#141414" />
   
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardText}>Card</Text>
      </View>
      <View style={styles.cardContainer}>
      <View style={styles.qrCodeContainer}>
          {qrCodeValue ? <QRCode value={qrCodeValue} size={150} /> : null}
      </View>
      
        <View style={styles.infoContainer}>
            <View style={{paddingHorizontal: 10}}>
                <Text style={{fontFamily: FontFamily.poppinsBold, color: '#fff'}}>Name: </Text>
                <View style={styles.contentContainer}><Text style={styles.textContent}>{fullname}</Text></View>
                <Text style={{fontFamily: FontFamily.poppinsBold, color: '#fff'}}>Email: </Text>
                <View style={styles.contentContainer}><Text style={styles.textContent}>{email.replace(/^(.{4})/, "****")}</Text></View>
                <Text style={{fontFamily: FontFamily.poppinsBold, color: '#fff'}}>Contact: </Text>
                <View style={styles.contentContainer}><Text style={styles.textContent}>{contact.replace(/(\d{4})(\d{3})(\d{4})/, "$1-$2-****")}</Text></View>
            </View>
        </View>
      </View>
    
           
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.blackModePrimaryDark,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 10,
  },
  cardContainer:{
    borderRadius: 30,
    backgroundColor: '#7b61ff',
    marginTop: 10
  
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10

  },
  logo:{
    height: 50,
    width: 50,
  },
  infoContainer:{
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 10
  },
  contentContainer:{
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 40,
    paddingVertical: 5,
    paddingHorizontal: 60
  },
  textContent: {
    fontFamily: FontFamily.poppinsMedium,
    color: '#fff',
    fontSize: 15,
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 7,
    borderColor: '#e5e5e5',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 70,
    marginTop: 10
  },
  cardTextContainer:{
    marginTop: 40
  },
  cardText:{
    fontFamily: FontFamily.poppinsBold,
    color: Color.gray_700,
    fontSize: 40
  },
});

export default Card;
