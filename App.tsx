import React, { useState, useEffect } from "react";
import { StyleSheet, StatusBar } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { supabase } from "./services/supabase"; 
import { AnimatedBackground } from "./components/AnimatedBackground";
import { LoginScreen } from "./screens/LoginScreen";
import { MainMenu } from "./screens/MainMenu";
import { LoadPathScreen } from "./screens/LoadPathScreen";
import { PathDifficultyScreen } from "./screens/PathDifficultyScreen";
import { LeaderboardScreen } from "./screens/Leaderboard";
import { UploadScreen } from "./screens/UploadScreen"
import { GameplayScreen } from "./screens/GameplayScreen";
import { SettingsProvider } from "./contexts/SettingsContext";

type ScreenState =
	| "Login"
	| "MainMenu"
	| "LoadPath"
    | "UploadPath"
	| "PathDifficulty"
	| "Leaderboard"
	| "Gameplay";

export default function App() {
	const [currentScreen, setCurrentScreen] = useState<ScreenState>("Login");
	const [selectedPathTitle, setSelectedPathTitle] = useState("");

	const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard">("easy");
	const [selectedQuizId, setSelectedQuizId] = useState("");

	const [fontsLoaded] = useFonts({
		BreatheFireIII: require("./assets/fonts/BreatheFireIII.ttf"),
	});

    // Check auth state on load
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) setCurrentScreen("MainMenu");
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) setCurrentScreen("MainMenu");
            else setCurrentScreen("Login");
        });

        return () => subscription.unsubscribe();
    }, []);

	if (!fontsLoaded) return null;

	const renderScreen = () => {
		switch (currentScreen) {
			case "Login":
				return <LoginScreen />;
			case "MainMenu":
				return (
					<MainMenu
						onLogout={() => supabase.auth.signOut()}
						onNavigateToLoadPath={() => setCurrentScreen("LoadPath")}
                        onNavigateToNewPath={() => setCurrentScreen("UploadPath")}
					/>
				);
			case "LoadPath":
				return (
					<LoadPathScreen
						onBack={() => setCurrentScreen("MainMenu")}
						onPathSelect={(id: string, title: string) => {
							setSelectedQuizId(id); 
							setSelectedPathTitle(title);
							setCurrentScreen("PathDifficulty");
						}}
					/>
				);
            case "UploadPath":
                return (
                    <UploadScreen 
                        onBack={() => setCurrentScreen("MainMenu")} 
                    />
                );
			case "PathDifficulty":
				return (
					<PathDifficultyScreen
						quizId={selectedQuizId}
						pathTitle={selectedPathTitle}
						onBack={() => setCurrentScreen("LoadPath")}
						onViewLeaderboard={() => setCurrentScreen("Leaderboard")}
						// 2. Update the types in the callback
						onPlay={(difficulty: "basic" | "beginner" | "intermediate" | "advanced") => {
							setSelectedDifficulty(difficulty);
							setCurrentScreen("Gameplay");
						}}
					/>
				);
			case "Gameplay":
				return (
					<GameplayScreen
						quizId={selectedQuizId}
						pathTitle={selectedPathTitle}
						difficulty={selectedDifficulty}
						onBack={() => setCurrentScreen("PathDifficulty")}
						onSelectLevel={() => setCurrentScreen("LoadPath")}
						onGoToLeaderboard={() => setCurrentScreen("Leaderboard")}
					/>
				);
			case "Leaderboard":
				return (
					<LeaderboardScreen
						moduleTitle={selectedPathTitle}
						onBack={() => setCurrentScreen("PathDifficulty")}
						quizId={selectedQuizId} 
					/>
				);
			default:
				return <LoginScreen />;
		}
	};

	return (
		<SettingsProvider>
			<SafeAreaProvider>
				<SafeAreaView style={styles.container}>
					<StatusBar barStyle="light-content" />
					<AnimatedBackground />
					{renderScreen()}
				</SafeAreaView>
			</SafeAreaProvider>
		</SettingsProvider>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
});