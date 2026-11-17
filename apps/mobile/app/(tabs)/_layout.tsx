import { Tabs } from "expo-router";
import { useSession } from "@/store/session";
import { Avatar } from "@/ui/Avatar";
import { BoardIcon, MapIcon, StageIcon } from "@/ui/icons";
import { colors } from "@/ui/theme";

/** Tasarım kararı: 4 sekme — Harita / Etap / Pano / Ben. SOS her ekranın sağ üstünde. */
export default function TabsLayout() {
  const avatar = useSession((s) => s.avatar);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 84,
          paddingTop: 8,
        },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="harita"
        options={{ title: "Harita", tabBarIcon: ({ color }) => <MapIcon color={String(color)} /> }}
      />
      <Tabs.Screen
        name="etaplar"
        options={{ title: "Etap", tabBarIcon: ({ color }) => <StageIcon color={String(color)} /> }}
      />
      <Tabs.Screen
        name="pano"
        options={{ title: "Pano", tabBarIcon: ({ color }) => <BoardIcon color={String(color)} /> }}
      />
      <Tabs.Screen
        name="ben"
        options={{
          title: "Ben",
          tabBarIcon: () => <Avatar spec={avatar} size={26} face={false} />,
        }}
      />
    </Tabs>
  );
}
