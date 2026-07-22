import { router } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { auth } from "../../firebase/firebaseConfig";
 const handleReportComplaint = () => {
    if (auth.currentUser) {
        router.push("/report");
    } else {
        router.push({
            pathname: "/login",
            params: {
                redirect: "/report",
            },
        });
    }
};

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Rural Grievance Connect
      </Text>

      <Text style={styles.subtitle}>
        Report rural issues easily to the correct government department.
      </Text>

      <TouchableOpacity  style={styles.button} onPress={handleReportComplaint}>
        <Text style={styles.buttonText}>Report Complaint</Text>
     </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/status")}
      >
        <Text style={styles.buttonText}>
          Track Complaint
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/reports")}
      >
        <Text style={styles.buttonText}>
          View Existing Complaints
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/admin-login")}
      >
        <Text style={styles.buttonText}>
          🔒 Admin Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F8FB",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 15,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },

  button: {
    backgroundColor: "#2E7D32",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});