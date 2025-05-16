import { Stack } from "expo-router";
import React from "react";

export default function StackLayout() {
  return (
    <Stack>
      <Stack.Screen name="[plantId]/index" options={{ headerShown: false }}/>
      <Stack.Screen name="[plantId]/chatbot" options={{ headerShown: false, title: 'Plant Chatbot' }} />
    </Stack>
  );
}