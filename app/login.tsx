import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router } from "expo-router";

import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../firebase/firebaseConfig";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert("Validation Error", "Please enter your email.");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert("Validation Error", "Please enter a valid email.");
      return false;
    }

    if (!password) {
      Alert.alert("Validation Error", "Please enter your password.");
      return false;
    }

    return true;
  };
  const { redirect } = useLocalSearchParams<{
    redirect?: string;
   }>();
  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Login with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = userCredential.user;

      // Read user document from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        await signOut(auth);

        Alert.alert(
          "Login Failed",
          "User information not found."
        );

        return;
      }

      const userData = userDoc.data();

      // Role-Based Navigation
      if (userData.role === "citizen") {
        if (redirect) {
            router.replace(redirect as any);
        } else {
            router.back();
        }
      } else if (userData.role === "admin") {
        router.replace("/admin");
      } else {
        await signOut(auth);

        Alert.alert(
          "Login Failed",
          "Invalid user role."
        );
      }

    } catch (error: any) {

      let message = "Something went wrong.";

      switch (error.code) {

        case "auth/user-not-found":
          message = "No account found with this email.";
          break;

        case "auth/wrong-password":
          message = "Incorrect password.";
          break;

        case "auth/invalid-email":
          message = "Invalid email address.";
          break;

        case "auth/invalid-credential":
          message = "Invalid email or password.";
          break;

        case "auth/network-request-failed":
          message = "Please check your internet connection.";
          break;

        default:
          message = error.message;
      }

      Alert.alert("Login Failed", message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>
        Login
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            Login
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/signup")}
      >
        <Text style={styles.signupText}>
          Don't have an account? Sign Up
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#F5F7FA",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#1E3A8A",
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  button: {
    backgroundColor: "#1E88E5",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },

  signupText: {
    marginTop: 25,
    textAlign: "center",
    color: "#1E88E5",
    fontWeight: "600",
  },

});