import { makeStyles } from "@/constants/theme/makeStyles";
import type { KeyboardTypeOptions } from "react-native";
import { TextInput } from "react-native";

type SearchBarProps = {
  placeholder: string;
  searchValue: string;
  style?: any;
  keyboardType?: KeyboardTypeOptions;
  onChangeText: (text: string) => void;
};

export default function SearchBar({
  placeholder,
  searchValue,
  style = {},
  keyboardType = "default",
  onChangeText,
}: SearchBarProps) {
  const s = useStyles();
  return (
    <TextInput
      style={[s.bar, style]}
      placeholder={placeholder}
      placeholderTextColor={s.bar.color}
      autoCorrect={false}
      clearButtonMode="while-editing"
      value={searchValue}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
    ></TextInput>
  );
}

const useStyles = makeStyles((t) => ({
  bar: {
    borderWidth: 1,
    borderRadius: t.radius.sm,
    paddingHorizontal: t.spacing.md,
    paddingVertical: t.spacing.sm,
    fontSize: t.typography.body.fontSize,
    borderColor: t.colors.searchBorder,
    color: t.colors.text,
  },
}));
