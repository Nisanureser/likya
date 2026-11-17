import { Text } from "react-native";
import { Screen } from "@/ui/Screen";
import { font } from "@/ui/theme";

/** Yer tutucu: prototipteki ekran (docs/prototip) sonraki turda taşınacak. */
export default function Placeholder() {
  return (
    <Screen title="Mesaj" back>
      <Text style={font.bodySecondary}>Bu ekran sırada. Prototip: docs/prototip.</Text>
    </Screen>
  );
}
