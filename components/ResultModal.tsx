import { useState } from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";

interface ResultModalProps {
	visible: boolean;
	isVictory: boolean;
	score: number;
	timeLeft: string;
	onSelectLevel: () => void;
	onNextOrRetry: () => void;
}

const MiniButton = ({
	title,
	onPress,
	isPrimary,
}: {
	title: string;
	onPress: () => void;
	isPrimary?: boolean;
}) => {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<Pressable
			onPress={onPress}
			onHoverIn={() => setIsHovered(true)}
			onHoverOut={() => setIsHovered(false)}
			style={({ pressed }) => [
				styles.miniButtonContainer,
				(pressed || isHovered) && { transform: [{ scale: 0.95 }] },
			]}
		>
			{/* Pointer events "none" prevents the background from blocking the click */}
			<View style={StyleSheet.absoluteFillObject} pointerEvents="none">
				<Image
					source={require("../assets/Button_Texture1.jpg")}
					style={styles.cardBackground}
					resizeMode="cover"
				/>
				<View
					style={[
						styles.purpleTintOverlay,
						isPrimary
							? { backgroundColor: "rgba(107, 40, 145, 0.85)" }
							: { backgroundColor: "rgba(22, 10, 38, 0.95)" },
					]}
				/>
				<View style={styles.textInnerGlow} />
			</View>

			<View
				style={[
					styles.miniButtonInner,
					isPrimary && styles.miniButtonPrimaryBorder,
					isHovered && styles.miniButtonHoveredBorder,
				]}
				pointerEvents="none"
			>
				<Text style={styles.miniButtonText}>{title}</Text>
			</View>
		</Pressable>
	);
};

export const ResultModal: React.FC<ResultModalProps> = ({
	visible,
	isVictory,
	score,
	timeLeft,
	onSelectLevel,
	onNextOrRetry,
}) => {
	// If it's not visible, don't render anything!
	if (!visible) return null;

	const title = isVictory ? "VICTORY!" : "DEFEAT!";
	const primaryButtonText = isVictory ? "NEXT" : "RETRY";

	return (
		// FIX: We replaced the <Modal> with a high-zIndex absolute view
		<View style={styles.modalAbsoluteWrapper}>
			<View style={styles.overlay}>
				<View style={styles.modalBody}>
					<View style={styles.headerZIndex} pointerEvents="none">
						<Image
							source={require("../assets/ResultModal_Header.png")}
							style={styles.headerImage}
							resizeMode="stretch"
						/>
					</View>

					<View style={styles.shadowWrapper}>
						<View style={styles.cardInner}>
							<View style={StyleSheet.absoluteFillObject} pointerEvents="none">
								<Image
									source={require("../assets/Button_Texture1.jpg")}
									style={{ width: "100%", height: "100%" }}
									resizeMode="cover"
								/>
								<View style={styles.purpleTintOverlay} />
							</View>

							<View style={styles.contentContainer}>
								<Text style={styles.titleText}>{title}</Text>

								<View style={styles.statsContainer}>
									<Text style={styles.statText}>SCORE: {score}</Text>
									<Text style={styles.statText}>TIME LEFT: {timeLeft}</Text>
								</View>

								<View style={styles.buttonsRow}>
									<MiniButton title="SELECT LEVEL" onPress={onSelectLevel} />
									<MiniButton title={primaryButtonText} onPress={onNextOrRetry} isPrimary />
								</View>
							</View>
						</View>
					</View>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	// This wrapper ensures the modal sits on top of everything without causing Native crashes
	modalAbsoluteWrapper: {
		...StyleSheet.absoluteFillObject,
		zIndex: 1000,
		elevation: 1000,
	},
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.85)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalBody: {
		width: 350,
		alignItems: "center",
	},
	headerZIndex: {
		zIndex: 20,
		elevation: 20,
		width: 400,
		height: 120,
	},
	headerImage: {
		width: "100%",
		height: "100%",
	},
	shadowWrapper: {
		width: 324,
		marginTop: -60,
		zIndex: 10,
		elevation: 10,
		shadowColor: "#d8b4e2",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.5,
		shadowRadius: 20,
	},
	cardInner: {
		width: "100%",
		backgroundColor: "#1b1226",
		borderWidth: 2,
		borderColor: "#5d3c80",
		borderTopWidth: 0,
		overflow: "hidden",
		paddingTop: 55,
	},
	cardBackground: {
		...StyleSheet.absoluteFillObject,
		width: "100%",
		height: "100%",
	},
	purpleTintOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(25, 15, 40, 0.95)",
	},
	contentContainer: {
		paddingHorizontal: 25,
		paddingBottom: 35,
		alignItems: "center",
		zIndex: 2,
	},
	titleText: {
		color: "#ffffff",
		fontFamily: "BreatheFireIII",
		fontSize: 64,
		marginBottom: 20,
		textShadowColor: "rgba(255, 255, 255, 0.5)",
		textShadowOffset: { width: 0, height: 0 },
		textShadowRadius: 8,
	},
	statsContainer: {
		width: "100%",
		alignItems: "flex-start",
		paddingLeft: 10,
		marginBottom: 40,
	},
	statText: {
		color: "#ffffff",
		fontFamily: "BreatheFireIII",
		fontSize: 26,
		marginBottom: 8,
		textShadowColor: "rgba(0, 0, 0, 0.8)",
		textShadowOffset: { width: 1, height: 1 },
		textShadowRadius: 2,
	},
	buttonsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
		marginBottom: -10,
		zIndex: 5,
	},
	miniButtonContainer: {
		width: "48%",
		height: 45,
		shadowColor: "#d8b4e2",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.5,
		shadowRadius: 8,
		elevation: 5,
	},
	miniButtonInner: {
		flex: 1,
		borderWidth: 2,
		borderColor: "rgba(216, 180, 226, 0.4)",
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
		borderRadius: 2,
	},
	miniButtonPrimaryBorder: {
		borderColor: "#d8b4e2",
	},
	miniButtonHoveredBorder: {
		borderColor: "#ffffff",
	},
	textInnerGlow: {
		...StyleSheet.absoluteFillObject,
		borderWidth: 0,
		backgroundColor: "rgba(216, 180, 226, 0.05)",
	},
	miniButtonText: {
		color: "#fae4ff",
		fontFamily: "BreatheFireIII",
		fontSize: 16,
	},
});