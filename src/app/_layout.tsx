import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import "../../global.css";

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    "Inter-Bold": require('../../assets/fonts/Inter-Bold.ttf'),
    "Inter-Light": require('../../assets/fonts/Inter-Light.ttf'),
    "Inter-Medium": require('../../assets/fonts/Inter-Medium.ttf'),
    "Inter-Regular": require('../../assets/fonts/Inter-Regular.ttf'),
    "Inter-SemiBold": require('../../assets/fonts/Inter-SemiBold.ttf'),
    "Inter-Italic": require('../../assets/fonts/Inter-Italic.ttf'),
    "Inter-ExtraBoldItalic": require('../../assets/fonts/Inter-ExtraBoldItalic.ttf'),
  });

  useEffect(() => {
    if(error) throw error;
    if(fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  
  return <Stack screenOptions={{headerShown: false}} />;
}
