import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name='home'>
        <Icon sf={"house.fill"} drawable={"ic_menu_view"} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name='insights'>
        <Icon sf={"heart.fill"} drawable={"ic_menu_favorite"} />
        <Label>Insights</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name='quiz'>
        <Icon sf={"book.fill"} drawable={"ic_menu_help"} />
        <Label>AI Quiz</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name='profile'>
        <Icon sf={"person.fill"} drawable={"ic_menu_manage"} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
