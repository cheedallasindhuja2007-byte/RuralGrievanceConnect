import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

interface Complaint {
    firestoreId: string;
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
  latitude?: number;
  longitude?: number;
  image?: string;
  priority?: string;
}

export default function AdminScreen() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

const [statusFilter, setStatusFilter] =
useState("All");

const [sortOrder, setSortOrder] =
useState("Latest");
const [selectedComplaint, setSelectedComplaint] =
  useState<Complaint | null>(null);

const [remarks, setRemarks] =
  useState("");

const [newStatus, setNewStatus] =
  useState("");

const [newDepartment, setNewDepartment] =
  useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "complaints"),
      (snapshot) => {
        const data: Complaint[] = [];

      snapshot.forEach((document) => {

        const complaint = document.data() as Complaint;

        complaint.firestoreId = document.id;

        data.push(complaint);

        });

        setComplaints(data);
        setLoading(false);
      },
      (error) => {
        console.log(error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);
   const updateComplaint = async () => {

  if (!selectedComplaint) return;

  try {

    await updateDoc(

      doc(db, "complaints", selectedComplaint.firestoreId),
      {
        status: newStatus || selectedComplaint.status,
        department:
          newDepartment || selectedComplaint.department,
        remarks: remarks,
        updatedAt: new Date().toLocaleString(),
      }

    );

    Alert.alert(
      "Success",
      "Complaint updated successfully."
    );

    setSelectedComplaint(null);
    setRemarks("");
    setNewStatus("");
    setNewDepartment("");

  } catch (error) {

    console.log(error);

    Alert.alert(
      "Error",
      "Unable to update complaint."
    );

  }

};
  const totalComplaints = complaints.length;

  const pendingComplaints = complaints.filter(
    (item) => item.status === "Submitted"
  ).length;

  const progressComplaints = complaints.filter(
    (item) => item.status === "Work In Progress"
  ).length;

  const resolvedComplaints = complaints.filter(
    (item) => item.status === "Resolved"
  ).length;
  const filteredComplaints = complaints
  .filter((item) => {

    const matchesSearch =
      item.title
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||

      item.id
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||

      item.name
        .toLowerCase()
        .includes(searchText.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      item.status === statusFilter;

    return matchesSearch && matchesStatus;
  })
  .sort((a, b) => {

    if (sortOrder === "Latest") {

      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      );

    }

    return (
      new Date(a.createdAt).getTime() -
      new Date(b.createdAt).getTime()
    );

  });

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator
          size="large"
          color="#2E7D32"
        />

        <Text>Loading Complaints...</Text>
      </View>
    );
  }

  return (
    
        
    
    <View style={styles.container}>
        <TextInput
        placeholder="Search Complaint..."
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchInput}
        />
        <View style={styles.filterRow}>

  <TouchableOpacity
    style={styles.filterButton}
    onPress={() => setStatusFilter("All")}
  >
    <Text>All</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.filterButton}
    onPress={() => setStatusFilter("Submitted")}
  >
    <Text>Pending</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.filterButton}
    onPress={() => setStatusFilter("Work In Progress")}
  >
    <Text>Progress</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.filterButton}
    onPress={() => setStatusFilter("Resolved")}
  >
    <Text>Resolved</Text>
  </TouchableOpacity>

</View>
<TouchableOpacity
  style={styles.sortButton}
  onPress={() =>

    setSortOrder(

      sortOrder === "Latest"
        ? "Oldest"
        : "Latest"

    )

  }
>

  <Text style={styles.sortText}>

    Sort :
    {sortOrder}

  </Text>

</TouchableOpacity>
      <Text style={styles.heading}>
        Admin Dashboard
      </Text>

      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.number}>
            {totalComplaints}
          </Text>

          <Text style={styles.label}>
            Total
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.number}>
            {pendingComplaints}
          </Text>

          <Text style={styles.label}>
            Pending
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.number}>
            {progressComplaints}
          </Text>

          <Text style={styles.label}>
            In Progress
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.number}>
            {resolvedComplaints}
          </Text>

          <Text style={styles.label}>
            Resolved
          </Text>
        </View>
      </View>

      <FlatList
        data={filteredComplaints}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.complaintCard}>
            <Text style={styles.title}>
              {item.title}
            </Text>

            <Text>
              Complaint ID : {item.id}
            </Text>

            <Text>
              Citizen : {item.name}
            </Text>

            <Text>
              Mobile : {item.mobile}
            </Text>

            <Text>
              Village : {item.village}
            </Text>

            <Text>
              District : {item.district}
            </Text>

            <Text>
              Department : {item.department}
            </Text>

            <Text>
              Status : {item.status}
            </Text>
            <TouchableOpacity
            style={styles.updateButton}
            onPress={() => {

                setSelectedComplaint(item);

                setNewStatus(item.status);

                setNewDepartment(item.department);

            }}
            >

            <Text style={styles.updateText}>
                Update Complaint
            </Text>

            </TouchableOpacity>
          </View>
        )}
      />
      {selectedComplaint && (

<View style={styles.updateCard}>

<Text style={styles.title}>
Update Complaint
</Text>

<TextInput
  style={styles.searchInput}
  value={newDepartment}
  onChangeText={setNewDepartment}
  placeholder="Department"
/>

<TextInput
  style={styles.searchInput}
  value={newStatus}
  onChangeText={setNewStatus}
  placeholder="Status"
/>

<TextInput
  style={styles.searchInput}
  value={remarks}
  onChangeText={setRemarks}
  placeholder="Remarks"
/>

<TouchableOpacity
  style={styles.saveButton}
  onPress={updateComplaint}
>

<Text style={styles.saveText}>
Save Changes
</Text>

</TouchableOpacity>

</View>

)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 15,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  heading: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2E7D32",
    marginBottom: 20,
  },

  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
    alignItems: "center",
  },

  number: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2E7D32",
  },

  label: {
    marginTop: 5,
    fontSize: 15,
    color: "#555",
  },

  complaintCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 6,
  },
  searchInput: {
  backgroundColor: "#FFFFFF",
  borderRadius: 8,
  padding: 12,
  marginBottom: 15,
  borderWidth: 1,
  borderColor: "#CCCCCC",
},

filterRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 15,
},

filterButton: {
  backgroundColor: "#E8F5E9",
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 8,
},

sortButton: {
  backgroundColor: "#2E7D32",
  padding: 12,
  borderRadius: 8,
  alignItems: "center",
  marginBottom: 20,
},

sortText: {
  color: "#FFFFFF",
  fontWeight: "bold",
},
updateButton: {
  backgroundColor: "#1565C0",
  marginTop: 10,
  padding: 10,
  borderRadius: 8,
  alignItems: "center",
},

updateText: {
  color: "#FFFFFF",
  fontWeight: "bold",
},

updateCard: {
  backgroundColor: "#FFFFFF",
  padding: 15,
  borderRadius: 10,
  marginTop: 20,
  marginBottom: 20,
  elevation: 3,
},

saveButton: {
  backgroundColor: "#2E7D32",
  padding: 12,
  borderRadius: 8,
  alignItems: "center",
},

saveText: {
  color: "#FFFFFF",
  fontWeight: "bold",
},
});