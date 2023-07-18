import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput,TouchableOpacity, StatusBar, ToastAndroid } from 'react-native';
import { auth, firebase } from '../firebase';
import { doc,onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { onAuthStateChanged } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { Color, FontFamily } from '../GlobalStyles';
import { Image } from 'expo-image';
import { AntDesign } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AwesomeAlert from 'react-native-awesome-alerts';

const EditProfile = () => {
const navigation = useNavigation();

const [userInfo, setUserInfo] = useState([]);
const [email, setEmail] = useState();
const [uids, setUid] = useState();
const [fullname, setName] = useState(userInfo.fullname);
const [contact, setContact] = useState("");
const [qrCodeValue, setQrCodeValue] = useState('');
const [showSuccessAlert, setShowSuccessAlert] = useState(false);
const [updatedContact, setUpdatedContact] = useState('');

useEffect(() => {
onAuthStateChanged(auth, (user) => {
if (user) {
const uid = user.uid;
setUid(uid);
setEmail(user.email);
setQrCodeValue(user.email);

const userRef = doc(db, "users", uid);
const unsubscribe = onSnapshot(userRef, (docSnap) => {
if (docSnap.exists()) {
const data = docSnap.data();
setUserInfo(data);
} else {
console.log("No such document!");
}
});

return () => unsubscribe();
} else {
navigation.navigate("Login");
}
});
}, []);

const editProfile = async () => {
  const user = auth.currentUser.uid;
  if (user) {
    const uid = user;
    try {
      const updatedData = {
        fullname: fullname === "" ? userInfo.fullname : fullname,
        contact: contact === "" ? userInfo.contact : contact,
      };

      if (
        updatedData.fullname === userInfo.fullname &&
        updatedData.contact === userInfo.contact
      ) {
        ToastAndroid.show('Info is the same', ToastAndroid.SHORT);
      } else {
        const userRef = firebase.firestore().collection('users').doc(uid);
        await updateDoc(userRef, updatedData);

        setUpdatedContact(updatedData.contact === "" ? userInfo.contact : updatedData.contact);
        setShowSuccessAlert(true);
        console.log('Profile updated successfully');
      }
    } catch (error) {
      ToastAndroid.show('Error, Please input details', ToastAndroid.LONG);
      console.error('Error updating profile:', error);
    }
  }
};



const backButton = () =>{
  navigation.navigate("Profile")
}

return (
  <KeyboardAwareScrollView
    contentContainerStyle={styles.scrollContainer}
    enableOnAndroid
    extraScrollHeight={Platform.OS === 'ios' ? 20 : 0}
  >
      <View style={styles.container}>
        <StatusBar backgroundColor="#141414" />
          <TouchableOpacity 
            style={styles.imgContainer}
            onPress={backButton}
            >
            <Image
              style={styles.imgIcon}
              source={require('../assets/back.png')}
            />
          </TouchableOpacity>

          <View style={styles.profileContainer}>
            <Text style={styles.profileText}>Edit Profile</Text>
          </View>

        <View style={styles.contentContainerBox}>
          <View style={styles.contentContainer}>
            <Text style={styles.contentText}>Full Name: </Text>
          </View>

          <View style={styles.infoContainer}>
              <Text style={styles.infoText}>{userInfo.fullname}</Text>
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.contentText}>Contact No. </Text>
          </View>

          <View style={styles.infoContainer}>
              <Text style={styles.infoText}>{userInfo.contact}</Text>
          </View>

        </View>  


          <View style={styles.contentContainer}>
            <AntDesign name='edit' size={30} color={'#fff'}/>
            <Text style={styles.contentText}>Enter your Full Name: </Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputText}
              placeholder={"Juan Dela Cruz"}
              placeholderTextColor={Color.gray_500}
              value={fullname}
              onChangeText={text => setName(text.replace(/[^a-zA-Z ]/g, ''))}     
            />
          </View>

          
          <View style={styles.contentContainer}>
            <AntDesign name='edit' size={30} color={'#fff'}/>
            <Text style={styles.contentText}>Enter your new Contact Number: </Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputText}
              placeholder={"09**-***-****"}
              placeholderTextColor={Color.gray_500}
              value={contact}
              maxLength={11}
              keyboardType="numeric"
              onChangeText={text => setContact(text.replace(/[^0-9]/g, ''))}
            />
          </View>

          <TouchableOpacity style={styles.buttonContainer} onPress={editProfile}>
            <Text style={styles.button}>Save</Text>
          </TouchableOpacity>

      </View>

      <AwesomeAlert
        show={showSuccessAlert}
        title="Profile Updated Successfully!"
        message={`Full Name: ${fullname}\nContact: ${updatedContact}`}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        confirmText="OK"
        confirmButtonColor="#7B61FF"
        confirmButtonStyle={{ backgroundColor: Color.sUNRISECoral }}
        confirmButtonTextStyle={styles.button}
        onConfirmPressed={() => {
          setShowSuccessAlert(false);
          navigation.navigate("Profile");
        }}
        contentContainerStyle={styles.successAlertContent}
      />

    </KeyboardAwareScrollView>

);};

export default EditProfile;

const styles = StyleSheet.create({
  container:{
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: Color.blackModePrimaryDark,
    padding: 10
  },
  imgContainer:{
    justifyContent:'center',
    alignItems: 'flex-start',
    padding: 20
  },
  imgIcon:{
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
contentContainerBox:{
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: "rgba(255, 255, 255, 0.10)",
  borderRadius: 10,
  height: '35%',
  marginBottom: 15
},
contentContainer:{
  padding:10,
  flexDirection: 'row',
  alignItems: 'center',
  marginHorizontal: 10
},
contentText:{
  fontFamily:FontFamily.poppinsRegular,
  color: Color.gray_700,
  fontSize: 17,
  marginLeft: 10
},
infoContainer:{
  backgroundColor: "rgba(255, 255, 255, 0.15)",
  borderRadius: 40,
  paddingVertical: 5,
  paddingHorizontal: 70
},
infoText:{
  fontFamily: FontFamily.poppinsMedium,
  color: '#fff',
  fontSize: 18,
},
inputContainer:{
  backgroundColor: "rgba(255, 255, 255, 0.20)",
  borderRadius: 10,
  paddingVertical: 5,
  paddingHorizontal: 70,
},
inputText:{
  fontFamily: FontFamily.poppinsMedium,
  color: '#fff',
  fontSize: 18,
},
buttonContainer:{
  justifyContent:'center',
  alignItems: 'center',
  padding: 10,
  backgroundColor: '#7B61FF',
  borderRadius: 10,
  marginHorizontal: 100,
  marginTop: 20
},
button:{
  fontFamily: FontFamily.poppinsBold,
  color: Color.gray_700,
  fontSize: 15
},
scrollContainer: {
  flexGrow: 1,
  backgroundColor: Color.blackModePrimaryDark,
  marginBottom: 0,
},

});