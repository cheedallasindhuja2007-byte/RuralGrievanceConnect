import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../../firebase/firebaseConfig";

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } catch (error) {
        console.log(error);
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);

      Alert.alert("Success", "Logged out successfully.");

      router.replace("/");
    } catch (error: any) {
      Alert.alert("Logout Failed", error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!auth.currentUser) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>You are not logged in</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/signup")}
        >
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Profile</Text>

      <Text style={styles.item}>
        Full Name: {userData?.fullName}
      </Text>

      <Text style={styles.item}>
        Email: {userData?.email}
      </Text>

      <Text style={styles.item}>
        Mobile: {userData?.mobileNumber}
      </Text>

      <Text style={styles.item}>
        Role: {userData?.role}
      </Text>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: "#F5F7FA",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 25,
  },

  title: {
    fontSize: 20,
    marginBottom: 20,
  },

  item: {
    fontSize: 18,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#1E88E5",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    width: "100%",
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  logoutButton: {
    marginTop: 40,
    backgroundColor: "#E53935",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});