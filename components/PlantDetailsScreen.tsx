import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Linking } from 'react-native';

interface PlantDetailsScreenProps {
  plant: {
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
  };
}

const PlantDetailsScreen: React.FC<PlantDetailsScreenProps> = ({ plant }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{plant.common_name}</Text>
      <Text style={styles.subTitle}>{plant.species}</Text>

      {plant.image_base64 && (
        <Image
          source={{ uri: `data:image/png;base64,${plant.image_base64}` }}
          style={styles.image}
        />
      )}

      <View style={styles.details}>
        <Text style={styles.detailItem}>🌱 Health Score: {plant.health_score}</Text>
        <Text style={styles.detailItem}>📊 Health Status: {plant.health_status}</Text>
        <Text style={styles.detailItem}>
          💧 Last Watered: {plant.last_watered ? plant.last_watered : 'Not yet watered'}
        </Text>
        <Text style={styles.detailItem}>
          🧑‍🌾 Adopted By: {plant.adopted_by ?? 'No one'}
        </Text>
        <Text style={styles.detailItem}>
          🐛 Diseases: {plant.diseases.length > 0 ? plant.diseases.join(', ') : 'None'}
        </Text>
        <Text style={styles.detailItem}>
          📍 Location: {plant.location.lat}, {plant.location.lng}
        </Text>
        <Text style={styles.link} onPress={() => Linking.openURL(`https://maps.google.com/?q=${plant.location.lat},${plant.location.lng}`)}>
              View on Google Maps
            </Text>
      </View>
    </ScrollView>
  );
};

export default PlantDetailsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#2e7d32',
  },
  subTitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  details: {
    alignSelf: 'flex-start',
    width: '100%',
  },
  detailItem: {
    fontSize: 16,
    marginBottom: 10,
    color: '#444',
  },
  link: {
    marginTop: 6,
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
});
