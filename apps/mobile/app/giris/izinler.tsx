import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { BellIcon, PinIcon } from "@/ui/icons";
import { Screen } from "@/ui/Screen";
import { colors, font } from "@/ui/theme";

/** İzinler: neden istediğimizi anlatan kartlar; "her zaman" konum yürüyüşe başlarken istenir. */
export default function IzinlerScreen() {
  const router = useRouter();
  const [loc, setLoc] = useState(false);
  const [notif, setNotif] = useState(false);
  return (
    <Screen sos={false} style={{ gap: 24 }}>
      <View style={{ gap: 8 }}>
        <Text style={font.label}>Adım 2 / 3</Text>
        <Text style={[font.h1, { fontSize: 28 }]}>Neden izin istiyoruz?</Text>
        <Text style={font.bodySecondary}>
          Hepsini sonra Ayarlar'dan değiştirebilirsin. Konumun başkalarına yalnız sen açarsan, 250 m
          hücreye yuvarlanmış olarak gider.
        </Text>
      </View>
      <View style={{ gap: 12 }}>
        <Perm
          icon={<PinIcon />}
          title="Konum · kullanırken"
          text='Rotadaki yerini ve "sonraki su kaç km" bilgisini göstermek için.'
          granted={loc}
          onGrant={async () => setLoc((await Location.requestForegroundPermissionsAsync()).granted)}
        />
        <Perm
          icon={<PinIcon />}
          title="Konum · her zaman"
          text="Yalnız yürüyüş modunda: rotadan sapma uyarısı ve varış onayı için. Ekran kapalıyken de çalışır."
          note="Yürüyüşe başlarken isteyeceğiz."
        />
        <Perm
          icon={<BellIcon />}
          title="Bildirimler"
          text="İhtiyacına teklif gelince, varış saatin geçince ve güvenilir kişin seni ararsa."
          granted={notif}
          onGrant={async () => setNotif((await Notifications.requestPermissionsAsync()).granted)}
        />
      </View>
      <View style={{ marginTop: "auto", gap: 10 }}>
        <Button label="Devam" size="xl" onPress={() => router.push("/giris/paket")} />
        <Button
          label="Şimdilik atla"
          variant="ghost"
          size="md"
          onPress={() => router.push("/giris/paket")}
        />
      </View>
    </Screen>
  );
}

function Perm({
  icon,
  title,
  text,
  note,
  granted,
  onGrant,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  note?: string;
  granted?: boolean;
  onGrant?: () => void;
}) {
  return (
    <Card style={{ flexDirection: "row", gap: 14 }}>
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: colors.primarySoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={font.title}>{title}</Text>
        <Text style={font.bodySecondary}>{text}</Text>
        {note && <Text style={[font.caption, { marginTop: 4 }]}>{note}</Text>}
        {onGrant && (
          <Button
            label={granted ? "Verildi ✓" : "İzin ver"}
            variant={granted ? "secondary" : "primary"}
            size="md"
            style={{ alignSelf: "flex-start", marginTop: 8, height: 40 }}
            onPress={onGrant}
          />
        )}
      </View>
    </Card>
  );
}
