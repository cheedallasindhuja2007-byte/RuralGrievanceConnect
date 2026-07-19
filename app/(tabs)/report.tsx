import * as Location from "expo-location";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
   Linking,
} from "react-native";
import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";

import * as ImagePicker from "expo-image-picker";

/*
==========================================
Complaint Interface
==========================================
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

export default function ReportScreen() {
  /*
  ==========================================
  Form State Variables
  ==========================================
  */

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [village, setVillage] = useState("");
  const [district, setDistrict] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);

const [longitude, setLongitude] = useState<number | null>(null);

const [loadingLocation, setLoadingLocation] = useState(false);
const [locationVerified, setLocationVerified] =
  useState(false);

  /*
  ==========================================
  Automatically Detect Department
  ==========================================
  */

  const detectDepartment = (text: string): string => {
    const complaint = text.toLowerCase();

    // Roads

    if (
      complaint.includes("road") ||
      complaint.includes("roads") ||
      complaint.includes("pothole") ||
      complaint.includes("bridge")
    ) {
      return "Roads & Buildings Department";
    }

    // Water

    if (
      complaint.includes("water") ||
      complaint.includes("drinking water") ||
      complaint.includes("tap") ||
      complaint.includes("pipe")
    ) {
      return "Rural Water Supply Department";
    }

    // Electricity

    if (
      complaint.includes("electricity") ||
      complaint.includes("power") ||
      complaint.includes("current") ||
      complaint.includes("transformer")
    ) {
      return "Electricity Department";
    }

    // Garbage

    if (
      complaint.includes("garbage") ||
      complaint.includes("waste") ||
      complaint.includes("dustbin") ||
      complaint.includes("cleanliness")
    ) {
      return "Panchayat";
    }

    // Street Lights

    if (
      complaint.includes("street light") ||
      complaint.includes("streetlight") ||
      complaint.includes("light pole")
    ) {
      return "Municipality";
    }

    // Education

    if (
      complaint.includes("school") ||
      complaint.includes("teacher") ||
      complaint.includes("student") ||
      complaint.includes("college")
    ) {
      return "Education Department";
    }

    // Health

    if (
      complaint.includes("hospital") ||
      complaint.includes("doctor") ||
      complaint.includes("medical") ||
      complaint.includes("health")
    ) {
      return "Health Department";
    }

    return "General Administration";
  };

  /*
  ==========================================
  Generate Complaint ID
  ==========================================
  */

  const generateComplaintId = () => {
    const timestamp = Date.now();

    return `RGC-${timestamp}`;
  };
  /*
=========================================
Duplicate Complaint Detection
=========================================
*/

/*
Convert text into lowercase
Remove punctuation
Split into words
*/

const getWords = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(" ")
    .filter((word) => word.length > 2);
};

/*
Calculate similarity
*/

const calculateSimilarity = (
  text1: string,
  text2: string
): number => {

  const words1 = getWords(text1);

  const words2 = getWords(text2);

  const commonWords = words1.filter(
    (word) => words2.includes(word)
  );

  const totalWords = new Set([
    ...words1,
    ...words2,
  ]);

  return commonWords.length / totalWords.size;
};
/*
=========================================
Find Similar Complaint
=========================================
*/

const findSimilarComplaint = (
  description: string,
  complaints: Complaint[]
) => {

  for (const complaint of complaints) {

    const score = calculateSimilarity(
      description,
      complaint.description
    );

    /*
    60% Similarity
    */

    if (score >= 0.6) {
      return complaint;
    }
  }

  return null;
};
const takePhoto = async () => {
  Alert.alert("Button Pressed");
  // Ask for camera permission
  const permission =
    await ImagePicker.requestCameraPermissionsAsync();

  // If permission is denied
  if (!permission.granted) {
    Alert.alert(
      "Camera Permission Required",
      "Please allow camera access to capture a complaint photo."
    );
    return;
  }

  // Open the device camera
  const result =
    await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

  // If user captures a photo
  if (!result.canceled) {
    setPhoto(result.assets[0].uri);
  }
};
const pickImage = async () => {
  // Request gallery permission
  const permission =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  // If permission is denied
  if (!permission.granted) {
    Alert.alert(
      "Gallery Permission Required",
      "Please allow gallery access to select an image."
    );
    return;
  }

  // Open gallery
  const result =
    await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: false,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

  // User cancelled
  if (result.canceled) {
    return;
  }

  // Get selected image
  const selectedImage = result.assets[0];

  // Validate image type
  // Allowed image formats
const allowedFormats = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];
// Maximum size = 5 MB
const MAX_SIZE = 5 * 1024 * 1024;

