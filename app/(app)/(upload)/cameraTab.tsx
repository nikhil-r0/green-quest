import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Button,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useIsFocused } from "@react-navigation/native";
import { auth } from "@/firebaseConfig";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as FileSystem from "expo-file-system";
import RNPickerSelect from "react-native-picker-select";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.29.225:5000";

export default function CameraTab() {
  const [facing, setFacing] = useState("back");
  const [zoom, setZoom] = useState(0);
  const [photoUri, setPhotoUri] = useState(null);
  const [showCamera, setShowCamera] = useState(true);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const isFocused = useIsFocused();
  const userId = auth.currentUser?.uid;

  const toggleCamera = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const handleZoomChange = (value: React.SetStateAction<number>) => setZoom(value);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Location permission denied");
      return;
    }
    const { coords } = await Location.getCurrentPositionAsync();
    if (coords) {
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
      if (photo.uri) {
        setPhotoUri(photo.uri);
        setShowCamera(false);
        await getLocation();
      }
    } catch (e) {
      console.error("Error taking picture:", e);
      alert("Could not capture photo. Try again.");
    }
  };

  // const analyzePhoto = async (uri: string) => {
  //   if (!uri) return;
  //   setIsLoading(true);
  //   try {
  //     const base64 = await FileSystem.readAsStringAsync(uri, {
  //       encoding: FileSystem.EncodingType.Base64,
  //     });
  //     const res = await fetch(`${BASE_URL}/describe`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ image: base64 }),
  //     });
  //     if (!res.ok) throw new Error(res.statusText);
  //     const data = await res.json();
  //     if (data.isIssue) {
  //       setCategory(data.category);
  //       setDescription(data.description);
  //       alert("Issue detected!");
  //     } else {
  //       alert("No issue detected.");
  //       resetCamera();
  //     }
  //   } catch (e) {
  //     console.error(e);
  //     alert("Analysis failed. Please try again.");
  //     resetCamera();
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const registerPlant = async () => {
    if (!photoUri || latitude == null || longitude == null || !userId) {
      alert("Please capture a plant and ensure location is enabled.");
      return;
    }
  
    setIsLoading(true);
  
    try {
      // Save photo to file system and get path
      const localUri = photoUri;
  
      const base64 = await FileSystem.readAsStringAsync(localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      const response = await fetch(`${BASE_URL}/api/register-plant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          lat: latitude,
          lng: longitude,
          image_path: localUri, // If your backend can access the path, else send base64 instead
          image_base64: base64   // Optional if your backend can accept base64 instead of file path
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        alert(data.message || "Plant registered successfully!");
        resetCamera();
      } else {
        alert(data.error || "Failed to register plant.");
      }
    } catch (e) {
      console.error(e);
      alert("Error while registering plant. Try again.");
    } finally {
      setIsLoading(false);
    }
  };
  

  const resetCamera = () => {
    setPhotoUri(null);
    setDescription("");
    setShowCamera(true);
  };

  if (!permission) return <View />;
  if (!permission.granted)
    return (
      <View style={styles.container}>
        <Text>Camera permission is required.</Text>
        <Button title="Grant" onPress={requestPermission} />
      </View>
    );
  if (isLoading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Processing...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      {showCamera && isFocused ? (
        <CameraView ref={cameraRef} style={styles.camera} facing={facing} zoom={zoom}>
          <View style={styles.controls}>
            <TouchableOpacity onPress={toggleCamera} style={styles.button}>
              <Text>Flip</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={takePicture} style={styles.button}>
              <Text>Capture</Text>
            </TouchableOpacity>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={zoom}
              onValueChange={handleZoomChange}
            />
          </View>
        </CameraView>
      ) : (
        <ScrollView contentContainerStyle={styles.previewContainer}>
          <Image
            source={{ uri: photoUri }}
            style={styles.image}
            accessibilityLabel="Captured photo"
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <Button title="Submit" onPress={registerPlant} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  camera: {
    flex: 1,
  },
  controls: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 16,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  button: {
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 3,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  previewContainer: {
    flexGrow: 1,
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fdfdfd",
  },
  image: {
    width: 280,
    height: 280,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  close: {
    position: "absolute",
    top: 30,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
    elevation: 5,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#fff",
    marginVertical: 12,
    fontSize: 16,
  },
});

const pickerStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    backgroundColor: "#fff",
    marginVertical: 12,
    color: "#333",
  },
  inputAndroid: {
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    backgroundColor: "#fff",
    marginVertical: 12,
    color: "#333",
  },
});
