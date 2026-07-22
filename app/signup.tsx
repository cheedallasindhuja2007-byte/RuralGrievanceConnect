import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
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

export default function SignupScreen() {
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert("Validation Error", "Please enter your full name.");
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid 10-digit mobile number."
      );
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid email address."
      );
      return false;
    }

    if (password.length < 6) {
      Alert.alert(
        "Validation Error",
        "Password must contain at least 6 characters."
      );
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Validation Error",
        "Passwords do not match."
      );
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
  if (!validateForm()) return;

  setLoading(true);

  try {
    // Create Firebase Authentication account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    const user = userCredential.user;

    // Store user details in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      fullName: fullName.trim(),
      mobileNumber: mobile.trim(),
      email: email.trim().toLowerCase(),
      role: "citizen",
      createdAt: serverTimestamp(),
    });

    Alert.alert(
      "Registration Successful",
      "Your account has been created successfully."
    );

    // Navigate to Home Screen
    router.replace("/");

  } catch (error: any) {

    let message = "Something went wrong.";

    switch (error.code) {

      case "auth/email-already-in-use":
        message = "This email is already registered.";
        break;

      case "auth/invalid-email":
        message = "Please enter a valid email.";
        break;

      case "auth/weak-password":
        message = "Password should contain at least 6 characters.";
        break;

      case "auth/network-request-failed":
        message = "Please check your internet connection.";
        break;

      default:
        message = error.message;
    }

    Alert.alert("Registration Failed", message);

  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        keyboardType="phone-pad"
        maxLength={10}
        value={mobile}
        onChangeText={setMobile}
      />

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

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Create Account</Text>
        )}
      </TouchableOpacity>

      {/*<TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.loginText}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>*/}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 25,
    justifyContent: "center",
    backgroundColor: "#F5F7FA",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#1E3A8A",
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  button: {
    backgroundColor: "#1E88E5",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },

  loginText: {
    marginTop: 25,
    textAlign: "center",
    color: "#1E88E5",
    fontWeight: "600",
  },
});