import LottieView from 'lottie-react-native';

export default function LoadingAnimation() {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('@/assets/animations/happy-tree.json')}
        autoPlay
        loop
        style={{ width: 200, height: 200 }}
      />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#065f46',
  },
});
