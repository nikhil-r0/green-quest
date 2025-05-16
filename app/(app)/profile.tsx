import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { auth, db } from '@/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { useRouter } from 'expo-router';

const HEADER_HEIGHT = 200;

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [plants, setPlants] = useState([]);
  const [acceptedQuests, setAcceptedQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);

  const fetchLeaderboard = async () => {
    try {
      const q = query(collection(db, 'Users'));
      const snapshot = await getDocs(q);
      const users = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.eco_points || 0) - (a.eco_points || 0)); // Descending
      setLeaderboardData(users);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };
  

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.uid) {
      await Promise.all([
        fetchUserPlants(user.uid),
        fetchAcceptedQuests(user.uid),
      ]);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'Users', firebaseUser.uid));
        const currentUser = { uid: firebaseUser.uid, ...userDoc.data() };
        setUser(currentUser);
        await Promise.all([
          fetchUserPlants(currentUser.uid),
          fetchAcceptedQuests(currentUser.uid),
        ]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserPlants = async (userId) => {
    try {
      const q = query(
        collection(db, 'Plants'),
        where('added_by', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const plantData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlants(plantData);
    } catch (error) {
      console.error('Error fetching plants:', error);
    }
  };

  const fetchAcceptedQuests = async (userId) => {
    try {
      const q = query(
        collection(db, 'Quests'),
        where('assigned_to', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const quests = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAcceptedQuests(quests);
    } catch (error) {
      console.error('Error fetching accepted quests:', error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 60 }} />;
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ImageBackground
        source={{
          uri:
            'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80',
        }}
        style={styles.headerImage}
        resizeMode="cover"
      >
        <Pressable
          onPress={async () => {
            await fetchLeaderboard();
            setShowLeaderboard(true);
          }}
          style={{
            position: 'absolute',
            top: 40,
            right: 20,
            backgroundColor: '#2563eb',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 12,
            zIndex: 10,
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>🏆 Leaderboard</Text>
        </Pressable>

        <View style={styles.overlay}>
          <Text style={styles.headerText}>
            Hello, {user?.name || 'Explorer'} 🌿
          </Text>
        </View>
      </ImageBackground>
        {/* Uploaded Plants */}
        <Text style={styles.sectionTitle}>🌱 Your Plants</Text>
        {plants.length > 0 ? (
          plants.map((plant) => (
            <Pressable
              key={plant.id}
              onPress={() =>
                router.push({
                  pathname: '/plants/[plantId]',
                  params: { plantId: plant.id },
                })
              }
              style={({ pressed }) => [
                styles.card,
                pressed && { backgroundColor: '#f1f5f9' },
              ]}
            >
              <Text style={styles.name}>{plant.common_name}</Text>
              <Text
                style={styles.link}
                onPress={() =>
                  Linking.openURL(
                    `https://maps.google.com/?q=${plant.location.lat},${plant.location.lng}`
                  )
                }
              >
                📍 View on Map
              </Text>
            </Pressable>
          ))
        ) : (
          <Text style={styles.emptyText}>You haven't uploaded any plants yet.</Text>
        )}

        {/* Accepted Quests */}
        <Text style={styles.sectionTitle}>🧭 Accepted Quests</Text>
        {acceptedQuests.length > 0 ? (
          acceptedQuests.map((quest) => (
            <View key={quest.id} style={styles.card}>
              <Text style={styles.name}>{quest.type}</Text>
              <Text style={styles.label}>
                🎁 Reward: <Text style={styles.value}>{quest.reward_points} pts</Text>
              </Text>
              {quest.location && (
                <Text
                  style={styles.link}
                  onPress={() =>
                    Linking.openURL(
                      `https://maps.google.com/?q=${quest.location.lat},${quest.location.lng}`
                    )
                  }
                >
                  📍 View Location
                </Text>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No quests accepted yet.</Text>
        )}
      </ScrollView>
      {showLeaderboard && (
  <View style={styles.leaderboardContainer}>
    <View style={styles.leaderboardBox}>
      <View style={styles.leaderboardHeader}>
        <Text style={styles.leaderboardTitle}>🏆 Eco Leaderboard</Text>
        <Pressable onPress={() => setShowLeaderboard(false)}>
          <Text style={styles.closeButton}>✖</Text>
        </Pressable>
      </View>
      <ScrollView style={{ maxHeight: 300 }}>
        {leaderboardData.map((user, index) => (
          <View key={user.id} style={styles.leaderboardItem}>
            <Text style={styles.rank}>{index + 1}.</Text>
            <Text style={styles.name}>{user.name || 'Anonymous'}</Text>
            <Text style={styles.points}>{user.eco_points || 0} pts</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  </View>
)}

    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  leaderboardContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    borderRadius: 16,
  },
  leaderboardBox: {
    backgroundColor: 'white',
    width: '100%',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
  },
  closeButton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  rank: {
    width: 30,
    fontWeight: '600',
    color: '#64748b',
  },
  points: {
    fontWeight: '600',
    color: '#16a34a',
  },
  
  wrapper: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerImage: {
    width: '100%',
    height: HEADER_HEIGHT,
    justifyContent: 'flex-end',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginTop: 12,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#475569',
  },
  value: {
    fontWeight: '600',
    color: '#2563eb',
  },
  link: {
    fontSize: 14,
    color: '#0ea5e9',
    marginTop: 6,
    textDecorationLine: 'underline',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginBottom: 12,
  },
});
