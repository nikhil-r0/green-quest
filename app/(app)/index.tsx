import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import { auth } from "@/firebaseConfig";
import { api } from "@/constants/Api";
import LoadingIcon from "@/components/LoadingIcon";
import LottieView from "lottie-react-native";

const BASE_URL = api;
const windowWidth = Dimensions.get("window").width;
const isLargeScreen = windowWidth > 600;

type Quest = {
  id: string;
  reward_points: number;
  type: string;
  status?: string;
};

export default function LandingPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await getLocationAndFetchQuests();
    setRefreshing(false);
  };

  const getLocationAndFetchQuests = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setFetchError("Location permission denied.");
        setLoading(false);
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync();
      const { latitude, longitude } = coords;

      const res = await fetch(`${BASE_URL}/quests/nearby`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: auth.currentUser?.uid,
          lat: latitude,
          lng: longitude,
        }),
      });

      if (!res.ok) throw new Error(res.statusText);

      const result = await res.json();
      setQuests(result.nearby_quests);
      setFetchError("");
    } catch (error: any) {
      console.log(error);
      setFetchError("Failed to fetch quests.");
    } finally {
      setLoading(false);
    }
  };

  const acceptQuest = async (questId: string) => {
    try {
      const res = await fetch(`${BASE_URL}/user/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: auth.currentUser?.uid,
          quest_id: questId,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to accept quest");
      }

      // System alert
      Alert.alert("🎉 Quest Accepted!", "You’ve successfully accepted the quest.", [
        {
          text: "OK",
          onPress: () => {
            setShowAnimation(true);
            setTimeout(() => setShowAnimation(false), 2000);
          },
        },
      ]);

      // Update UI
      setQuests((prev) =>
        prev.map((q) => (q.id === questId ? { ...q, status: "assigned" } : q))
      );
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to accept quest");
    }
  };

  useEffect(() => {
    getLocationAndFetchQuests();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* Lottie Animation Overlay */}
      {showAnimation && (
        <View style={styles.lottieOverlay}>
          <LottieView
            source={require("@/assets/animations/happy.json")}
            autoPlay
            loop={false}
            style={{ width: 200, height: 200 }}
          />
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Landing Section */}
        <View style={styles.landingSection}>
          <View style={styles.leftContainer}>
            <Text style={styles.title}>
              WELCOME TO <Text style={styles.highlight}>GREEN QUEST</Text>
            </Text>
            <Text style={styles.description}>
              GreenQuest is a gamified mobile platform that makes urban greening fun, engaging,
              and impactful. Users can adopt plants, complete eco-friendly quests like watering and
              cleanup, and track plant growth using AI and crowdsourced data.
            </Text>
          </View>

          <View style={styles.rightContainer}>
            <Image
              source={require("@/assets/images/landing.png")}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Quests Section */}
        <View style={styles.questSection}>
          <Text style={styles.questTitle}>Quests</Text>
          {loading ? (
            <LoadingIcon />
          ) : fetchError ? (
            <Text style={{ color: "red" }}>{fetchError}</Text>
          ) : (
            <View>
              {quests.length > 0 ? (
                quests.map((quest) => (
                  <View key={quest.id} style={styles.questCard}>
                    <Text style={styles.questType}>{quest.type}</Text>
                    <Text style={styles.questPoints}>{quest.reward_points} pts</Text>
                    {quest.status !== "assigned" ? (
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => acceptQuest(quest.id)}
                      >
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text
                        style={{
                          marginTop: 10,
                          color: "#4CAF50",
                          fontWeight: "bold",
                        }}
                      >
                        Assigned
                      </Text>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.noQuestsText}>No quests available.</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  landingSection: {
    flexDirection: isLargeScreen ? "row" : "column",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    marginBottom: 30,
  },
  leftContainer: {
    flex: 1,
    paddingRight: isLargeScreen ? 20 : 0,
  },
  rightContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111",
  },
  highlight: {
    color: "#f44336",
  },
  description: {
    marginTop: 16,
    fontSize: 16,
    color: "#555",
    lineHeight: 22,
  },
  image: {
    width: isLargeScreen ? "100%" : windowWidth - 40,
    height: 250,
    borderRadius: 16,
  },
  questSection: {
    marginTop: 30,
  },
  questTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  questCard: {
    backgroundColor: "#F0F7F4",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  questType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  questPoints: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
  },
  noQuestsText: {
    fontSize: 16,
    color: "#999",
    fontStyle: "italic",
  },
  acceptButton: {
    marginTop: 10,
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  acceptButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  lottieOverlay: {
    position: "absolute",
    top: "40%",
    left: "50%",
    transform: [{ translateX: -100 }, { translateY: -100 }],
    zIndex: 99,
    backgroundColor: "transparent",
    pointerEvents: "none",
  },
});
