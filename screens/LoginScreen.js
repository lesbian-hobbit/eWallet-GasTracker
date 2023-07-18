import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigation } from '@react-navigation/core'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ToastAndroid, StatusBar } from "react-native";
import { Image } from "expo-image";
import { FontFamily, FontSize, Color, Border, Padding } from "../GlobalStyles";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged  } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AwesomeAlert from 'react-native-awesome-alerts';
import { AppContext } from "../AppContext";


  const Login = ({ navigation }) => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailVerified, setEmailVerified] = useState(false); // Set initial value to false
  const [biometricAvailable, setBiometricAvailable] = useState(false); 
  const [modalVisible, setModalVisible] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const pinCodeInputRef = useRef(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertMessageText, setAlertMessageText] = useState("");
  const { showFingerprint } = useContext(AppContext);
  const [isEmailEditable, setIsEmailEditable] = useState(false);

  const onPress = () => {
    navigation.navigate("Registrationpage")
  }

  const handleEnableEmailEdit = () => {
    setIsEmailEditable(true);
  };
  
  const handleChangeEmail = () => {
    // Logic to handle email change
    // For example, you can make an API call to update the email in the backend
    ToastAndroid.show("Email changed: " + email, ToastAndroid.SHORT)
    console.log("Email changed:", email);
    setIsEmailEditable(false);
  };

  const handlePinCode = (number) => {
    setPinCode(pinCode + number);
  };

  const handlePinCodeClear = () => {
    setPinCode('');
  };

  const handleMpinImagePress = () => {
    setModalVisible(true);
    setTimeout(() => {
      pinCodeInputRef.current.focus();
    }, 0);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setEmail(user.email);
        setEmailVerified(user.emailVerified);
        navigation.replace("Main");
        console.log("email verified: ", user.emailVerified);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const checkBiometricAvailability = async () => {
      const isHardwareAvailable = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(isHardwareAvailable && isEnrolled);
    };
  
    checkBiometricAvailability();
  }, []);

  
  const handleBiometricAuth = async () => {
    try {
      const { success } = await LocalAuthentication.authenticateAsync();
      if (success) {
        const storedEmail = await AsyncStorage.getItem("email");
        const storedPassword = await AsyncStorage.getItem("password");
        if (storedEmail && storedPassword) {
          signInWithEmailAndPassword(auth, storedEmail, storedPassword)
            .then(() => {
              const user = auth.currentUser;
              if (user.emailVerified) {
                ToastAndroid.show('Login Successfully', ToastAndroid.LONG);
                navigation.navigate("Main", { email: storedEmail });
              } else {
                setAlertMessage("Verification Failed!");
                setAlertMessageText("Please verify your email to login");
                setShowAlert(true);
                navigation.navigate('Login');
                //alert("Email not verified. Please verify your email to login.");
                console.log("Email not verified");
              }
            })
            .catch((error) => {
              const errorMessage = error.message;
              alert(errorMessage);
              console.log(errorMessage);
            });
        } else {
          console.log("Stored email or password is missing.");
        }
        console.log("Biometric authentication successful");
      } else {
        ToastAndroid.show('Biometric authentication failed',ToastAndroid.LONG);
        console.log("Biometric authentication failed");
      }
    } catch (error) {
      ToastAndroid.show('Biometric authentication error:',ToastAndroid.LONG);
      console.log("Biometric authentication error:", error);
    }
  };


  const handleLogin = () => {
    if (email.trim() === "") {
      setAlertMessage("Email is empty");
      setShowAlert(true);
      return;
    }
    if (password.trim() === "") {
      setAlertMessage("PIN is empty");
      setShowAlert(true);
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        const user = auth.currentUser;
        if (user.emailVerified) {
          AsyncStorage.setItem("email", email);
          AsyncStorage.setItem("password", password);
          ToastAndroid.show('Login Successfully', ToastAndroid.LONG);
          navigation.navigate("Main", { email });
        } else {
          setAlertMessage("Verification Failed!");
          setAlertMessageText("Please verify your email to login");
          setShowAlert(true);
          navigation.navigate('Login');
          //alert("Email not verified. Please verify your email to login.");
          console.log("Email not verified");
        }
      })
      .catch((error) => {
        const errorMessage = error.message;
        //wrong password pop up message
        setAlertMessage("Wrong PIN");
        setShowAlert(true);
        console.log("wrong password");
      });
  };

  const handlePasswordChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    setPassword(numericValue);
  };

  const handleKeypadPress = (value) => {
    const updatedPassword = password + value;
    setPassword(updatedPassword);
  };

  useEffect(() => {
    const retrieveSavedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("email");
        if (savedEmail) {
          setEmail(savedEmail);
        }
      } catch (error) {
        console.log("Error retrieving saved email:", error);
      }
    };
    retrieveSavedEmail();
  }, []);

  return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#141414" />
       <View style={styles.logoContainer}>
       <Image
        style={styles.logo}
        source={require('../assets/logo.png')}
       />
       </View>
       
       <Text style={styles.title}>Log in</Text>
    
      <TextInput
        style={[styles.input, !isEmailEditable && styles.disabledInput]}
        placeholder="Email"
        placeholderTextColor="rgba(255, 255, 255, 0.32)"
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={isEmailEditable}
        onChangeText={setEmail}
      />

    <View style={styles.changeEmailContainer}>
      <TouchableOpacity onPress={isEmailEditable ? handleChangeEmail : handleEnableEmailEdit} style={styles.changeEmailButton}>
         <Text style={styles.changeEmailText}>{isEmailEditable ? 'Save' : 'Change Email'}</Text>
      </TouchableOpacity>
    </View>


      <Text style={styles.title1}>Login Using:</Text>
      <View style={styles.iconContainer}>
      <TouchableOpacity 
          onPress={handleBiometricAuth}
          >
          {showFingerprint && (
            <TouchableOpacity onPress={handleBiometricAuth}>
              <Image style={styles.icon1} source={require("../assets/fingerprint.png")} />
              <View style={styles.label}>
                <Text style={styles.labelText}>Fingerprint</Text>
              </View>
            </TouchableOpacity>
          )}
      </TouchableOpacity>


        <TouchableOpacity onPress={handleMpinImagePress}>
              <Image 
                style={styles.icon2}
                source={require("../assets/mpin.png")}
              />
              <View style={[styles.label, styles.label1]}>
                <Text style={styles.labelText}>MPIN</Text>
              </View>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonText}> 
      <Text style={{marginTop: 10, textAlign:'center', color: Color.gray_700}}>New User?</Text>
      <TouchableOpacity onPress={onPress}>
              <Text style={styles.buttonTextSignUp}> Sign Up</Text>
        </TouchableOpacity></View>

        <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={false}
      style={styles.modalContainer}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay} />
      <View style={styles.modalContentContainer}>
        <TouchableOpacity
          style={styles.closeIconContainer}
          onPress={() => setModalVisible(false)}
        >
          <Image
            style={styles.closeIcon}
            source={require('../assets/close.png')}
          />
        </TouchableOpacity>
        <View style={styles.modalInnerContainer}>
          <Text style={styles.titleText}>6 Digit PIN Code</Text>
          <Text style={styles.regularText}>{'😊'.repeat(password.length)}</Text>
          <TextInput
            style={styles.pinInput}
            ref={pinCodeInputRef}
            value={password}
            keyboardType="number-pad"
            onChangeText={(text) => setPassword(text.replace(/[^0-9]/g, ''))}
            maxLength={6}
            secureTextEntry
          />
          {/* {password.length === 6 && handleLogin()} */}
          <TouchableOpacity onPress={handleLogin} style={styles.okbutton}>
            <Text style={styles.buttonText}>Confirm</Text>
            
          </TouchableOpacity>
        </View>
      </View>
    </Modal>

    <AwesomeAlert
      show={showAlert}
      title={alertMessage}
      message={alertMessageText}
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
  closeIcon:{
    width: 30,
    height: 30,
  },
  closeIconContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  modalContainer: {
    justifyContent: 'center',
    alignContent: 'center',
    flexDirection: 'column',
  },
  label:{
    flexDirection: 'row',
    justifyContent: 'center',
    top: -20
  },
  label1:{
    top: 1
  },
  labelText:{
    color: Color.gray_700,
    fontFamily: FontFamily.poppins,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, .5)',
  },
  modalContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalInnerContainer: {
    backgroundColor: Color.gray_700,
    borderRadius: 10,
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  pinInput: {
    fontSize: 24,
    backgroundColor: '#f2f2f2',
    width: 150,
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 0
  },
  logo: {
    width: 330,
    height: 330,
  },
  title: {
    fontSize: 45,
    fontWeight: 'bold',
    paddingTop: 0,
    color: 'gray',
    padding: 20,
    textAlign: 'center',
    fontFamily: FontFamily.poppinsBold,
    letterSpacing: 1,
    color: Color.sUNRISEWhite,
  },
  title1: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingTop: 0,
    color: 'gray',
    padding: 20,
    textAlign: 'center',
    fontFamily: FontFamily.poppinsBold,
    color: Color.sUNRISEWhite,
  },
  input: {
    borderColor: '#7b61ff',
    borderWidth: 2,
    marginBottom: 10,
    padding: 10,
    margin: 10,
    color: Color.gray_700,
    fontFamily: FontFamily.poppinsBold,
    borderRadius: Border.br_xs,
    backgroundColor: Color.blackModeSecondaryDark,
    width: "95%",
    height: 56,
  },
  buttonText: {
    color: Color.gray_700,
    fontFamily: FontFamily.poppinsBold,
    fontSize: 16,
    textAlign: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  button:{
        borderRadius: Border.br_xs,
        backgroundColor: Color.sUNRISECoral,
        shadowColor: Color.gainsboro_200l,
        shadowOffset: {
        width: 0,
        height: 14,
        },
        shadowRadius: 23,
        elevation: 23,
        shadowOpacity: 1,
        width: 326,
        height: 56,
        flexDirection: "row",
        justifyContent: "center",
        overflow: "hidden",
        marginBottom: 30,
  },
  okbutton:{
        borderRadius: Border.br_xs,
        backgroundColor: Color.sUNRISECoral,
        marginTop: 10,
        width: 80,
        height: 45,
        flexDirection: "column",
        justifyContent: "center",
        marginBottom: 30,
  },
  buttonTextSignUp: {
    marginTop: 10,
    color: 'royalblue',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  header: {
    height: 120,
    padding: 20,
    borderRadius: 25,
    alignItems: 'center',
    backgroundColor: 'royalblue',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  HeadlineText: {
    fontSize: 12,
    marginBottom: 10,
    color: 'gray',
  },
  regularText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-evenly',
  },
  mediumButtonContainer: {
    height: 90,
    width: 90,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 20,
    alignContent: 'center',
    flexWrap: 'wrap',
    backgroundColor: 'white',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  smallButtonContainer: {
    height: 50,
    width: 50,
    padding: 10,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 10,
    alignContent: 'center',
    flexWrap: 'wrap',
    backgroundColor: 'black',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    padding: 10,
    left: -10,
  },
  icon1: {
    height: 100,
    width: 100,
  },
  icon2: {
    top: -15,
    height: 56,
    width: 45,
  },
  changeEmailContainer:{
    justifyContent:'center',
    alignItems: 'flex-end',
    paddingEnd: 15
  },
  changeEmailButton:{
    backgroundColor: "rgba(123, 97, 255, 0.19)",
    borderRadius: 10,
    padding: 6
  },
  changeEmailText:{
    color: Color.gray_700,
    fontFamily: FontFamily.poppinsRegular,
    fontSize: 10
  },
});

export default Login;
