import React from "react";
import {
	View,
	Text,
	StyleSheet,
	Image,
	Modal,
	Pressable,
	TouchableOpacity,
	DimensionValue,
} from "react-native";

interface UserProfileProps {
	visible: boolean;
	onClose: () => void;
	onLogout: () => void;
	username?: string;
	level?: number;
	currentExp?: number;
	maxExp?: number;
	stats?: {
		languages: Record<string, number>;
		weeklyActivity: {
			sessions: number;
			expGained: number;
			exercisesFinished: number;
		};
	};
}

export const UserProfile: React.FC<UserProfileProps> = ({
	visible,
	onClose,
	onLogout,
	username = "USERNAME",
	level = 1,
	currentExp = 60,
	maxExp = 100,
	stats = {
		languages: {},
		weeklyActivity: { sessions: 0, expGained: 0, exercisesFinished: 0 },
	},
}) => {
	const expPercentage = (currentExp / maxExp) * 100;

	// Fallback data if languages object is empty from DB
	const languagesToDisplay = Object.keys(stats.languages).length > 0
		? Object.entries(stats.languages)
		: [["Python", 0], ["C", 0]];

    // Smoothly close the modal before logging out to prevent visual glitches
    const handleLogoutAction = () => {
        onClose();
        setTimeout(() => {
            onLogout();
        }, 300);
    };

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<Pressable style={styles.overlay} onPress={onClose}>
				<Pressable
					style={styles.modalCard}
					onPress={(e) => e.stopPropagation()}
				>
					<View style={styles.cardBackground}>
						<Image
							source={require("../assets/Button_Texture1.jpg")}
							style={StyleSheet.absoluteFillObject}
							resizeMode="cover"
						/>
						<View style={styles.purpleTintOverlay} />
					</View>

					<View style={styles.diamondWrapper}>
						<View style={styles.diamondOuter}>
							<Image
								source={require("../assets/Button_Texture1.jpg")}
								style={StyleSheet.absoluteFillObject}
								resizeMode="cover"
							/>
							<View style={styles.purpleTintOverlay} />
							<View style={styles.diamondInner} />
						</View>
					</View>

					<TouchableOpacity
						style={styles.backButton}
						onPress={onClose}
					>
						<Text style={styles.backArrowText}>←</Text>
					</TouchableOpacity>

					{/* Header */}
					<View style={styles.headerSection}>
						<Text style={styles.usernameText}>
							{username.toUpperCase()}
						</Text>

						<View style={styles.mainExpBarContainer}>
							<View style={styles.slantedBarBackground} />
							<View
								style={[
									styles.slantedBarFill,
									{ width: `${expPercentage}%` as DimensionValue },
								]}
							/>
						</View>

						<View style={styles.headerStatsRow}>
							<Text style={styles.smallStatText}>
								Level {level}
							</Text>
							<Text style={styles.smallStatText}>
								{currentExp}/{maxExp} EXP
							</Text>
						</View>
					</View>

					{/* Progress Section */}
					<View style={styles.sectionContainer}>
						<Text style={styles.sectionTitle}>
							Language Progress
						</Text>

						{languagesToDisplay.map(([langName, progressValue]) => (
							<React.Fragment key={langName}>
								<View style={styles.progressRow}>
									<Text style={styles.progressLabel}>{langName}</Text>
									<Text style={styles.progressValue}>{progressValue}%</Text>
								</View>
								<View style={styles.languageBarContainer}>
									<View style={styles.slantedBarBackground} />
									<View
										style={[
											styles.slantedBarFill,
											{ width: `${progressValue}%` as DimensionValue },
										]}
									/>
								</View>
							</React.Fragment>
						))}
					</View>

					{/* Activity Section / Stats */}
					<View style={styles.sectionContainer}>
						<Text style={styles.sectionTitle}>Weekly Activity</Text>

						<View style={styles.statRow}>
							<Text style={styles.statLabel}>Sessions</Text>
							<Text style={styles.statValue}>{stats.weeklyActivity.sessions}</Text>
						</View>
						<View style={styles.statRow}>
							<Text style={styles.statLabel}>EXP Gained</Text>
							<Text style={styles.statValue}>{stats.weeklyActivity.expGained}</Text>
						</View>
						<View style={styles.statRow}>
							<Text style={styles.statLabel}>
								Exercises Finished
							</Text>
							<Text style={styles.statValue}>{stats.weeklyActivity.exercisesFinished}</Text>
						</View>
					</View>

					{/* Bottom Action Buttons */}
					<View style={styles.bottomButtonsRow}>
						{/* Switch Accounts Button - Now fully wired! */}
						<TouchableOpacity
							style={styles.actionButton}
							onPress={handleLogoutAction}
						>
							<Image
								source={require("../assets/Button_Texture1.jpg")}
								style={StyleSheet.absoluteFillObject}
								resizeMode="cover"
							/>
							<View
								style={[
									styles.purpleTintOverlay,
									{
										backgroundColor:
											"rgba(30, 60, 70, 0.85)",
									},
								]}
							/>
							<View style={styles.buttonBorderGlow} />
							<Text style={styles.actionButtonText}>
								Switch Accounts
							</Text>
						</TouchableOpacity>

						{/* Sign Out Button - Now fully wired! */}
						<TouchableOpacity
							style={styles.actionButton}
							onPress={handleLogoutAction}
						>
							<Image
								source={require("../assets/Button_Texture1.jpg")}
								style={StyleSheet.absoluteFillObject}
								resizeMode="cover"
							/>
							<View
								style={[
									styles.purpleTintOverlay,
									{
										backgroundColor:
											"rgba(80, 20, 25, 0.85)",
									},
								]}
							/>
							<View style={styles.buttonBorderGlow} />
							<Text style={styles.actionButtonText}>
								Sign Out
							</Text>
						</TouchableOpacity>
					</View>
				</Pressable>
			</Pressable>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.85)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalCard: {
		width: "85%",
		backgroundColor: "#1b1226",
		borderWidth: 1.5,
		borderColor: "#d8b4e2",
		padding: 20,
		paddingTop: 45,
		shadowColor: "#d8b4e2",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.8,
		shadowRadius: 15,
		elevation: 10,
		position: "relative",
	},
	cardBackground: {
		...StyleSheet.absoluteFillObject,
		overflow: "hidden",
	},
	purpleTintOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(22, 10, 38, 0.9)",
	},
	diamondWrapper: {
		position: "absolute",
		top: -35,
		alignSelf: "center",
		zIndex: 10,
	},
	diamondOuter: {
		width: 65,
		height: 65,
		borderWidth: 2,
		borderColor: "#d8b4e2",
		transform: [{ rotate: "45deg" }],
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
		backgroundColor: "#1b1226",
	},
	diamondInner: {
		width: 42,
		height: 42,
		borderWidth: 1,
		borderColor: "#d8b4e2",
		backgroundColor: "#302845",
	},
	backButton: {
		position: "absolute",
		top: 10,
		left: 15,
		zIndex: 10,
		padding: 5,
	},
	backArrowText: {
		color: "#ffffff",
		fontSize: 28,
		fontWeight: "bold",
		textShadowColor: "#d8b4e2",
		textShadowRadius: 5,
	},
	headerSection: {
		alignItems: "center",
		marginBottom: 20,
	},
	usernameText: {
		color: "#ffffff",
		fontFamily: "BreatheFireIII",
		fontSize: 32,
		marginBottom: 5,
		textShadowColor: "rgba(216, 180, 226, 0.8)",
		textShadowOffset: { width: 0, height: 0 },
		textShadowRadius: 8,
	},
	mainExpBarContainer: {
		width: "90%",
		height: 12,
		marginBottom: 5,
		position: "relative",
		overflow: "hidden",
	},
	headerStatsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "90%",
	},
	smallStatText: {
		color: "#ffffff",
		fontFamily: "BreatheFireIII",
		fontSize: 10,
	},
	slantedBarBackground: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(216, 180, 226, 0.2)",
		transform: [{ skewX: "-45deg" }],
		borderWidth: 1,
		borderColor: "rgba(216, 180, 226, 0.5)",
	},
	slantedBarFill: {
		position: "absolute",
		left: 0,
		top: 0,
		bottom: 0,
		backgroundColor: "#d8b4e2",
		transform: [{ skewX: "-45deg" }],
		marginLeft: -5,
		paddingRight: 5,
	},
	sectionContainer: {
		borderWidth: 1,
		borderColor: "rgba(216, 180, 226, 0.4)",
		padding: 12,
		marginBottom: 12,
		backgroundColor: "rgba(216, 180, 226, 0.05)",
	},
	sectionTitle: {
		color: "#ffffff",
		fontFamily: "BreatheFireIII",
		fontSize: 18,
		marginBottom: 8,
		textShadowColor: "rgba(216, 180, 226, 0.5)",
		textShadowOffset: { width: 0, height: 0 },
		textShadowRadius: 4,
	},
	progressRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 4,
	},
	progressLabel: {
		color: "#ffffff",
		fontSize: 12,
		fontWeight: "bold",
	},
	progressValue: {
		color: "#ffffff",
		fontSize: 12,
	},
	languageBarContainer: {
		width: "100%",
		height: 8,
		marginBottom: 12,
		position: "relative",
		overflow: "hidden",
	},
	statRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 2,
	},
	statLabel: {
		color: "#ffffff",
		fontSize: 11,
	},
	statValue: {
		color: "#ffffff",
		fontSize: 11,
		fontWeight: "bold",
	},
	bottomButtonsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 10,
	},
	actionButton: {
		flex: 0.48,
		height: 45,
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.4)",
	},
	buttonBorderGlow: {
		...StyleSheet.absoluteFillObject,
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.1)",
	},
	actionButtonText: {
		color: "#ffffff",
		fontFamily: "BreatheFireIII",
		fontSize: 18,
		textShadowColor: "#000",
		textShadowOffset: { width: 1, height: 1 },
		textShadowRadius: 2,
	},
});