import { Stack } from "expo-router";

export default function UploadLayout() {
  return (
    <Stack>
      <Stack.Screen name="cameraTab" options={{ headerShown: false}}/>
    </Stack>
  );
}