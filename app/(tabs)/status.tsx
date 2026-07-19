import { Linking } from "react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from "react-native";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";

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

  lastUpdated: string;
  photo: string | null;
  latitude: number | null;
  longitude: number | null;
  locationVerified: boolean;
}
export default function StatusScreen() {
  const [searchText, setSearchText] = useState("");

  const [complaint, setComplaint] =
    useState<Complaint | null>(null);

  /*
  =====================================
  Timeline Stages
  =====================================
  */

  const timelineStages = [
    "Submitted",
    "Forwarded",
    "Department Accepted",
    "Work In Progress",
    "Resolved",
  ];

  /*
  =====================================
  Get Current Stage
  =====================================
  */

  const getCurrentStage = (status: string) => {
    return timelineStages.indexOf(status);
  };

  /*
  =====================================
  Search Complaint
  =====================================
  */

  const searchComplaint = async () => {
    if (searchText.trim() === "") {
      Alert.alert(
        "Validation Error",
        "Please enter Complaint ID or Mobile Number."
      );
      return;
    }

    try {
      const querySnapshot = await getDocs(
      collection(db, "complaints")
    );

    const complaints: Complaint[] = [];

    querySnapshot.forEach((doc) => {
      complaints.push(doc.data() as Complaint);
    });

    if (complaints.length === 0) {
      Alert.alert(
        "No Complaints",
        "No complaints found."
      );
      return;
    }

      const foundComplaint = complaints.find(
        (item) =>
          item.id.toLowerCase() ===
            searchText.toLowerCase() ||
          item.mobile === searchText
      );

      if (!foundComplaint) {
        setComplaint(null);

        Alert.alert(
          "Not Found",
          "Complaint not found."
        );

        return;
      }

      /*
      Convert old statuses
      */

      if (
        foundComplaint.status === "Pending"
      ) {
        foundComplaint.status = "Submitted";
      }

      if (
        foundComplaint.status === "In Progress"
      ) {
        foundComplaint.status =
          "Work In Progress";
      }

      setComplaint(foundComplaint);
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Error",
        "Unable to search complaint."
      );
    }
  };

  const currentStage = complaint
    ? getCurrentStage(complaint.status)
    : -1;
    return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 30,
      }}
    >
      <Text style={styles.heading}>
        Track Complaint
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Complaint ID or Mobile Number"
        value={searchText}
        onChangeText={setSearchText}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={searchComplaint}
      >
        <Text style={styles.buttonText}>
          Search Complaint
        </Text>
      </TouchableOpacity>

      {complaint && (
        <View style={styles.card}>

          <Text style={styles.cardHeading}>
            Complaint Details
          </Text>
          {complaint.photo && (
            <Image
              source={{ uri: complaint.photo }}
              style={styles.complaintImage}
            />
          )}

          <Text style={styles.label}>
            Complaint ID
          </Text>

          <Text style={styles.value}>
            {complaint.id}
          </Text>

          <Text style={styles.label}>
            Complaint Title
          </Text>

          <Text style={styles.value}>
            {complaint.title}
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

          <Text style={styles.value}>
            {complaint.status}
          </Text>

          <Text style={styles.label}>
            👍 Supporters
          </Text>

          <Text style={styles.value}>
            {complaint.supportCount ?? 1}
          </Text>

          <Text style={styles.label}>
            Last Updated
          </Text>

          <Text style={styles.value}>
            {complaint.lastUpdated ?? complaint.createdAt}
          </Text>

          <Text style={styles.label}>
            Complaint Progress
          </Text>

          <View style={styles.timelineContainer}>

            {timelineStages.map(
              (stage, index) => {

                const completed =
                  index < currentStage;

                const active =
                  index === currentStage;

                return (
                  <View
                    key={stage}
                    style={styles.timelineItem}
                  >

                    <View
                      style={styles.timelineLeft}
                    >

                      <View
                        style={[
                          styles.circle,

                          completed &&
                            styles.completedCircle,

                          active &&
                            styles.activeCircle,
                        ]}
                      />

                      {index !==
                        timelineStages.length -
                          1 && (
                        <View
                          style={[
                            styles.line,

                            completed &&
                              styles.completedLine,
                          ]}
                        />
                      )}

                    </View>

                    <Text
                      style={[
                        styles.timelineText,

                        completed &&
                          styles.completedTimelineText,

                        active &&
                          styles.activeTimelineText,
                      ]}
                    >
                      {stage}
                    </Text>

                  </View>
                );
              }
            )}

          </View>

          <Text style={styles.label}>
            Submission Date
          </Text>

          <Text style={styles.label}>
            Latitude
          </Text>

          <Text style={styles.value}>
            {complaint.latitude ?? "Not Available"}
          </Text>

          <Text style={styles.label}>
            Longitude
          </Text>

          <Text style={styles.value}>
            {complaint.longitude ?? "Not Available"}
          </Text>
          {complaint.latitude && complaint.longitude && (
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() =>
                Linking.openURL(
                  `https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`
                )
              }
            >
              <Text style={styles.mapButtonText}>
                🗺️ Open in Google Maps
              </Text>
            </TouchableOpacity>
          )}
          <Text style={styles.locationTitle}>
            Location Verification
          </Text>

          <Text
            style={
              complaint.locationVerified
                ? styles.verifiedText
                : styles.notVerifiedText
            }
          >
            {complaint.locationVerified
              ? "✅ Verified"
              : "❌ Not Verified"}
          </Text>
          <Text style={styles.value}>
            {complaint.createdAt}
          </Text>

        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
       container: {
    flex: 1,
    backgroundColor: "#F4F8FB",
    padding: 20,
  },

  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#2E7D32",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 25,
    elevation: 3,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    elevation: 5,
  },

  cardHeading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 20,
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
    marginTop: 5,
    marginBottom: 5,
  },

  timelineContainer: {
    marginTop: 15,
    marginBottom: 20,
    paddingLeft: 5,
  },

  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 50,
  },

  timelineLeft: {
    alignItems: "center",
    marginRight: 15,
  },

  circle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#D0D0D0",
  },

  completedCircle: {
    backgroundColor: "#4CAF50",
  },

  activeCircle: {
    backgroundColor: "#FF9800",
  },

  line: {
    width: 3,
    flex: 1,
    minHeight: 35,
    backgroundColor: "#D0D0D0",
    marginTop: 2,
  },

  completedLine: {
    backgroundColor: "#4CAF50",
  },

  timelineText: {
    fontSize: 16,
    color: "#999999",
    marginBottom: 30,
    flex: 1,
  },

  completedTimelineText: {
    color: "#4CAF50",
    fontWeight: "bold",
  },

  activeTimelineText: {
    color: "#FF9800",
    fontWeight: "bold",
  },
  complaintImage: {
  width: "100%",
  height: 220,
  borderRadius: 10,
  marginBottom: 20,
},
mapButton: {
  backgroundColor: "#1976D2",
  padding: 12,
  borderRadius: 8,
  alignItems: "center",
  marginTop: 15,
},

mapButtonText: {
  color: "#FFFFFF",
  fontWeight: "bold",
  fontSize: 16,
},
verifiedText: {
  color: "#2E7D32",
  fontSize: 16,
  fontWeight: "bold",
  marginTop: 5,
},

notVerifiedText: {
  color: "#D32F2F",
  fontSize: 16,
  fontWeight: "bold",
  marginTop: 5,
},
locationTitle: {
  fontSize: 18,
  fontWeight: "bold",
  color: "#2E7D32",
  marginTop: 15,
  marginBottom: 8,
},
});