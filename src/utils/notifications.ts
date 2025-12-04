import * as Notifications from "expo-notifications";
import { NotificationSettings } from "../types";
import { getEnv } from "./storage";

const environment = getEnv("EXPO_PUBLIC_NODE_ENV");

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
};

export const scheduleNotification = async (
  settings: NotificationSettings
): Promise<void> => {
  try {
    if (!settings.enabled) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return;
    }

    // Cancel existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    const intervalInSeconds = settings.intervalDays * 24 * 60 * 60;

    const motivationalMessages = [
      "Take a moment to feel the Spirit in your life today.",
      "Look for the Holy Ghost in the small moments.",
      "Remember to invite the Spirit through prayer and scripture study.",
      "Find opportunities to serve and feel the Spirit's presence.",
      "Take time to ponder and feel the Holy Ghost's influence.",
    ];

    const randomMessage =
      motivationalMessages[
        Math.floor(Math.random() * motivationalMessages.length)
      ];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${
          environment === "dev" ? "[DEV MODE] " : ""
        }You haven't felt the Holy Ghost for ${settings.intervalDays} day${
          settings.intervalDays > 1 ? "s" : ""
        }`,
        body: randomMessage,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: intervalInSeconds,
        repeats: true,
      },
    });
  } catch (error) {
    console.error("Error scheduling notification:", error);
    throw error;
  }
};
