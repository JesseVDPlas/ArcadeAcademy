import { Stack } from 'expo-router';
export default () => (
  <Stack screenOptions={{ headerShown:false }}>
    <Stack.Screen name="name"   options={{ title:'Naam' }} />
    <Stack.Screen name="grade"  options={{ title:'Klas' }} />
    <Stack.Screen name="level"  options={{ title:'Niveau' }} />
    <Stack.Screen name="review" options={{ title:'Review' }} />
  </Stack>
); 