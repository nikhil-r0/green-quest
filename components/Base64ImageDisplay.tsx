// components/Base64ImageDisplay.tsx

import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';

const Base64ImageDisplay = ({ base64 }: { base64: string }) => {
  if (!base64) {
    return (
      <View>
        <Text>No Image Found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: `data:image/jpeg;base64,${base64}` }}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 12,
  },
});

export default Base64ImageDisplay;
