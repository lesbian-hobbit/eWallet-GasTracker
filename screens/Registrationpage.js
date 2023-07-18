import React, { useState } from "react";
import { View, Text, TextInput,StyleSheet,TouchableOpacity,ImageBackground, ToastAndroid, StatusBar} from "react-native";
import { Image } from "expo-image";
import { FontFamily, FontSize, Color, Border } from "../GlobalStyles";
import { auth, db } from "../firebase";
import {signInWithEmailAndPassword,createUserWithEmailAndPassword,onAuthStateChanged,sendEmailVerification,} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import AwesomeAlert from 'react-native-awesome-alerts';

const Registrationpage = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [contact, setContact] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertMessageTitle, setAlertMessageTitle] = useState("");

  const onPress = () => {
    navigation.navigate("Login");
  };

  const createNewUser = async (email) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        console.log(uid);
        try {
          const newUser = async () => {
            await setDoc(doc(db, "users", uid), {
              email: email,
              wallet: 0,
              fullname: fullname,
              contact: contact,
              emailVerified: false,
              password: password,
            });
          };
          newUser();
        } catch (err) {
          console.error(err);
        }
      } else {
        // User is signed out
        // ...
      }
    });
  };

  const handleRegister = (e, p, confirmP) => {
    if (p !== confirmP) {
      // alert("Passwords do not match. Please confirm your password.");
      //ToastAndroid.show('Password do not match.', ToastAndroid.LONG);
      setAlertMessage("Password do not match");
      setAlertMessageTitle("Please confirm your password");
      setShowAlert(true);
      console.log("password does not match");
      return;
    }
    if (
      fullname.trim() === "" ||
      email.trim() === "" ||
      p.trim() === "" ||
      confirmP.trim() === "" ||
      contact.trim() === ""
    ) {
      // alert("Please fill in all fields.");
      ToastAndroid.show('Please fill in all fields.', 
      ToastAndroid.SHORT);
      return;
    }
    if (fullname.trim() === "") {
      // alert("Please enter your fullname.");
      ToastAndroid.show('Please enter your fullname.', ToastAndroid.SHORT);
      console.log("empty fullname.");
      return;
    }
    if (e.trim() === "") {
      // alert("Please enter an email.");
      ToastAndroid.show('Please enter an email.', ToastAndroid.SHORT);
      return;
    }
    if (p.trim() === "") {
      // alert("Please enter a password.");
      ToastAndroid.show('Please enter a password.', ToastAndroid.SHORT);
      return;
    }
    if (contact.trim() === "") {
      // alert("Please enter your contact number.");
      ToastAndroid.show('Please enter your contact number.', ToastAndroid.SHORT);
      console.log("empty contact number");
      return;
    }
    if (!/^\d+$/.test(contact)) {
      // alert("Contact number should contain only numbers.");
      ToastAndroid.show('Contact number should contain only digits',ToastAndroid.SHORT);
      return;
    }

    createUserWithEmailAndPassword(auth, e, p)
      .then(({ user }) => {
        sendEmailVerification(user)
          .then(() => {
            createNewUser(e)
              .then(() => {
                ToastAndroid.show('Registration Successful!',ToastAndroid.SHORT);
                // setAlertMessage("Registration Successful!");
                // setAlertMessageTitle("Verification sent to your email.");
                // setShowAlert(true);
                // alert("Registration Successful! Verification email sent.");
                console.log("Registration Successful!");
                navigation.navigate("Login");
              })
              .catch((err) => {
                console.error(err);
              });
          })
          .catch((error) => {
            console.log(error.message);
          });
      })
      .catch((error) => {
        //error message pop-up for email in use
        setAlertMessage("Registration Failed!");
        setAlertMessageTitle("Email is already in use or badly formatted");
        setShowAlert(true);
        const errorMessage = error.message;
        console.log(errorMessage);
      });
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#141414" />
      {/* logo cointainer */}
      <View style={styles.logoContainer}>
       <ImageBackground
          style={styles.logo}
          source={require('../assets/logo.png')}/>
       </View>

      <Text style={styles.title}>Sign Up</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="rgba(255, 255, 255, 0.32)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Enter your 6 digit PIN"
          keyboardType="numeric"
          maxLength={6}
          placeholderTextColor="rgba(255, 255, 255, 0.32)"
          onChangeText={(text) => {
            const numericValue = text.replace(/[^0-9]/g, '');
            setPassword(numericValue);
            }}
            secureTextEntry
            value={password}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor="rgba(255, 255, 255, 0.32)"
          placeholder="Confirm your 6 digit PIN"
          keyboardType="numeric"
          maxLength={6}
          onChangeText={(text) => {
            const numericValue = text.replace(/[^0-9]/g, '');
            setConfirmPassword(numericValue);
          }}
          value={confirmPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholderTextColor="rgba(255, 255, 255, 0.32)"
          placeholder="Fullname"
          value={fullname}
          onChangeText={setFullname}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="rgba(255, 255, 255, 0.32)"
          keyboardType="numeric"
          maxLength={11}
          onChangeText={(text) => setContact(text.replace(/[^0-9]/g, ""))}
          value={contact}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleRegister(email, password, confirmPassword)}>
          <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <View style={styles.buttonText}> 
      <Text style={{marginTop: 10, textAlign:'center', color: Color.gray_700}}>Already have an account? </Text>
      <TouchableOpacity onPress={onPress}>
              <Text style={styles.buttonTextSignUp}> Log In</Text>
      </TouchableOpacity>
      </View>

      <AwesomeAlert
      show={showAlert}
      title={alertMessage}
      message={alertMessageTitle}
      showConfirmButton = {true}
      confirmText="Ok"
      confirmButtonStyle={{backgroundColor: Color.sUNRISECoral}}
      confirmButtonTextStyle={styles.buttonText}
      onConfirmPressed={()=>{setShowAlert(false)}}
      />

    </View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Color.blackModePrimaryDark,
    flex: 1,
    justifyContent:'center',
  },
  inputContainer: {
    
  },
  buttonTextSignUp:{
      marginTop: 10,
      color: 'royalblue',
      fontSize: 13,
      fontWeight: 'bold',
      textAlign: 'center',
      textDecorationLine: 'underline',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingTop: 0,
    color: 'gray',
    padding: 20,
    textAlign: 'center',
    fontFamily: FontFamily.poppinsBold,
    letterSpacing: 1,
    color: Color.sUNRISEWhite,
  },
  image:{
    flex: 1,
    justifyContent: 'center'
  },
  logoContainer:{
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingBottom:0,
  },  
  logo: {
    width: 220, 
    height: 220, 
    //flexDirection: 'column',
  },
  logoName: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20
  },
  logoText:{
    color: 'black',
    fontWeight: 'bold',
    fontSize: 19,
    opacity: 0.6,
   
  },
  input: {
    borderColor: '#7b61ff',
    borderWidth: 2,
    marginBottom: 5,
    padding: 10,
    margin: 10,
    color: Color.gray_700,
    fontFamily: FontFamily.poppinsBold,
    borderRadius: Border.br_xs,
    backgroundColor: Color.blackModeSecondaryDark,
    width: "95%",
    height: 56,
  },
  button: {
    marginHorizontal: 80,
    backgroundColor: "#111827",
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  buttonText: {
    padding: 5,
    color: Color.gray_700,
    fontFamily: FontFamily.poppinsBold,
    fontSize: 16,
    textAlign: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonTextLogin: {
    marginTop: 10,
    color: "black",
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
    textDecorationLine: 'underline'
  },
});

export default Registrationpage;
