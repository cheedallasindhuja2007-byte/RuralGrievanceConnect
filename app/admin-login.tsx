import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import { router } from "expo-router";

import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../firebase/firebaseConfig";

export default function AdminLogin() {
  const [accessCode, setAccessCode] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const verifyAccessCode = () => {
    if (accessCode.trim() === "RGC2026ADMIN") {
      setShowLogin(true);
    } else {
      Alert.alert("Access Denied", "Invalid Admin Access Code.");
    }
  };

  const handleAdminLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Validation Error", "Please enter admin email.");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Validation Error", "Please enter password.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const uid = userCredential.user.uid;

      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        Alert.alert("Access Denied", "Admin record not found.");
        await auth.signOut();
        return;
      }

      const userData = docSnap.data();

      if (userData.role !== "admin") {
        Alert.alert(
          "Access Denied",
          "You are not authorized as an administrator."
        );

        await auth.signOut();
        return;
      }

      Alert.alert("Success", "Welcome Administrator!");

      router.replace("/admin");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Admin Access</Text>

      {!showLogin ? (
        <>
          <Text style={styles.subtitle}>
            Enter the Admin Access Code
          </Text>

          <TextInput
            placeholder="Admin Access Code"
            value={accessCode}
            onChangeText={setAccessCode}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={verifyAccessCode}
          >
            <Text style={styles.buttonText}>
              Verify Code
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>
            Admin Authentication
          </Text>

          <TextInput
            placeholder="Admin Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleAdminLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                Login as Administrator
              </Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#F5F5F5",
  },

  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
    fontSize: 16,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});