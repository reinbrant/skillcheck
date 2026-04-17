import React from "react";
import {
	View,
	Text,
	StyleSheet,
	Image,
	Modal,
	Pressable,
	TouchableOpacity,
} from "react-native";
import { useSettings } from "../contexts/SettingsContext";

interface SettingsModalProps {
	visible: boolean;
	onClose: () => void;
	onLogout: () => void;
}

const ToggleRow = ({
	label,
	isOff,
	onToggle,
}: {
	label: string;
	isOff: boolean;
	onToggle: () => void;
}) => {
	return (
		<View style={styles.settingRow}>
			<Text style={styles.settingLabel}>{label}</Text>
			<Pressable style={styles.toggleButton} onPress={onToggle}>
				<View
					style={[
						styles.toggleIndicator,
						isOff ? styles.toggleOff : styles.toggleOn,
					]}
				>
					<Text style={styles.toggleText}>
						{isOff ? "OFF" : "ON"}
					</Text>
				</View>
			</Pressable>
		</View>
	);
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
	visible,
	onClose,
	onLogout,
}) => {
	const { isMusicMuted, toggleMusic, isAnimationDisabled, toggleAnimation } =
		useSettings();

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

					<TouchableOpacity
						style={styles.backButton}
						onPress={onClose}
					>
						<Text style={styles.backArrowText}>{"\u2190"}</Text>
					</TouchableOpacity>

					<View style={styles.headerSection}>
						<Text style={styles.titleText}>SETTINGS</Text>
					</View>

					<View style={styles.sectionContainer}>
						<ToggleRow
							label="Background Music"
							isOff={isMusicMuted}
							onToggle={toggleMusic}
						/>
						<ToggleRow
							label="Background Animation"
							isOff={isAnimationDisabled}
							onToggle={toggleAnimation}
						/>
					</View>

					<View style={styles.spacer} />

					<View style={styles.bottomButtonsRow}>
						<TouchableOpacity
							style={styles.actionButton}
							onPress={() => console.log("Switch")}
						>
							<Image
								source={require("../assets/Button_Texture1.jpg")}
								style={StyleSheet.absoluteFillObject}
								resizeMode="cover"
							/>
							<View
								style={[
									styles.purpleTintOverlay,
									styles.switchAccountTint,
								]}
							/>
							<View style={styles.buttonBorderGlow} />
							<Text style={styles.actionButtonText}>
								Switch Accounts
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.actionButton}
							onPress={onLogout}
						>
							<Image
								source={require("../assets/Button_Texture1.jpg")}
								style={StyleSheet.absoluteFillObject}
								resizeMode="cover"
							/>
							<View
								style={[
									styles.purpleTintOverlay,
									styles.signOutTint,
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
		height: 450,
		backgroundColor: "#1b1226",
		borderWidth: 1.5,
		borderColor: "#d8b4e2",
		padding: 20,
		paddingTop: 30,
		shadowColor: "#d8b4e2",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.8,
		shadowRadius: 15,
		elevation: 10,
	},
	cardBackground: {
		...StyleSheet.absoluteFillObject,
		overflow: "hidden",
	},
	purpleTintOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(22, 10, 38, 0.95)",
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
		marginBottom: 30,
	},
	titleText: {
		color: "#ffffff",
		fontFamily: "BreatheFireIII",
		fontSize: 38,
		textShadowColor: "rgba(216, 180, 226, 0.8)",
		textShadowOffset: { width: 0, height: 0 },
		textShadowRadius: 8,
	},
	sectionContainer: {
		borderWidth: 1,
		borderColor: "rgba(216, 180, 226, 0.4)",
		padding: 15,
		backgroundColor: "rgba(216, 180, 226, 0.05)",
	},
	settingRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 15,
	},
	settingLabel: {
		color: "#ffffff",
		fontFamily: "BreatheFireIII",
		fontSize: 20,
	},
	toggleButton: {
		width: 60,
		height: 30,
		backgroundColor: "rgba(0,0,0,0.5)",
		borderWidth: 1,
		borderColor: "rgba(216, 180, 226, 0.5)",
		borderRadius: 4,
		overflow: "hidden",
	},
	toggleIndicator: {
		...StyleSheet.absoluteFillObject,
		justifyContent: "center",
		alignItems: "center",
	},
	toggleOn: {
		backgroundColor: "rgba(107, 40, 145, 0.8)",
	},
	toggleOff: {
		backgroundColor: "transparent",
	},
	toggleText: {
		color: "#ffffff",
		fontFamily: "BreatheFireIII",
		fontSize: 14,
	},
	spacer: {
		flex: 1,
	},
	bottomButtonsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
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
	switchAccountTint: {
		backgroundColor: "rgba(30, 60, 70, 0.85)",
	},
	signOutTint: {
		backgroundColor: "rgba(80, 20, 25, 0.85)",
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
