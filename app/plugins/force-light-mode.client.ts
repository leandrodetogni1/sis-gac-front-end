export default defineNuxtPlugin(() => {
  const colorMode = useColorMode();
  if (colorMode.preference !== "light") {
    colorMode.preference = "light";
  }
});
