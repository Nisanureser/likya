import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { api } from "@/api/client";
import { useSession } from "@/store/session";
import { Button } from "@/ui/Button";
import { Screen } from "@/ui/Screen";
import { colors, font, radius } from "@/ui/theme";

/** E-posta kodu ile giriş: /auth/request-code → /auth/verify. */
export default function KodScreen() {
  const router = useRouter();
  const signIn = useSession((s) => s.signIn);
  const setProfile = useSession((s) => s.setProfile);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const request = useMutation({ mutationFn: () => api.requestCode(email.trim().toLowerCase()) });
  const verify = useMutation({
    mutationFn: () => api.verify(email.trim().toLowerCase(), code.trim()),
    onSuccess: async (r) => {
      await signIn(r.token);
      setProfile({ nickname: email.split("@")[0] ?? "" });
      router.replace("/giris/izinler");
    },
  });
  const sent = request.isSuccess;
  const err = request.error ?? verify.error;

  return (
    <Screen back sos={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, gap: 24 }}
      >
        <View style={{ gap: 8 }}>
          <Text style={[font.h1, { fontSize: 28 }]}>E-postanla giriş yap</Text>
          <Text style={font.bodySecondary}>Şifre yok. Sana 6 haneli bir kod göndereceğiz.</Text>
        </View>
        {!sent ? (
          <View style={{ gap: 12 }}>
            <Text style={font.label}>E-posta</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="ad@ornek.com"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              style={styles.input}
            />
            <Button
              label={request.isPending ? "Gönderiliyor…" : "Kod gönder"}
              size="xl"
              disabled={!email.includes("@") || request.isPending}
              onPress={() => request.mutate()}
            />
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            <Text style={font.label}>Gelen kod</Text>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="123456"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              style={[styles.input, styles.code]}
            />
            <Text style={font.caption}>
              Kod 10 dakika geçerli. Gelmedi mi?{" "}
              <Text style={{ color: colors.primary }} onPress={() => request.mutate()}>
                Tekrar gönder
              </Text>
            </Text>
            <Button
              label={verify.isPending ? "Doğrulanıyor…" : "Doğrula"}
              size="xl"
              disabled={code.length !== 6 || verify.isPending}
              onPress={() => verify.mutate()}
            />
          </View>
        )}
        {err && <Text style={{ color: colors.danger, fontSize: 13 }}>{String(err.message)}</Text>}
        <Text style={[font.caption, { textAlign: "center", marginTop: "auto" }]}>
          Apple/Google girişi ikinci sürümde; şimdilik e-posta.
        </Text>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    fontSize: 17,
    color: colors.text,
  },
  code: { height: 64, fontSize: 28, letterSpacing: 8, textAlign: "center" },
});
