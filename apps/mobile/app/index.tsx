import { Redirect } from "expo-router";
import { View } from "react-native";
import { useSession } from "@/store/session";
import { colors } from "@/ui/theme";

/** Kök rota: oturum yüklenene kadar boş zemin, sonra giriş ya da sekmeler. */
export default function Index() {
  const { ready, token, onboarded } = useSession();
  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  if (!token) return <Redirect href="/giris" />;
  if (!onboarded) return <Redirect href="/giris/izinler" />;
  return <Redirect href="/(tabs)/harita" />;
}
