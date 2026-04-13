import React, { useState } from "react";
import {
	View,
	Image,
	StyleSheet,
	SafeAreaView,
	Platform,
	StatusBar,
} from "react-native";
import { MenuButton } from "../components/MenuButton";
import { PlayerInfoWidget } from "../components/PlayerInfoWidget";
import { UserProfile } from "../components/UserProfile";

export const MainMenu = ({
	onLogout,
	onNavigateToLoadPath,
}: {
	onLogout: () => void;
	onNavigateToLoadPath: () => void;
}) => {
	const [isProfileOpen, setIsProfileOpen] = useState(false);

	const userData = {
		username: "USERNAME",
		level: 1,
		expCurrent: 60,
		expTotal: 100,
	};

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
							onPress={() => console.log("New Path")}
						/>
						<MenuButton
							title="SETTINGS"
							onPress={() => console.log("Settings")}
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