if (
  selectedImage.fileSize &&
  selectedImage.fileSize > MAX_SIZE
) {
  Alert.alert(
    "Image Too Large",
    "Please select an image smaller than 5 MB."
  );
  return;
}

// Check file type
if (
  selectedImage.mimeType &&
  !allowedFormats.includes(selectedImage.mimeType)
) {
  Alert.alert(
    "Unsupported Image",
    "Please select a JPG, JPEG, PNG, or WEBP image."
  );
  return;
}

  // Save image URI
  setPhoto(selectedImage.uri);
};
const getCurrentLocation = async () => {
  try {
    // Show loading
    setLoadingLocation(true);

    // Request permission
    const { status } =
      await Location.requestForegroundPermissionsAsync();

    // Permission denied
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Location permission is required to capture your complaint location."
      );

      setLoadingLocation(false);
      return;
    }

    // Get current location
    const location =
      await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

    // Save coordinates
    setLatitude(location.coords.latitude);

    setLongitude(location.coords.longitude);
    setLocationVerified(false);

    // Stop loading
    setLoadingLocation(false);
  } catch (error) {
    setLoadingLocation(false);

    Alert.alert(
      "Location Error",
      "Unable to retrieve your current location."
    );

    console.log(error);
  }
};
const openGoogleMaps = () => {
  if (latitude === null || longitude === null) {
    Alert.alert(
      "Location Not Available",
      "Please capture your location first."
    );
    return;
  }

  const url = `https://www.google.com/maps?q=${latitude},${longitude}`;

  Linking.openURL(url);
};

{/* ===========================
        GPS Location
=========================== */}
<>
<Text style={styles.label}>
  Complaint Location
</Text>

<TouchableOpacity
  style={styles.locationButton}
  onPress={getCurrentLocation}
>
  <Text style={styles.photoButtonText}>
    📍 Get Current Location
  </Text>
</TouchableOpacity>

{/* Loading */}

{loadingLocation && (
  <View style={styles.loadingContainer}>
    <ActivityIndicator
      size="large"
      color="#2E7D32"
    />

    <Text style={styles.loadingText}>
      Getting your location...
    </Text>
  </View>
)}
</>

{/* Display Coordinates */}

