import React from "react";
import {
	View,
	Text,
	StyleSheet,
	Image,
	ViewStyle,
	TouchableOpacity,
} from "react-native";

interface PlayerInfoWidgetProps {
	username: string;
	level: number;
	expCurrent: number;
	expTotal: number;
	style?: ViewStyle;
	onPress?: () => void;
}

export const PlayerInfoWidget: React.FC<PlayerInfoWidgetProps> = ({
	username,
	level,
	expCurrent,
	expTotal,
	style,
	onPress,
}) => {
	const expProgress = expTotal > 0 ? expCurrent / expTotal : 0;

	return (
		<TouchableOpacity
			activeOpacity={0.8}
			onPress={onPress}
			style={[styles.mainContainer, style]}
		>
			{/* Left Diamond */}
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

			{/* Right Info Banner */}
			<View style={styles.infoAreaContainer}>
				{/* Banner Background */}
				<View style={styles.textTextureBox}>
					<Image
						source={require("../assets/Button_Texture1.jpg")}
						style={StyleSheet.absoluteFillObject}
						resizeMode="cover"
					/>
					<View
						style={[styles.purpleTintOverlay, { opacity: 0.95 }]}
					/>
				</View>

				{/* Username */}
				<Text style={styles.usernameText}>
					{username.toUpperCase()}
				</Text>

				{/* Level and Slanted EXP Bar */}
				<View style={styles.levelExpRow}>
					<Text style={styles.levelText}>Lvl. {level}</Text>
					<View style={styles.expBarContainer}>
						<View style={styles.slantedBarBackground} />
						<View
							style={[
								styles.slantedBarFill,
								{ width: `${expProgress * 100}%` },
							]}
						/>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	mainContainer: {
		flexDirection: "row",
		alignItems: "center",
		width: "100%",
		height: 60,
		marginBottom: 20,
	},
	diamondWrapper: {
		position: "absolute",
		left: 0,
		zIndex: 2,
	},
	diamondOuter: {
		width: 56,
		height: 56,
		borderWidth: 1.5,
		borderColor: "#d8b4e2",
		transform: [{ rotate: "45deg" }],
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
	},
	diamondInner: {
		width: 36,
		height: 36,
		borderWidth: 1,
		borderColor: "#d8b4e2",
		backgroundColor: "#302845",
	},
	infoAreaContainer: {
		flex: 1,
		marginLeft: 28,
		height: 50,
		borderWidth: 1.5,
		borderColor: "#d8b4e2",
		borderLeftWidth: 0,
		justifyContent: "center",
		paddingLeft: 35,
		paddingRight: 20,
		shadowColor: "#d8b4e2",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.5,
		shadowRadius: 6,
		elevation: 4,
	},
	textTextureBox: {
		...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
	},
	purpleTintOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(22, 10, 38, 0.9)",
	},
	usernameText: {
		color: "#ffffff",
		fontFamily: "BreatheFireIII",
		fontSize: 22,
		textShadowColor: "rgba(216, 180, 226, 0.9)",
		textShadowOffset: { width: 0, height: 0 },
		textShadowRadius: 8,
		marginBottom: 2,
        paddingLeft: 10,
	},
	levelExpRow: {
		flexDirection: "row",
		alignItems: "center",
	},
	levelText: {
		color: "#ffffff",
		fontFamily: "BreatheFireIII",
		fontSize: 12,
		marginRight: 8,
        paddingLeft: 10,
	},
	expBarContainer: {
		flex: 1,
		height: 8,
		position: "relative",
		overflow: "hidden",
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
});
