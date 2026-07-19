import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { router } from "expo-router";

export default function AdminLogin() {
  const [code, setCode] = useState("");

  const verifyAdmin = () => {
    if (code === "RGC2026ADMIN") {
      router.replace("/admin");
    } else {
      Alert.alert(
        "Access Denied",
        "Invalid Admin Access Code."
      );
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.heading}>
        Admin Access
      </Text>

      <Text style={styles.subtitle}>
        Enter the Admin Access Code
      </Text>

      <TextInput
        placeholder="Access Code"
        value={code}
        onChangeText={setCode}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={verifyAdmin}
      >
        <Text style={styles.buttonText}>
          Login as Admin
        </Text>
      </TouchableOpacity>

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