import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useRef, useState } from "react";
import {
  Button,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import * as FileSystem from "expo-file-system";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import * as Location from "expo-location";
import { Video } from "expo-av";
import React from "react";
import { api } from "@/constants/Api";
import { auth } from "@/firebaseConfig";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [mode, setMode] = useState<CameraMode>("picture");
  const [facing, setFacing] = useState<CameraType>("back");
  const [recording, setRecording] = useState(false);
  const [activeCapture, setActiveCapture] = useState<"none" | "picture" | "video">("none");
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  if (!auth.currentUser || !permission) return null;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to use the camera
        </Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Location permission denied");
      return;
    }
    const { coords } = await Location.getCurrentPositionAsync();
    setLatitude(coords.latitude);
    setLongitude(coords.longitude);
  };

  const uploadMedia = async (photoUri: string | null, videoUri: string | null) => {
    const formData = new FormData();
    formData.append("user_id", auth.currentUser!.uid);
    formData.append("lat", latitude.toString());
    formData.append("lng", longitude.toString());

    if (photoUri) {
      const photoInfo = await FileSystem.getInfoAsync(photoUri);
      formData.append("photo", {
        uri: photoInfo.uri,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);
    }

    if (videoUri) {
      const videoInfo = await FileSystem.getInfoAsync(videoUri);
      formData.append("video", {
        uri: videoInfo.uri,
        name: "video.mp4",
        type: "video/mp4",
      } as any);
    }

    try {
      const response = await fetch(`${api}/api/register-plant`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const text = await response.text();
      try {
        const json = JSON.parse(text);
        console.log("Upload response:", json);
      } catch (e) {
        console.error("Unexpected server response (not JSON):", text);
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync();
    setUri(photo?.uri || null);
    await getLocation();
    setActiveCapture("none");
  };

  const recordVideo = async () => {
    if (recording) {
      setRecording(false);
      ref.current?.stopRecording();
      return;
    }
    setRecording(true);
    const video = await ref.current?.recordAsync();
    setVideoUri(video?.uri || null);
    setRecording(false);
    await getLocation();
    setActiveCapture("none");
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const renderMedia = () => {
    if (activeCapture !== "none") {
      return (
        <CameraView
          style={styles.camera}
          ref={ref}
          mode={activeCapture}
          facing={facing}
          mute={false}
        >
          <View style={styles.shutterContainer}>
            <Pressable onPress={toggleFacing}>
              <FontAwesome6 name="rotate-left" size={32} color="white" />
            </Pressable>
            <Pressable
              onPress={() => (activeCapture === "picture" ? takePicture() : recordVideo())}
            >
              <View style={styles.shutterBtn}>
                <View style={styles.shutterBtnInner} />
              </View>
            </Pressable>
            <Pressable onPress={() => setActiveCapture("none")}>  
              <AntDesign name="closecircleo" size={30} color="white" />
            </Pressable>
          </View>
        </CameraView>
      );
    }

    return (
      <View style={{ alignItems: "center" }}>
        {uri ? (
          <View style={styles.mediaCard}>
            <Image source={{ uri }} contentFit="cover" style={styles.mediaImage} />
            <Pressable
              style={[styles.actionBtn, { backgroundColor: "#f97316" }]}
              onPress={() => {
                setUri(null);
                setActiveCapture("picture");
              }}
            >
              <Feather name="rotate-ccw" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Retake Picture</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.actionBtn} onPress={() => setActiveCapture("picture")}>
            <Feather name="camera" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Take Picture</Text>
          </Pressable>
        )}

        {videoUri ? (
          <View style={styles.mediaCard}>
            <Video
              source={{ uri: videoUri }}
              useNativeControls
              resizeMode="cover"
              isLooping
              style={styles.mediaVideo}
            />
            <Pressable
              style={[styles.actionBtn, { backgroundColor: "#f97316" }]}
              onPress={() => {
                setVideoUri(null);
                setActiveCapture("video");
              }}
            >
              <Feather name="rotate-ccw" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Retake Video</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={[styles.actionBtn, { backgroundColor: "#dc2626" }]} onPress={() => setActiveCapture("video")}>
            <Feather name="video" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Record Video</Text>
          </Pressable>
        )}

        {uri && videoUri && (
          <Pressable
            style={[styles.actionBtn, { backgroundColor: "#16a34a" }]}
            onPress={() => uploadMedia(uri, videoUri)}
          >
            <Feather name="upload" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Upload Both</Text>
          </Pressable>
        )}
      </View>
    );
  };

  return activeCapture !== "none" ? (
    <View style={{ flex: 1 }}>{renderMedia()}</View>
  ) : (
    <ScrollView contentContainerStyle={styles.container}>{renderMedia()}</ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  camera: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  shutterContainer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  shutterBtn: {
    borderWidth: 5,
    borderColor: "#fff",
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  shutterBtnInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ffffff",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#2563eb",
    borderRadius: 12,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  mediaCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginVertical: 16,
    alignItems: "center",
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  mediaImage: {
    width: 250,
    height: 250,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#f1f5f9",
  },
  mediaVideo: {
    width: 300,
    height: 200,
    borderRadius: 12,
    backgroundColor: "#000",
    marginBottom: 12,
  },
});