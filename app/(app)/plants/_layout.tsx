import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="[plantId]/index" options={{ headerShown: false }}/>
    </Stack>
  );
}