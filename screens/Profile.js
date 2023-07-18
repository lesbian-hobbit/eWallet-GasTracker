import { View, Text, StyleSheet, TouchableOpacity, Switch} from 'react-native'
import { Color, FontFamily, FontSize } from '../GlobalStyles';
import { Image } from "expo-image";
import { useNavigation } from '@react-navigation/core'
import { Fontisto } from '@expo/vector-icons';
import { auth } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useState, useEffect, useContext} from 'react';
import { AppContext } from '../AppContext';


const Profile = () => {
    const [email, setEmail] = useState('');
    const [fullname, setFullname] = useState('');
    const [contact, setContact] = useState('');
    const { showFingerprint, setShowFingerprint } = useContext(AppContext);

    const handleToggleFingerprint = () => {
      setShowFingerprint(!showFingerprint);
      };

    const navigation = useNavigation()
    const backButton = () =>{
        navigation.navigate("Main")
    }
    const editProfileButton = () =>{
        navigation.navigate("EditProfile")
    }
    const logOutButton = () =>{
        auth
          .signOut()
          .then(() => {
            navigation.replace("Login")
          })
          .catch(error => alert(error.message))
      }

      useEffect(() => {
        onAuthStateChanged(auth, (user) => {
          if (user) {
            setEmail(user.email);
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
    <View style={styles.container}>
        <TouchableOpacity style={styles.backImgContainer} onPress={backButton}>
            <Image
                source={require('../assets/back.png')}
                style={styles.backImg}
            />
        </TouchableOpacity>

        <View style={styles.profileContainer}>
            <Text style={styles.profileText}>Profile</Text>
        </View>

        <View style={{alignItems:'center', justifyContent:'center'}}>
            <View style={styles.purpleContainer}>
                <View style={styles.circleContainer}>
                    <Fontisto name='user-secret' size={90}/>
                </View>
            </View>
        </View>


        <View style={styles.fingerprintToggleContainer}>
            <Switch
            value={showFingerprint}
            onValueChange={handleToggleFingerprint}
            />
            <Text style={styles.fingerprintToggleLabel}>Show Fingerprint</Text>
            {showFingerprint && (
            <View style={styles.fingerprintToggleContainer}></View>)}
        </View>

        <View style={styles.infoContainer}>
            <View style={{paddingHorizontal: 10}}>
                <Text style={{fontFamily: FontFamily.poppinsBold, color: '#fff'}}>Name: </Text>
                <View style={styles.contentContainer}><Text style={styles.textContent}>{fullname}</Text></View>
                <Text style={{fontFamily: FontFamily.poppinsBold, color: '#fff'}}>Email: </Text>
                <View style={styles.contentContainer}><Text style={styles.textContent}>{email}</Text></View>
                <Text style={{fontFamily: FontFamily.poppinsBold, color: '#fff'}}>Contact: </Text>
                <View style={styles.contentContainer}><Text style={styles.textContent}>{contact.replace(/(\d{4})(\d{3})(\d{4})/, "$1-$2-$3")}</Text></View>
            </View>
        </View>

        <View style={{flexDirection: 'row', justifyContent: 'space-around', padding: 10, marginTop: 20}}>
            <TouchableOpacity style={styles.buttonContainer} onPress={editProfileButton}>
                <Text style={styles.textContent}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonContainer} onPress={logOutButton}>
                <Text style={styles.textContent}>Log out</Text>
            </TouchableOpacity>
        </View>
    </View>
  )
}

export default Profile

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.blackModePrimaryDark,
        justifyContent: 'flex-start',
        padding: 10,
    },
    backImgContainer:{
        justifyContent:'center',
        alignItems: 'flex-start',
        padding: 20
    },
    backImg:{
        height: 50,
        width: 70
    },
    profileContainer:{
        padding: 10,
        alignItems: 'center'
    },
    profileText:{
        fontFamily: FontFamily.poppinsBold,
        color: '#fff',
        fontSize: 30
    },
    purpleContainer:{
        backgroundColor: '#7B61FF',
        borderRadius: 30,
        paddingVertical: '5%',
        paddingHorizontal: '30%'
    },
    circleContainer:{
        backgroundColor: Color.gray_700,
        padding: '10%',
        margin: 10,
        borderRadius: 100
    },
    infoContainer:{
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 10,
      },
      contentContainer:{
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: 40,
        paddingVertical: 5,
        paddingHorizontal: 70
      },
      textContent: {
        fontFamily: FontFamily.poppinsMedium,
        color: '#fff',
        fontSize: 15,
      },
      cardTextContainer:{
        marginTop: 40
      },
      cardText:{
        fontFamily: FontFamily.poppinsBold,
        color: Color.gray_700,
        fontSize: 40
      },
      buttonContainer:{
        backgroundColor: '#7B61FF',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10
      },
      fingerprintToggleContainer:{
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginRight: 20
      },
      fingerprintToggleLabel:{
        fontFamily: FontFamily.mButton,
        color: Color.gray_400,
        fontSize: 12
      }
});