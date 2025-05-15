import React from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

export default function UploadButton() {
    const router = useRouter();
    const handleCameraPress = () => {
    console.log('Upload button pressed');
    router.push('/(upload)/');
    // Here you can open camera or anything you want!
  };

  return (
    <TouchableOpacity style={styles.fab} onPress={handleCameraPress}>
      <FontAwesome size={28} name="upload" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    width: 80,
    height: 80,
    backgroundColor: 'lightblue', // MUI warning color (yellow)
    borderRadius: 50, // Half of width/height for perfect circle
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  iconImage: {
    width: 40,
    height: 40,
  },
});
