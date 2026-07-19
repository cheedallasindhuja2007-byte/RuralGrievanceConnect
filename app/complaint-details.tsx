import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useLocalSearchParams } from "expo-router";

/*
=========================================
Complaint Interface
=========================================
*/

interface Complaint {
  id: string;
  name: string;
  mobile: string;
  village: string;
  district: string;
  title: string;
  description: string;
  department: string;
  status: string;
  createdAt: string;
  supportCount: number;
}

export default function ComplaintDetailsScreen() {
  /*
  =========================================
  Read Complaint ID from Navigation
  =========================================
  */

  const { complaintId } = useLocalSearchParams();

  /*
  =========================================
  State Variables
  =========================================
  */

  const [complaint, setComplaint] =
    useState<Complaint | null>(null);

  const [loading, setLoading] = useState(true);

  /*
  =========================================
  Load Complaint
  =========================================
  */

  useEffect(() => {
    loadComplaint();
  }, []);

  const loadComplaint = async () => {
  try {

    if (!complaintId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "complaints"),
      where("id", "==", complaintId)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {

      const data = snapshot.docs[0].data();

      setComplaint(data as Complaint);

    } else {
      console.log("Complaint does not exist");
    }

  } catch (error) {
    console.log(error);
  }

  setLoading(false);
};

  /*
  =========================================
  Loading Screen
  =========================================
  */

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#2E7D32"
        />
      </View>
    );
  }

  /*
  =========================================
  Complaint Not Found
  =========================================
  */

  if (!complaint) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.notFound}>
          Complaint not found.
        </Text>
      </View>
    );
  }

  /*
  =========================================
  UI Starts Here
  =========================================
  */

  return (
    <ScrollView
      contentContainerStyle={styles.container}
    >
      <Text style={styles.heading}>
        Complaint Details
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          Complaint ID
        </Text>
        <Text style={styles.value}>
          {complaint.id}
        </Text>

        <Text style={styles.label}>
          Name
        </Text>
        <Text style={styles.value}>
          {complaint.name}
        </Text>

        <Text style={styles.label}>
          Mobile Number
        </Text>
        <Text style={styles.value}>
          {complaint.mobile}
        </Text>

        <Text style={styles.label}>
          Village
        </Text>
        <Text style={styles.value}>
          {complaint.village}
        </Text>

        <Text style={styles.label}>
          District
        </Text>
        <Text style={styles.value}>
          {complaint.district}
        </Text>

        <Text style={styles.label}>
          Complaint Title
        </Text>
        <Text style={styles.value}>
          {complaint.title}
        </Text>

        <Text style={styles.label}>
          Complaint Description
        </Text>
        <Text style={styles.value}>
          {complaint.description}
        </Text>

        <Text style={styles.label}>
          Department
        </Text>
        <Text style={styles.value}>
          {complaint.department}
        </Text>

        <Text style={styles.label}>
          Current Status
        </Text>

        <View
          style={[
            styles.statusBadge,

            complaint.status === "Pending"
              ? styles.pending
              : complaint.status === "In Progress"
              ? styles.inProgress
              : styles.resolved,
          ]}
        >
          <Text style={styles.statusText}>
            {complaint.status}
          </Text>
        </View>

        <Text style={styles.label}>
          Date Submitted
        </Text>
        <Text style={styles.value}>
          {complaint.createdAt}
        </Text>
        <Text>
          👍 Supporters: {complaint.supportCount}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F4F8FB",
    flexGrow: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    elevation: 3,
  },

  label: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1B5E20",
    marginTop: 15,
  },

  value: {
    fontSize: 17,
    color: "#333333",
    marginTop: 4,
  },

  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },

  pending: {
    backgroundColor: "#FFA726",
  },

  inProgress: {
    backgroundColor: "#42A5F5",
  },

  resolved: {
    backgroundColor: "#66BB6A",
  },

  statusText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  notFound: {
    fontSize: 18,
    color: "red",
  },
});