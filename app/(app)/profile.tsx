import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Linking, ActivityIndicator } from 'react-native';
import { auth, db } from '@/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'Users', firebaseUser.uid));
        setUser({ uid: firebaseUser.uid, ...userDoc.data() });
        fetchUserPlants(firebaseUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserPlants = async (userId) => {
    try {
      const q = query(collection(db, 'Plants'), where('added_by', '==', userId));
      const querySnapshot = await getDocs(q);
      const plantData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlants(plantData);
    } catch (error) {
      console.error('Error fetching plants:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.welcome}>Welcome, {user?.name || 'User'} 👋</Text>
      <Text style={styles.sectionTitle}>Uploaded Plants</Text>

      {plants.map((plant) => (
        <View key={plant.id} style={styles.card}>
          <Image
            source={{ uri: `data:image/png;base64,${plant.image_base64}` }}
            style={styles.image}
          />
          <View style={styles.details}>
            <Text style={styles.name}>{plant.common_name}</Text>
            <Text style={styles.label}>Species: <Text style={styles.value}>{plant.species}</Text></Text>
            <Text style={styles.label}>Health: <Text style={styles.value}>{plant.health_score} ({plant.health_status})</Text></Text>
            <Text style={styles.label}>Last Watered: <Text style={styles.value}>{plant.last_watered || 'Not yet'}</Text></Text>
            <Text style={styles.label}>Quests: <Text style={styles.value}>{plant.quests?.join(', ') || 'None'}</Text></Text>
            <Text style={styles.label}>Registered On: <Text style={styles.value}>{plant.registered_date?.toDate().toLocaleString() || 'N/A'}</Text></Text>
            <Text style={styles.link} onPress={() => Linking.openURL(`https://maps.google.com/?q=${plant.location.lat},${plant.location.lng}`)}>
              View on Google Maps
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  welcome: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1e293b',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#334155',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 200,
  },
  details: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#0f172a',
  },
  label: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 2,
  },
  value: {
    fontWeight: '600',
    color: '#1e293b',
  },
  link: {
    marginTop: 6,
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
});
