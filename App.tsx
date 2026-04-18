import { useState, useEffect } from "react";
import { StyleSheet, StatusBar, Alert, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import * as Linking from 'expo-linking';
import AsyncStorage from "@react-native-async-storage/async-storage"; // <-- Imported AsyncStorage

// Services
import { supabase } from "./services/supabase";
import { quizService } from "./services/quizService";

// Screens
import { LoginScreen } from "./screens/LoginScreen";
import { MainMenu } from "./screens/MainMenu";
import { LoadPathScreen } from "./screens/LoadPathScreen";
import { PathDifficultyScreen } from "./screens/PathDifficultyScreen";
import { GameplayScreen } from "./screens/GameplayScreen";
import { LeaderboardScreen } from "./screens/Leaderboard";
import { ResetPasswordScreen } from "./screens/ResetPasswordScreen";
import { UploadScreen } from "./screens/UploadScreen"; 

export default function App() {
	// --- Fonts ---
	const [fontsLoaded] = useFonts({
		BreatheFireIII: require("./assets/fonts/BreatheFireIII.ttf"),
	});

	// --- Global Navigation & App State ---
	const [currentScreen, setCurrentScreen] = useState<
		"Login" | "MainMenu" | "LoadPath" | "PathDifficulty" | "Gameplay" | "Leaderboard" | "ResetPassword" | "Upload"
	>("Login");

	const [selectedQuizId, setSelectedQuizId] = useState<string>("");
	const [selectedPathTitle, setSelectedPathTitle] = useState<string>("");
	const [selectedDifficulty, setSelectedDifficulty] = useState<
		"basic" | "beginner" | "intermediate" | "advanced"
	>("basic");

	// --- Supabase Auth Listener ---
	useEffect(() => {
		const { data: authListener } = supabase.auth.onAuthStateChange(
			async (event, session) => {
				if (event === "PASSWORD_RECOVERY") {
					setCurrentScreen("ResetPassword");
				} else if (event === "SIGNED_IN" && currentScreen === "Login") {
					setCurrentScreen("MainMenu");
				} else if (event === "SIGNED_OUT") {
					setCurrentScreen("Login");
				}
			}
		);

		return () => {
			authListener.subscription.unsubscribe();
		};
	}, [currentScreen]);

	// --- Deep Link Listener ---
	const url = Linking.useURL();

	useEffect(() => {
		const handleDeepLink = async () => {
			if (!url) return;

			const parsed = Linking.parse(url);
			
			if (parsed.path && parsed.path.includes("quiz/")) {
				const sharedQuizId = parsed.path.replace("quiz/", "");
				
				try {
					const { data: { user } } = await supabase.auth.getUser();
					if (!user) {
						Alert.alert("Hold on!", "You need to log in to import this path.");
						return;
					}

					Alert.alert("Importing...", "Cloning path to your account.");

					const newQuizId = await quizService.importSharedQuiz(sharedQuizId, user.id);
					
					setSelectedQuizId(newQuizId);
					setSelectedPathTitle("Imported Path"); 
					
					// Save to local storage for the Continue button
					try {
						await AsyncStorage.setItem("last_quiz_id", newQuizId);
						await AsyncStorage.setItem("last_quiz_title", "Imported Path");
					} catch(e) {}

					setCurrentScreen("PathDifficulty");

				} catch (error: any) {
					Alert.alert("Import Failed", error.message);
				}
			}
		};

		handleDeepLink();
	}, [url]);

	// --- Wait for fonts to load ---
	if (!fontsLoaded) {
		return <View style={styles.background} />;
	}

	// --- Screen Router ---
	const renderScreen = () => {
		switch (currentScreen) {
			case "Login":
				return <LoginScreen />;
				
			case "MainMenu":
				return (
					<MainMenu
						onLogout={async () => {
							const { error } = await supabase.auth.signOut();
							if (error) Alert.alert("Logout Error", error.message);
						}}
						onNavigateToLoadPath={() => setCurrentScreen("LoadPath")}
						onNavigateToNewPath={() => setCurrentScreen("Upload")}
						onNavigateToContinue={(id: string, title: string) => {
							// Push them directly into the difficulty selector
							setSelectedQuizId(id);
							setSelectedPathTitle(title);
							setCurrentScreen("PathDifficulty");
						}}
					/>
				);

			case "Upload":
				return (
					<UploadScreen 
						onBack={() => setCurrentScreen("MainMenu")} 
						onSuccess={() => setCurrentScreen("LoadPath")} 
					/>
				);

			case "LoadPath":
				return (
					<LoadPathScreen
						onPathSelect={async (id: string, title: string) => {
							setSelectedQuizId(id);
							setSelectedPathTitle(title);
							
							// Save to local storage the moment they open a path
							try {
								await AsyncStorage.setItem("last_quiz_id", id);
								await AsyncStorage.setItem("last_quiz_title", title);
							} catch (e) {
								console.error("Failed to save last played", e);
							}

							setCurrentScreen("PathDifficulty");
						}}
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
						quizId={selectedQuizId}
						pathTitle={selectedPathTitle}
						onBack={() => setCurrentScreen("PathDifficulty")}
					/>
				);

			case "ResetPassword":
				return (
					<ResetPasswordScreen 
						onPasswordUpdated={() => setCurrentScreen("Login")} 
					/>
				);

			default:
				return <LoginScreen />;
		}
	};

	return (
		<SafeAreaProvider>
			<StatusBar barStyle="light-content" backgroundColor="#1b1226" />
			<View style={styles.background}>
				{renderScreen()}
			</View>
		</SafeAreaProvider>
	);
}

const styles = StyleSheet.create({
	background: {
		flex: 1,
		backgroundColor: "#1b1226", 
	},
});