{latitude !== null && longitude !== null && (
  <View style={styles.locationCard}>
    <Text style={styles.locationTitle}>
      Current Coordinates
    </Text>

    <Text style={styles.coordinateText}>
      Latitude: {latitude}
    </Text>

    <Text style={styles.coordinateText}>
      Longitude: {longitude}
    </Text>
  </View>
  );
 <> 
  <TouchableOpacity
    style={styles.mapButton}
    onPress={openGoogleMaps}
  >
    <Text style={styles.mapButtonText}>
      🗺️ View on Google Maps
    </Text>
  </TouchableOpacity>


<TouchableOpacity
  style={
    styles.verifyButton
  }
  onPress={() => {
    setLocationVerified(true);

    Alert.alert(
      "Location Verified",
      "Your current location has been verified successfully."
    );
  }}
>
  <Text style={styles.verifyButtonText}>
    "✔ Verify Location
  </Text>
</TouchableOpacity>

<Text style={styles.verificationStatus}>
  Verification Status:{" "}
  {locationVerified
    ? "✅ Verified"
    : "❌ Not Verified"}
</Text>
</>
}

    /*
  ==========================================
  Submit Complaint
  ==========================================
  */

  const handleSubmit = async () => {
    // Validate Empty Fields
    if (
      name.trim() === "" ||
      mobile.trim() === "" ||
      village.trim() === "" ||
      district.trim() === "" ||
      title.trim() === "" ||
      description.trim() === ""
    ) {
      Alert.alert(
        "Validation Error",
        "Please fill all the fields."
      );
      return;
    }

    // Validate Mobile Number
    if (!/^\d{10}$/.test(mobile)) {
      Alert.alert(
        "Validation Error",
        "Mobile number must contain exactly 10 digits."
      );
      return;
    }

    // Validate Description Length
    if (description.trim().length < 20) {
      Alert.alert(
        "Validation Error",
        "Complaint description must contain at least 20 characters."
      );
      return;
    }
    if (latitude === null || longitude === null) {
  Alert.alert(
    "Location Required",
    "Please capture your current location before submitting the complaint."
  );
  return;
}
//if (!locationVerified) {
 // Alert.alert(
  //  "Location Verification Required",
   // "Please verify your location before submitting the complaint."
  //);
 // return;
//}

    // Generate Complaint ID
    const complaintId = generateComplaintId();

    // Create Complaint Object
   const newComplaint: Complaint = {
  id: complaintId,
  name,
  mobile,
  village,
  district,
  title,
  description,
  department,
  status: "Submitted",

  createdAt: new Date().toLocaleString(),

  supportCount: 1,

  lastUpdated: new Date().toLocaleString(),
  photo: photo,
  latitude: latitude,
  longitude: longitude,
  locationVerified: locationVerified,
};

    try {
      // Read Existing Complaints
      const querySnapshot = await getDocs(
      collection(db, "complaints")
    );

    const complaints: Complaint[] = [];

    querySnapshot.forEach((doc) => {
      complaints.push(doc.data() as Complaint);
    });
      const similarComplaint = findSimilarComplaint(
        description,
        complaints
      );
      if (similarComplaint) {
Alert.alert(
  "⚠ Similar Complaint Found",

  `A similar complaint already exists.

Complaint ID:
${similarComplaint.id}

Title:
${similarComplaint.title}

Department:
${similarComplaint.department}

Current Status:
${similarComplaint.status}

Supporters:
${similarComplaint.supportCount ?? 1}

Would you like to support this complaint instead?`,

  [
    {
      text: "Support Existing",
      onPress: async () => {

  /*
  Older complaints may not have supportCount.
  */

  if (similarComplaint.supportCount == null) {
    similarComplaint.supportCount = 1;
  }

  /*
  Increase supporter count.
  */

  similarComplaint.supportCount++;

  /*
  Update last updated date and time.
  */

  similarComplaint.lastUpdated =
    new Date().toLocaleString();

  /*
  Save updated complaints.
  */

  await addDoc(collection(db, "complaints"), newComplaint);

  Alert.alert(
    "Support Added",

    `Thank you for supporting this complaint!

Complaint ID:
${similarComplaint.id}

Department:
${similarComplaint.department}

Current Status:
${similarComplaint.status}

Supporters:
${similarComplaint.supportCount}

Last Updated:
${similarComplaint.lastUpdated}`
  );
},
    },

    {
      text: "Submit Anyway",

      onPress: async () => {

        await addDoc(
        collection(db, "complaints"),
        newComplaint
      );

        Alert.alert(
          "Success",
          "Complaint submitted successfully."
        );
        setPhoto(null);
        setLatitude(null);
        setLongitude(null);
        setLocationVerified(false);
      },
      
    },

    {
      text: "Cancel",
      style: "cancel",
    },
    
  ]
);

  return;
}

      // Add New Complaint
        await addDoc(
        collection(db, "complaints"),
        newComplaint
      );

      Alert.alert(
        "Complaint Submitted Successfully",
        `Complaint ID : ${complaintId}
         Department : ${department}
         Status : Submitted`
      );

      // Clear Form
      setName("");
      setMobile("");
      setVillage("");
      setDistrict("");
      setTitle("");
      setDescription("");
      setDepartment("");
      setPhoto(null);
      setLatitude(null);
      setLongitude(null);
    } catch (error) {
      Alert.alert(
        "Error",
        "Unable to save complaint."
      );
    }
  };


  /*
  ==========================================
  UI Starts Here
  ==========================================
  */

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>
        Report Complaint
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Your Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter Mobile Number"
        keyboardType="number-pad"
        maxLength={10}
        value={mobile}
        onChangeText={setMobile}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter Village"
        value={village}
        onChangeText={setVillage}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter District"
        value={district}
        onChangeText={setDistrict}
      />

      <TextInput
        style={styles.input}
        placeholder="Complaint Title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, styles.description]}
        placeholder="Describe your complaint in detail..."
        multiline
        numberOfLines={5}
        textAlignVertical="top"
        value={description}
        onChangeText={(text) => {
          setDescription(text);
          setDepartment(detectDepartment(text));
        }}
      />
      {/* ============================
            Complaint Photo
      ============================ */}

      {/* =============================
      Complaint Photo
============================= */}

<Text style={styles.label}>
  Complaint Photo
</Text>

{/* Show Camera & Gallery Buttons */}

{!photo && (
  <>
    <TouchableOpacity
      style={styles.photoButton}
      onPress={takePhoto}
    >
      <Text style={styles.photoButtonText}>
        📷 Take Photo
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.galleryButton}
      onPress={pickImage}
    >
      <Text style={styles.photoButtonText}>
        🖼️ Choose From Gallery
      </Text>
    </TouchableOpacity>
  </>
)}

{/* Image Preview */}

