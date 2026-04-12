import React, { useState } from "react";
import { StyleSheet, StatusBar } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";

import { AnimatedBackground } from "./components/AnimatedBackground";
import { LoginScreen } from "./screens/LoginScreen";
import { MainMenu } from "./screens/MainMenu";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [fontsLoaded] = useFonts({
    BreatheFireIII: require("./assets/fonts/BreatheFireIII.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <AnimatedBackground />

        {isLoggedIn ? (
          <MainMenu onLogout={() => setIsLoggedIn(false)} />
        ) : (
          <LoginScreen onLogin={() => setIsLoggedIn(true)} />
        )}

      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});