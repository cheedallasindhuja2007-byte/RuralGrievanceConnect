import { Linking } from "react-native";
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Image,
  
} from "react-native";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

import { useFocusEffect, router } from "expo-router";

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

  lastUpdated: string;
  photo: string | null;
  latitude: number | null;
  longitude: number | null;
  locationVerified: boolean;
}

export default function ReportsScreen() {
  /*
  =========================================
  State Variables
  =========================================
  */

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  /*
  =========================================
  Load Complaints
  =========================================
  */

  const loadComplaints = async () => {
  try {
    const querySnapshot = await getDocs(
      collection(db, "complaints")
    );

    const complaintList: Complaint[] = [];

    querySnapshot.forEach((doc) => {

  complaintList.push({
    id: doc.id,
    ...doc.data(),
  } as Complaint);

});
    console.log("Complaints from Firestore:", complaintList);

    setComplaints(complaintList);
    setFilteredComplaints(complaintList);
  } catch (error) {
    console.log(error);
  }
};

  /*
  =========================================
  Refresh List
  =========================================
  */

  const onRefresh = async () => {
    setRefreshing(true);

    await loadComplaints();

    setRefreshing(false);
  };

  /*
  =========================================
  Reload Screen Every Time User Returns
  =========================================
  */

  useFocusEffect(
    useCallback(() => {
      loadComplaints();
    }, [])
  );

  /*
  =========================================
  Search Complaints
  =========================================
  */

  const searchComplaint = (text: string) => {
    setSearchText(text);

    if (text.trim() === "") {
      setFilteredComplaints(complaints);
      return;
    }

    const filtered = complaints.filter((item) => {
      return (
        item.id.toLowerCase().includes(text.toLowerCase()) ||
        item.title.toLowerCase().includes(text.toLowerCase())
      );
    });

    setFilteredComplaints(filtered);
  };
    /*
  =========================================
  UI Starts Here
  =========================================
  */

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Existing Complaints
      </Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by Complaint ID or Title"
        value={searchText}
        onChangeText={searchComplaint}
      />

      {filteredComplaints.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No complaints submitted yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredComplaints}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/complaint-details",
                  params: {
                    complaintId: item.id,
                  },
                })
              }
            >
              {item.photo && (
                <Image
                  source={{ uri: item.photo }}
                  style={styles.complaintImage}
                />
              )}
              <Text style={styles.cardTitle}>
                {item.title}
              </Text>
              <Text style={styles.label}>Latitude</Text>
              <Text style={styles.value}>
                {item.latitude ?? "Not Available"}
              </Text>

              <Text style={styles.label}>Longitude</Text>
              <Text style={styles.value}>
                {item.longitude ?? "Not Available"}
              </Text>
              {item.latitude && item.longitude && (
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() =>
                    Linking.openURL(
                      `https://www.google.com/maps?q=${item.latitude},${item.longitude}`
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

              

              <Text style={styles.cardText}>
                Complaint ID:
                {" "}
                {item.id}
              </Text>

              <Text style={styles.cardText}>
                Department:
                {" "}
                {item.department}
              </Text>

              <Text style={styles.cardText}>
                Date:
                {" "}
                {item.createdAt}
              </Text>

              <Text style={styles.info}>
                Status: {item.status}
              </Text>
              <Text style={styles.info}>
                👍 Supporters: {item.supportCount ?? 1}
              </Text>

              <Text style={styles.info}>
                Last Updated:
                {" "}
                {item.lastUpdated ?? item.createdAt}
              </Text>

              <View
                style={[
                  styles.statusBadge,

                  item.status === "Pending"
                    ? styles.pending

                    : item.status === "In Progress"
                    ? styles.inProgress

                    : styles.resolved,
                ]}
              >
                <Text style={styles.statusText}>
                  {item.status}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
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

  searchInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    fontSize: 18,
    color: "gray",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 10,
  },

  cardText: {
    fontSize: 15,
    marginBottom: 5,
    color: "#444",
  },

  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
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
  info: {
  fontSize: 15,
  color: "#555",
  marginTop: 4,
},
complaintImage: {
  width: "100%",
  height: 200,
  borderRadius: 10,
  marginBottom: 15,
},
label: {
  fontSize: 16,
  fontWeight: "bold",
  color: "#2E7D32",
  marginTop: 12,
},

value: {
  fontSize: 15,
  color: "#444",
  marginBottom: 8,
},
mapButton: {
  backgroundColor: "#1976D2",
  padding: 12,
  borderRadius: 8,
  alignItems: "center",
  marginTop: 12,
},

mapButtonText: {
  color: "#FFFFFF",
  fontWeight: "bold",
  fontSize: 16,
},
locationTitle: {
  fontSize: 18,
  fontWeight: "bold",
  color: "#2E7D32",
  marginTop: 15,
  marginBottom: 10,
},

latitudeLabel: {
  fontSize: 16,
  fontWeight: "bold",
  color: "#1B5E20",
  marginTop: 8,
},

latitudeValue: {
  fontSize: 15,
  color: "#444",
  marginBottom: 8,
},

longitudeLabel: {
  fontSize: 16,
  fontWeight: "bold",
  color: "#1B5E20",
  marginTop: 8,
},

longitudeValue: {
  fontSize: 15,
  color: "#444",
  marginBottom: 12,
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
});