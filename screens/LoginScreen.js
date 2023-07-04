import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ImageBackground } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import * as LocalAuthentication from "expo-local-authentication";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const onPress = () => {
    navigation.navigate("Registrationpage");
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

  // useEffect(() => {
  //   const retrieveSavedCredentials = async () => {
  //     try {
  //       const savedEmail = await AsyncStorage.getItem("email");
  //       const savedPassword = await AsyncStorage.getItem("password");
  //       if (savedEmail && savedPassword) {
  //         setEmail(savedEmail);
  //         setPassword(savedPassword);

  //         console.log(savedEmail, savedPassword);
  //       }
  //     } catch (error) {
  //       console.log("Error retrieving saved credentials:", error);
  //     }
  //   };

  //   retrieveSavedCredentials();
  // }, []);

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
                navigation.navigate("Main", { email: storedEmail });
              } else {
                alert("Email not verified. Please verify your email to login.");
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
        console.log("Biometric authentication failed");
      }
    } catch (error) {
      console.log("Biometric authentication error:", error);
    }
  };

  const handleLogin = () => {
    if (email.trim() === "") {
      alert("Please enter an email.");
      return;
    }
    if (password.trim() === "") {
      alert("Please enter a password.");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        const user = auth.currentUser;
        if (user.emailVerified) {
          AsyncStorage.setItem("email", email);
          AsyncStorage.setItem("password", password);
          navigation.navigate("Main", { email });
        } else {
          alert("Email not verified. Please verify your email to login.");
          console.log("Email not verified");
        }
      })
      .catch((error) => {
        const errorMessage = error.message;
        alert(errorMessage);
        console.log(errorMessage);
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

 

  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <ImageBackground
        source={require("../assets/background1.jpg")}
        resizeMode="cover"
        style={styles.image}
      >
        <View style={styles.logoContainer}>
          <ImageBackground
            style={styles.logo}
            source={require("../assets/logo.png")}
          />
        </View>

        <Text style={styles.title}>LATO-LATO INC.</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="rgba(0, 0, 0, 0.5)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
             <TextInput
  style={styles.input}
  placeholder="Password"
  placeholderTextColor="rgba(0, 0, 0, 0.5)"
  value={password}
  maxLength={6}
  onChangeText={(text) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setPassword(numericValue);

  }}
  keyboardType="numeric" // Set the keyboard type to numeric
  secureTextEntry
/>
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <Text style={{ marginTop: 10, textAlign: "center" }}>
          Already have an account?
        </Text>
        <TouchableOpacity onPress={onPress}>
          <View style={styles.buttonText}>
            <Text style={styles.buttonTextSignUp}>Signup here!</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
  style={styles.button}
  onPress={handleBiometricAuth}
  disabled={!biometricAvailable} // Disable the button if biometric authentication is not available
>
  <Text style={styles.buttonText}>Login with Biometrics</Text>
</TouchableOpacity>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    flex: 1,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "black",
    borderWidth: 2,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 15,
    margin: 10,
    fontFamily: "Roboto",
    padding: 5,
    backgroundColor: "white",
  },
  button: {
    marginHorizontal: 80,
    backgroundColor: "#111827",
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonTextLogin: {
    marginTop: 10,
    color: "black",
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
    textDecorationLine: "underline",
  },
  keypadContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  keypadButton: {
    width: 60,
    height: 60,
    backgroundColor: "gray",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    borderRadius: 5,
  },
  keypadButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  buttonTextSignUp: {
    marginTop: 10,
    color: "black",
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
    textDecorationLine: "underline",
  },
});

export default Login;