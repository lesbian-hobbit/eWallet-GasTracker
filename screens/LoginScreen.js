import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailVerified, setEmailVerified] = useState(false); // Set initial value to false

  const onPress = () => {
    navigation.navigate("Registrationpage");
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setEmail(user.email); // Fetch the user's email
        setEmailVerified(user.emailVerified);
        navigation.replace("Main");
        console.log("email verified: ", user.emailVerified);
      }
    });

    return unsubscribe;
  }, []);

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
          navigation.navigate("Main", {
            email: email,
          });
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
        
        <View style={styles.keypadContainer}>
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={() => handleKeypadPress("1")}
          >
            <Text style={styles.keypadButtonText}>1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={() => handleKeypadPress("2")}
          >
            <Text style={styles.keypadButtonText}>2</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={() => handleKeypadPress("3")}
          >
            <Text style={styles.keypadButtonText}>3</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={() => handleKeypadPress("4")}
          >
            <Text style={styles.keypadButtonText}>4</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={() => handleKeypadPress("5")}
          >
            <Text style={styles.keypadButtonText}>5</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={() => handleKeypadPress("6")}
          >
            <Text style={styles.keypadButtonText}>6</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={() => handleKeypadPress("7")}
          >
            <Text style={styles.keypadButtonText}>8</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={() => handleKeypadPress("9")}
          >
            <Text style={styles.keypadButtonText}>9</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={() => handleKeypadPress("0")}
          >
            <Text style={styles.keypadButtonText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={() => handleKeypadPress("3")}
          >
            <Text style={styles.keypadButtonText}>3</Text>
          </TouchableOpacity>
          {/* Add more buttons as needed */}
        </View>
        
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