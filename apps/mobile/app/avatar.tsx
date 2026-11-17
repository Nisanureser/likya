import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { useSession } from "@/store/session";
import { AVATAR_OPTIONS, Avatar, type AvatarSpec } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Screen } from "@/ui/Screen";
import { colors, font, radius, space } from "@/ui/theme";

/** Avatarını yap: saç, ten, saç rengi, tişört, şapka, sırt çantası (prototip Avatar.dc.html). */
export default function AvatarScreen() {
  const router = useRouter();
  const session = useSession();
  const [spec, setSpec] = useState<AvatarSpec>(session.avatar);
  const [nick, setNick] = useState(session.nickname);
  const [visible, setVisible] = useState(session.visible);
  const set = (p: Partial<AvatarSpec>) => setSpec((s) => ({ ...s, ...p }));

  return (
    <Screen title="Avatarın" subtitle="Haritada seni temsil eder" back>
      <ScrollView
        contentContainerStyle={{ gap: space.md, paddingBottom: space.xl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stage}>
          <Avatar spec={spec} size={120} bob />
          <View style={styles.nickChip}>
            <Text style={{ fontSize: 12, fontWeight: "500", color: colors.primaryDark }}>
              {nick || "Takma ad"}
            </Text>
          </View>
        </View>
        <Text style={font.label}>Saç</Text>
        <View style={styles.row}>
          {AVATAR_OPTIONS.hairs.map(([id, label]) => (
            <Pressable
              key={id}
              onPress={() => set({ hair: id })}
              style={[styles.opt, spec.hair === id && styles.optOn]}
            >
              <Text style={{ fontSize: 13, fontWeight: "500", color: colors.primaryDark }}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={font.label}>Ten · saç rengi · tişört</Text>
        <View style={[styles.row, { flexWrap: "wrap" }]}>
          {AVATAR_OPTIONS.skins.map((c) => (
            <Swatch key={c} color={c} on={spec.skin === c} onPress={() => set({ skin: c })} />
          ))}
          <View style={styles.sep} />
          {AVATAR_OPTIONS.hairColors.map((c) => (
            <Swatch
              key={c}
              color={c}
              on={spec.hairColor === c}
              onPress={() => set({ hairColor: c })}
            />
          ))}
          <View style={styles.sep} />
          {AVATAR_OPTIONS.shirts.map((c) => (
            <Swatch
              key={c}
              color={c}
              on={spec.shirt === c}
              square
              onPress={() => set({ shirt: c })}
            />
          ))}
        </View>
        <View style={styles.row}>
          <Pressable
            onPress={() => set({ hat: !spec.hat })}
            style={[styles.opt, spec.hat && styles.optOn, { height: 44 }]}
          >
            <Text style={{ fontSize: 14, fontWeight: "500", color: colors.primaryDark }}>
              🧢 Şapka
            </Text>
          </Pressable>
          <Pressable
            onPress={() => set({ pack: !spec.pack })}
            style={[styles.opt, spec.pack && styles.optOn, { height: 44 }]}
          >
            <Text style={{ fontSize: 14, fontWeight: "500", color: colors.primaryDark }}>
              🎒 Sırt çantası
            </Text>
          </Pressable>
        </View>
        <Text style={font.label}>Takma ad</Text>
        <TextInput
          value={nick}
          onChangeText={setNick}
          placeholder="Takma ad"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        <Text style={font.caption}>Gerçek isim ve fotoğraf gerekmez.</Text>
        <Card style={[styles.row, { justifyContent: "space-between" }]}>
          <View>
            <Text style={font.title}>Haritada görün</Text>
            <Text style={font.caption}>Yalnız çevrimiçiyken, 250 m hücre</Text>
          </View>
          <Switch
            value={visible}
            onValueChange={setVisible}
            trackColor={{ true: colors.primary }}
          />
        </Card>
        <Button
          label="Kaydet ve haritaya dön"
          size="lg"
          onPress={() => {
            session.setProfile({ avatar: spec, nickname: nick.trim(), visible });
            router.replace("/(tabs)/harita");
          }}
        />
      </ScrollView>
    </Screen>
  );
}

function Swatch({
  color,
  on,
  square,
  onPress,
}: {
  color: string;
  on: boolean;
  square?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={{
        width: 36,
        height: 36,
        borderRadius: square ? 10 : 18,
        backgroundColor: color,
        borderWidth: 3,
        borderColor: on ? colors.text : colors.card,
      }}
    />
  );
}

const styles = StyleSheet.create({
  stage: {
    height: 200,
    borderRadius: radius.xl,
    backgroundColor: colors.mapBg,
    alignItems: "center",
    justifyContent: "center",
  },
  nickChip: {
    position: "absolute",
    bottom: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: "row", gap: 8, alignItems: "center" },
  opt: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  optOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  sep: { width: 1, height: 28, backgroundColor: colors.border, marginHorizontal: 2 },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.text,
  },
});
