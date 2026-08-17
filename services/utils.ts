export function limitStringSize(
  text: string | null | undefined,
  limit: number = 50,
) {
  if (!text) return "";
  if (text.length > limit) {
    return text.substring(0, limit) + "...";
  }
  return text;
}
