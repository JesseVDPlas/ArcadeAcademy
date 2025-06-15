import { StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🚫 404 — Route not found</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, color: '#FF00FF', fontFamily: 'Courier' },
});
