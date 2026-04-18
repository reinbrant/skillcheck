import { useState, useEffect } from "react";
import {
	View,
	Image,
	StyleSheet,
	Platform,
	StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MenuButton } from "../components/MenuButton";
import { PlayerInfoWidget } from "../components/PlayerInfoWidget";
import { UserProfile } from "../components/UserProfile";
import { SettingsModal } from "../components/SettingsModal";
import { supabase } from "../services/supabase";

export const MainMenu = ({ onLogout, onNavigateToLoadPath, onNavigateToNewPath }: any) => {
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [userData, setUserData] = useState({
		username: "LOADING...",
		level: 1,
		expCurrent: 0,
		expTotal: 100,
		stats: { // Default empty stats to prevent crashes before fetch completes
			languages: {},
			weeklyActivity: { sessions: 0, expGained: 0, exercisesFinished: 0 },
			achievements: []
		}
	});

	useEffect(() => {
		const fetchProfile = async () => {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return;

			const { data, error } = await supabase
				.from('profiles')
				.select('username, exp, level, stats')
				.eq('id', user.id)
				.single();

			if (data) {
				setUserData({
					username: data.username,
					level: data.level,
					expCurrent: data.exp,
					expTotal: data.level * 100,
					// Fallback to defaults if stats is somehow null
					stats: data.stats || {
						languages: {},
						weeklyActivity: { sessions: 0, expGained: 0, exercisesFinished: 0 },
						achievements: []
					}
				});
			}
		};

		fetchProfile();
	}, []);

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.container}>
				{/* Top Banner Widget */}
				<View style={styles.topWidgetContainer}>
					<PlayerInfoWidget
						username={userData.username}
						level={userData.level}
						expCurrent={userData.expCurrent}
						expTotal={userData.expTotal}
						onPress={() => setIsProfileOpen(true)}
					/>
				</View>

				{/* Center Content (Logo & Buttons) */}
				<View style={styles.centerContent}>
					<View style={styles.logoContainer}>
						<Image
							source={require("../assets/SkillCheck_Logo_v1.png")}
							style={styles.logo}
							resizeMode="contain"
						/>
					</View>

					<View style={styles.menuContainer}>
						<MenuButton
							title="CONTINUE"
							onPress={() => console.log("Continue")}
						/>
						<MenuButton
							title="LOAD  PATH"
							onPress={() => onNavigateToLoadPath()}
						/>
						<MenuButton
							title="NEW  PATH"
							onPress={() => onNavigateToNewPath()}
						/>
						<MenuButton
							title="SETTINGS"
							onPress={() => setIsSettingsOpen(true)}
						/>
					</View>
				</View>

				{/* Profile Modal */}
				<UserProfile
					visible={isProfileOpen}
					onClose={() => setIsProfileOpen(false)}
					onLogout={onLogout}
					username={userData.username}
					level={userData.level}
					currentExp={userData.expCurrent}
					maxExp={userData.expTotal}
					stats={userData.stats} // Pass the new stats object here
				/>

				{/* Settings Modal */}
				<SettingsModal
					visible={isSettingsOpen}
					onClose={() => setIsSettingsOpen(false)}
					onLogout={onLogout}
				/>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
	},
	container: {
		flex: 1,
		alignItems: "center",
		width: "100%",
		paddingHorizontal: 15,
	},
	topWidgetContainer: {
		width: "100%",
		marginTop: 10,
	},
	centerContent: {
		flex: 1,
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
		paddingBottom: 40,
	},
	logoContainer: {
		marginBottom: 50,
		alignItems: "center",
		width: "100%",
		shadowColor: "#d8b4e2",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.8,
		shadowRadius: 20,
		elevation: 15,
	},
	logo: {
		width: "85%",
		height: 120,
	},
	menuContainer: {
		width: "75%",
	},
});
