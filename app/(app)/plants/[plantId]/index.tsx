import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { ActivityIndicator, View, Text } from 'react-native';
import PlantDetailsScreen from '@/components/PlantDetailsScreen';

// ✅ Inline Plant interface
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

const PlantDetailPage = () => {
  const { plantId } = useLocalSearchParams();
  console.log('plantId:', plantId);
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlant = async () => {
      if (!plantId) return;

      try {
        const plantRef = doc(db, 'Plants', plantId as string);
        const plantSnap = await getDoc(plantRef);

        if (plantSnap.exists()) {
          const data = plantSnap.data();
          const fetchedPlant: Plant = {
            id: plantSnap.id,
            species: data.species,
            common_name: data.common_name,
            location: data.location,
            health_score: data.health_score,
            health_status: data.health_status,
            last_watered: data.last_watered || null,
            adopted_by: data.adopted_by || null,
            quests: data.quests || [],
            added_by: data.added_by,
            image_base64: data.image_base64,
            registered_date: data.registered_date,
            diseases: data.diseases || [],
          };

          setPlant(fetchedPlant);
        } else {
          console.warn('No plant found with ID:', plantId);
        }
      } catch (error) {
        console.error('Error fetching plant:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlant();
  }, [plantId]);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  if (!plant) {
    return (
      <View style={{ marginTop: 50, alignItems: 'center' }}>
        <Text>Plant not found.</Text>
      </View>
    );
  }

  return <PlantDetailsScreen plant={plant} />;
};

export default PlantDetailPage;
