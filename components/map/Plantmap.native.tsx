import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useRouter } from 'expo-router';

interface Plant {
  id: string;
  species: string;
  common_name: string;
  location: { lat: number; lng: number };
  health_score: number;
  health_status: string;
  last_watered: string | null;
  adopted_by: string | null;
  quests: any[];
  added_by: string;
  image_base64: string;
  registered_date: any;
  diseases: string[];
}

const PlantMap: React.FC = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'Plants'));
        const loadedPlants: Plant[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          loadedPlants.push({ id: doc.id, ...data } as Plant);
        });
        setPlants(loadedPlants);
      } catch (error) {
        console.error('Error fetching plants:', error);
      }
    };

    fetchPlants();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude: 12.9716,
          longitude: 77.5946,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <UrlTile urlTemplate="http://c.tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
        {plants.map((plant) => (
          <Marker
            key={plant.id}
            coordinate={{
              latitude: plant.location.lat,
              longitude: plant.location.lng,
            }}
            title={plant.common_name}
            onPress={() => router.push({ pathname: '/plants/[plantId]', params: { plantId: plant.id } })}
          />
        ))}
      </MapView>
    </View>
  );
};

export default PlantMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