{photo && (
  <>
    <Image
      source={{ uri: photo }}
      style={styles.photo}
    />

    <TouchableOpacity
      style={styles.retakeButton}
      onPress={takePhoto}
    >
      <Text style={styles.photoButtonText}>
        📷 Retake Photo
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.galleryButton}
      onPress={pickImage}
    >
      <Text style={styles.photoButtonText}>
        🖼️ Replace From Gallery
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.removeButton}
      onPress={() => setPhoto(null)}
    >
      <Text style={styles.photoButtonText}>
        ❌ Remove Image
      </Text>
    </TouchableOpacity>
  </>
)}

      {/* Show Image Preview */}

      {photo && (
      <>
        <Image
          source={{ uri: photo }}
          style={styles.photo}
        />

        <TouchableOpacity
          style={styles.retakeButton}
          onPress={takePhoto}
        >
          <Text style={styles.photoButtonText}>
            🔄 Retake Photo
          </Text>
        </TouchableOpacity>
      </>
    )}

      <View style={styles.departmentContainer}>
        <Text style={styles.departmentHeading}>
          Suggested Department
        </Text>

        <Text style={styles.departmentText}>
          {department === ""
            ? "Start typing your complaint..."
            : department}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
      >
        <Text style={styles.label}>
  Complaint Location
</Text>

<TouchableOpacity
  style={styles.locationButton}
  onPress={getCurrentLocation}
>
  <Text style={styles.photoButtonText}>
    📍 Get Current Location
  </Text>
</TouchableOpacity>

{loadingLocation && (
  <View style={styles.loadingContainer}>
    <ActivityIndicator
      size="large"
      color="#2E7D32"
    />
    <Text style={styles.loadingText}>
      Getting your location...
    </Text>
  </View>
)}

{latitude !== null && longitude !== null && (
  <View style={styles.locationCard}>
    <Text style={styles.locationTitle}>
      Current Coordinates
    </Text>

    <Text style={styles.coordinateText}>
      Latitude: {latitude}
    </Text>

    <Text style={styles.coordinateText}>
      Longitude: {longitude}
    </Text>
  </View>
)}
        <Text style={styles.buttonText}>
          Submit Complaint
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
   
  
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F4F8FB",
    padding: 20,
  },

  heading: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 25,
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

  description: {
    height: 150,
  },

  departmentContainer: {
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#A5D6A7",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },

  departmentHeading: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 8,
  },

  departmentText: {
    fontSize: 17,
    color: "#2E7D32",
    fontWeight: "600",
  },

  button: {
    backgroundColor: "#2E7D32",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 30,
    elevation: 3,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  photoButton: {
  backgroundColor: "#1565C0",
  padding: 15,
  borderRadius: 10,
  alignItems: "center",
  marginTop: 15,
},

photoButtonText: {
  color: "#FFFFFF",
  fontSize: 17,
  fontWeight: "bold",
},

photo: {
  width: "100%",
  height: 220,
  borderRadius: 10,
  marginTop: 15,
},

retakeButton: {
  backgroundColor: "#EF6C00",
  padding: 15,
  borderRadius: 10,
  alignItems: "center",
  marginTop: 15,
},
label: {
  fontSize: 16,
  fontWeight: "bold",
  color: "#1B5E20",
  marginTop: 15,
  marginBottom: 8,
},
galleryButton: {
  backgroundColor: "#6A1B9A",
  padding: 15,
  borderRadius: 10,
  alignItems: "center",
  marginTop: 15,
},

removeButton: {
  backgroundColor: "#D32F2F",
  padding: 15,
  borderRadius: 10,
  alignItems: "center",
  marginTop: 15,
},
locationButton: {
  backgroundColor: "#00897B",
  padding: 15,
  borderRadius: 10,
  alignItems: "center",
  marginTop: 15,
},

loadingContainer: {
  alignItems: "center",
  marginTop: 20,
},

loadingText: {
  marginTop: 10,
  fontSize: 16,
  color: "#555",
},

locationCard: {
  backgroundColor: "#E8F5E9",
  padding: 15,
  borderRadius: 10,
  marginTop: 20,
},

locationTitle: {
  fontSize: 18,
  fontWeight: "bold",
  color: "#2E7D32",
  marginBottom: 10,
},

coordinateText: {
  fontSize: 16,
  color: "#333",
  marginBottom: 5,
},
mapButton: {
  backgroundColor: "#1976D2",
  padding: 15,
  borderRadius: 10,
  alignItems: "center",
  marginTop: 15,
},

mapButtonText: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "bold",
},
verifyButton: {
  backgroundColor: "#F9A825",
  padding: 15,
  borderRadius: 10,
  alignItems: "center",
  marginTop: 15,
},

verifiedButton: {
  backgroundColor: "#2E7D32",
},

verifyButtonText: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "bold",
},

verificationStatus: {
  marginTop: 10,
  fontSize: 16,
  fontWeight: "bold",
  color: "#333333",
},
});