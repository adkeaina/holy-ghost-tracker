import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name='home'>
        <Icon sf={"house.fill"} drawable={"ic_menu_compass"} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name='insights'>
        <Icon sf={"heart.fill"} drawable={"ic_menu_agenda"} />
        <Label>Insights</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name='quiz'>
        <Icon sf={"book.fill"} drawable={"ic_media_play"} />
        <Label>AI Quiz</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name='profile'>
        <Icon sf={"person.fill"} drawable={"ic_menu_preferences"} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
