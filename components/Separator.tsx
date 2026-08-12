import { makeStyles } from "@/constants/theme/makeStyles";
import { StyleSheet, View } from "react-native";

export default function Separator() {
  return <View style={useStyles().separator} />;
}

const useStyles = makeStyles((t) => ({
  separator: {
    marginVertical: t.spacing.md,
    borderBottomColor: t.colors.separator,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
}));
