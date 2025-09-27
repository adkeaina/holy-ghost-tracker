export interface ImpressionCategory {
  id: number;
  name: string;
  color: "brown" | "green" | "blue" | "purple" | "red" | "orange" | "yellow";
  notRemovable?: boolean;
}

export interface SpiritualImpression {
  id: string;
  description: string;
  dateTime: string; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  categories: number[];
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
  AIQuiz: undefined;
  Profile: undefined;
};

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}
