export interface SpiritualImpression {
  id: string;
  description: string;
  dateTime: string; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface NotificationSettings {
  enabled: boolean;
  intervalDays: 1 | 3 | 7 | 14 | 30;
}

export interface UserProfile {
  name: string;
  email: string;
  notificationSettings: NotificationSettings;
}

export type RootTabParamList = {
  Home: undefined;
  AllImpressions: undefined;
  Profile: undefined;
};
