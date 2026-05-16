import { useState, useEffect } from "react";
import { StyleSheet, StatusBar, Alert, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import * as Linking from 'expo-linking';
import AsyncStorage from "@react-native-async-storage/async-storage";

// Services
import { supabase } from "./services/supabase";
import { quizService } from "./services/quizService";

// Screens
import { LoginScreen } from "./screens/LoginScreen";
import { MainMenu } from "./screens/MainMenu";
import { LoadPathScreen } from "./screens/LoadPathScreen";
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
		"Login" | "MainMenu" | "LoadPath" | "Gameplay" | "Leaderboard" | "ResetPassword" | "Upload"
	>("Login");

	const [selectedQuizId, setSelectedQuizId] = useState<string>("");
	const [selectedPathTitle, setSelectedPathTitle] = useState<string>("");

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
					
					try {
						await AsyncStorage.setItem("last_quiz_id", newQuizId);
						await AsyncStorage.setItem("last_quiz_title", "Imported Path");
					} catch(e) {}

					setCurrentScreen("Gameplay");

				} catch (error: any) {
					Alert.alert("Import Failed", error.message);
				}
			}
		};

		handleDeepLink();
	}, [url]);

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
							setSelectedQuizId(id);
							setSelectedPathTitle(title);
							setCurrentScreen("Gameplay");
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
							try {
								await AsyncStorage.setItem("last_quiz_id", id);
								await AsyncStorage.setItem("last_quiz_title", title);
							} catch (e) {}

							setCurrentScreen("Gameplay");
						}}
						onBack={() => setCurrentScreen("MainMenu")} 
					/>
				);

			case "Gameplay":
				return (
					<GameplayScreen
						quizId={selectedQuizId}
						pathTitle={selectedPathTitle}
						onBack={() => setCurrentScreen("LoadPath")}
						onGoToLeaderboard={() => setCurrentScreen("Leaderboard")}
					/>
				);

			case "Leaderboard":
				return (
					<LeaderboardScreen
						quizId={selectedQuizId}
						pathTitle={selectedPathTitle}
						// Fixed routing to return safely to Main Menu instead of missing screen
						onBack={() => setCurrentScreen("MainMenu")}
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