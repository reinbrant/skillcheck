import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DifficultyCarousel } from "../components/DifficultyCarousel";
import { ResultModal } from "../components/ResultModal";
import { MenuButton } from "../components/MenuButton";
import { supabase } from "../services/supabase";

interface PathDifficultyScreenProps {
	onBack: () => void;
	pathTitle: string;
	onViewLeaderboard: () => void;
	onPlay: (difficulty: "easy" | "medium" | "hard") => void;
	quizId: string;
}

export const PathDifficultyScreen: React.FC<PathDifficultyScreenProps> = ({
	onBack,
	pathTitle,
	onViewLeaderboard,
	onPlay,
	quizId,
}) => {
	const [isBackHovered, setIsBackHovered] = useState(false);
	const [progressPercent, setProgressPercent] = useState(0);

	useEffect(() => {
		const fetchProgress = async () => {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return;

			const { data } = await supabase
				.from('quiz_attempts')
				.select('completed_difficulties')
				.eq('quiz_id', quizId)
				.eq('user_id', user.id)
				.maybeSingle();

			if (data && data.completed_difficulties) {
				const completedCount = data.completed_difficulties.length;
				// Change the division from 3 to 4!
				const percent = Math.min(Math.round((completedCount / 4) * 100), 100);
				setProgressPercent(percent);
			}
		};

		fetchProgress();
	}, [quizId]);

	// Mock states for result modal
	const [showResult, setShowResult] = useState(false);
	const [isVictory, setIsVictory] = useState(true);

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.container}>
				<Pressable
					onPress={onBack}
					onHoverIn={() => setIsBackHovered(true)}
					onHoverOut={() => setIsBackHovered(false)}
					style={({ pressed }) => [
						styles.backButton,
						(pressed || isBackHovered) && styles.backButtonHovered,
					]}
				>
					<Text style={styles.backArrow}>←</Text>
				</Pressable>

				{/* Header Section */}
				<View style={styles.headerSection}>
					<View style={styles.topDiamondOuter}>
						<View style={styles.topDiamondInner}>
							<Text style={styles.placeholderText}>?</Text>
						</View>
					</View>

					{/* Dynamic Path Title */}
					<Text
						style={styles.headerTitle}
						numberOfLines={2}
						adjustsFontSizeToFit
						minimumFontScale={0.5}
					>
						{pathTitle.toUpperCase()}
					</Text>
				</View>

				{/* Carousel Component */}
				<DifficultyCarousel onSelectDifficulty={onPlay} />

				{/* Leaderboard Button */}
				<View style={styles.leaderboardButtonWrapper}>
					<MenuButton
						title="LEADERBOARD"
						onPress={onViewLeaderboard}
						isThin
					/>
				</View>

				{/* Bottom Progress Bar */}
				<View style={styles.progressContainer}>
					<Text style={styles.progressText}>{progressPercent}%</Text>
					<View style={styles.progressBarBackground}>
						<View
							style={[
								styles.progressBarFill,
								{ width: `${progressPercent}%` },
							]}
						/>
					</View>
				</View>
			</View>

			<ResultModal
				visible={showResult}
				isVictory={isVictory}
				score={20}
				timeLeft={"0:02"}
				onSelectLevel={() => console.log("return to level select")}
				onNextOrRetry={() => console.log("next or retry pressed")}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "transparent",
	},
	container: {
		flex: 1,
		width: "100%",
	},
	backButton: {
		position: "absolute",
		top: 20,
		left: 25,
		zIndex: 10,
		paddingVertical: 10,
		paddingRight: 15,
	},
	backButtonHovered: {
		opacity: 0.6,
		transform: [{ scale: 0.9 }],
	},
	backArrow: {
		color: "#ffffff",
		fontSize: 28,
		fontWeight: "bold",
		textShadowColor: "#d8b4e2",
		textShadowRadius: 8,
	},
	headerSection: {
		alignItems: "center",
		marginTop: 40,
		marginBottom: 10,
	},
	topDiamondOuter: {
		width: 60,
		height: 60,
		borderWidth: 2,
		borderColor: "#d8b4e2",
		transform: [{ rotate: "45deg" }],
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#1b1226",
		marginBottom: 35,
		shadowColor: "#d8b4e2",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.8,
		shadowRadius: 10,
	},
	topDiamondInner: {
		width: 40,
		height: 40,
		borderWidth: 1,
		borderColor: "rgba(216, 180, 226, 0.5)",
		backgroundColor: "#302845",
		alignItems: "center",
		justifyContent: "center",
	},
	placeholderText: {
		color: "#d8b4e2",
		transform: [{ rotate: "-45deg" }],
		fontFamily: "BreatheFireIII",
		fontSize: 20,
	},
	headerTitle: {
		color: "#ffffff",
		fontFamily: "BreatheFireIII",
		fontSize: 42,
		textShadowColor: "rgba(216, 180, 226, 0.8)",
		textShadowOffset: { width: 0, height: 0 },
		textShadowRadius: 10,
		textAlign: "center",
		width: "85%",
	},

	// Leaderboard Button Styles
	leaderboardButtonWrapper: {
		position: "absolute",
		bottom: -60, // Adjust to change button positioning
		width: "70%",
		alignSelf: "center",
		zIndex: 50,
	},

	progressContainer: {
		paddingHorizontal: 30,
		paddingBottom: 40,
	},
	progressText: {
		color: "#ffffff",
		fontFamily: "BreatheFireIII",
		fontSize: 16,
		textAlign: "right",
		marginBottom: 5,
	},
	progressBarBackground: {
		width: "100%",
		height: 6,
		backgroundColor: "rgba(216, 180, 226, 0.2)",
		borderRadius: 3,
		overflow: "hidden",
	},
	progressBarFill: {
		height: "100%",
		backgroundColor: "#ffffff",
		shadowColor: "#ffffff",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 1,
		shadowRadius: 8,
	},
});
