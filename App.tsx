import React, { useState } from "react";
import { StyleSheet, StatusBar } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";

import { AnimatedBackground } from "./components/AnimatedBackground";
import { LoginScreen } from "./screens/LoginScreen";
import { MainMenu } from "./screens/MainMenu";
import { LoadPathScreen } from "./screens/LoadPathScreen";
import { PathDifficultyScreen } from "./screens/PathDifficultyScreen";
import { LeaderboardScreen } from "./screens/Leaderboard";

type ScreenState =
	| "Login"
	| "MainMenu"
	| "LoadPath"
	| "PathDifficulty"
	| "Leaderboard";

export default function App() {
	const [currentScreen, setCurrentScreen] = useState<ScreenState>("Login");
	const [selectedPathTitle, setSelectedPathTitle] = useState("");
	const [fontsLoaded] = useFonts({
		BreatheFireIII: require("./assets/fonts/BreatheFireIII.ttf"),
	});

	if (!fontsLoaded) {
		return null;
	}

	const renderScreen = () => {
		switch (currentScreen) {
			case "Login":
				return (
					<LoginScreen onLogin={() => setCurrentScreen("MainMenu")} />
				);

			case "MainMenu":
				return (
					<MainMenu
						onLogout={() => setCurrentScreen("Login")}
						onNavigateToLoadPath={() =>
							setCurrentScreen("LoadPath")
						}
					/>
				);

			case "LoadPath":
				return (
					<LoadPathScreen
						onBack={() => setCurrentScreen("MainMenu")}
						onPathSelect={(title: string) => {
							setSelectedPathTitle(title);
							setCurrentScreen("PathDifficulty");
						}}
					/>
				);

			case "PathDifficulty":
				return (
					<PathDifficultyScreen
						pathTitle={selectedPathTitle}
						onBack={() => setCurrentScreen("LoadPath")}
						onViewLeaderboard={() =>
							setCurrentScreen("Leaderboard")
						}
					/>
				);

			case "Leaderboard":
				return (
					<LeaderboardScreen
						moduleTitle={selectedPathTitle}
						onBack={() => setCurrentScreen("PathDifficulty")}
					/>
				);

			default:
				return (
					<LoginScreen onLogin={() => setCurrentScreen("MainMenu")} />
				);
		}
	};

	return (
		<SafeAreaProvider>
			<SafeAreaView style={styles.container}>
				<StatusBar barStyle="light-content" />

				<AnimatedBackground />
				{renderScreen()}
			</SafeAreaView>
		</SafeAreaProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
