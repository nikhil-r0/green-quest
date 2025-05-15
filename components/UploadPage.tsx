// app/UploadPage.tsx
import { useLocalSearchParams } from 'expo-router';
import { View, Image, StyleSheet } from 'react-native';

export default function Preview() {
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: photoUri }}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '90%',
    height: '90%',
  },
});
