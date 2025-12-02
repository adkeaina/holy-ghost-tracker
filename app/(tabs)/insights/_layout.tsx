import { courseFormProps } from "@/src/utils/courseFormTokens";
import { Stack } from "expo-router";

export default function InsightsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='index' />
      <Stack.Screen name='impressionForm' options={courseFormProps} />
    </Stack>
  );
}
