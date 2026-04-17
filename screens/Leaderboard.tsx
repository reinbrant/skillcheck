import React from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	Pressable,
	Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
	Polygon,
	Defs,
	LinearGradient as SvgGradient,
	Stop,
} from "react-native-svg";

interface LeaderboardScreenProps {
	onBack: () => void;
	moduleTitle: string;
}

// Mock Data
const leaderboardData = [
	{ id: "1", username: "USERNAME", exp: "EXP", rank: 1 },
	{ id: "2", username: "USERNAME", exp: "EXP", rank: 2 },
	{ id: "3", username: "USERNAME", exp: "EXP", rank: 3 },
	{ id: "4", username: "USERNAME", exp: "EXP", rank: 4 },
	{ id: "5", username: "USERNAME", exp: "EXP", rank: 5 },
	{ id: "6", username: "USERNAME", exp: "EXP", rank: 6 },
	{ id: "7", username: "USERNAME", exp: "EXP", rank: 7 },
];

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
	onBack,
	moduleTitle,
}) => {
	// SVG component for top 3 rank diamonds
	const RankIcon = ({ rank }: { rank: number }) => {
		if (rank > 3) {
			return (
				<View style={styles.plainRankContainer}>
					<Text style={styles.plainRankText}>{rank}</Text>
				</View>
			);
		}
		return (
			<View style={styles.rankSvgWrapper}>
				<Svg
					height="36"
					width="36"
					viewBox="0 0 46 46"
					style={StyleSheet.absoluteFillObject}
				>
					{/* Outer glowing border */}
					<Polygon
						points="23,4 42,23 23,42 4,23"
						fill="transparent"
						stroke="#c084fc"
						strokeWidth="2"
					/>
					{/* Inner bright fill */}
					<Polygon
						points="23,8 38,23 23,38 8,23"
						fill="rgba(139, 92, 246, 0.4)"
						stroke="#d8b4e2"
						strokeWidth="1"
					/>
				</Svg>
				<Text style={styles.rankSvgText}>{rank}</Text>
			</View>
		);
	};

	const renderItem = ({ item }: { item: (typeof leaderboardData)[0] }) => (
		<View style={styles.rowContainer}>
			<View style={StyleSheet.absoluteFillObject}>
				<Svg
					width="100%"
					height="100%"
					preserveAspectRatio="none"
					viewBox="0 0 100 100"
				>
					<Defs>
						<SvgGradient id="rowGrad" x1="0" y1="0" x2="1" y2="0">
							<Stop
								offset="0"
								stopColor="#4b2b7a"
								stopOpacity="0.9"
							/>
							<Stop
								offset="1"
								stopColor="#7c46a6"
								stopOpacity="0.9"
							/>
						</SvgGradient>
					</Defs>
					<Polygon
						points="0,0 93,0 100,50 93,100 0,100"
						fill="url(#rowGrad)"
						stroke="#ffffff"
						strokeWidth="1.5"
						vectorEffect="non-scaling-stroke"
					/>
				</Svg>
			</View>
			{/* Row Content */}
			<View style={styles.rowContent}>
				<RankIcon rank={item.rank} />
				<View style={styles.avatarPlaceholder} />
				<View style={styles.userInfo}>
					<Text style={styles.usernameText}>{item.username}</Text>
					<Text style={styles.expText}>{item.exp}</Text>
				</View>
			</View>
		</View>
	);

	return (
		<SafeAreaView style={styles.safeArea}>
			{/* Header */}
			<View style={styles.header}>
				<Pressable onPress={onBack} style={styles.backButton}>
					<Text style={styles.backArrow}>←</Text>
				</Pressable>

				<Text
					style={styles.headerTitle}
					numberOfLines={2}
					adjustsFontSizeToFit
					minimumFontScale={0.5}
				>
					{`${moduleTitle.toUpperCase()} LEADERBOARD`}
				</Text>
			</View>

			{/* Main Leaderboard Wrapper */}
			<View style={styles.modalBody}>
				<View style={styles.borderZIndex} pointerEvents="none">
					<Image
						source={require("../assets/LeaderboardBorder.png")}
						style={styles.borderImage}
						resizeMode="stretch"
					/>
				</View>

				<View style={styles.cardInner}>
					<View style={StyleSheet.absoluteFillObject}>
						<Image
							source={require("../assets/Button_Texture1.jpg")}
							style={{ width: "100%", height: "100%" }}
							resizeMode="cover"
						/>
						<View style={styles.purpleTintOverlay} />
					</View>

					<FlatList
						data={leaderboardData}
						keyExtractor={(item) => item.id}
						renderItem={renderItem}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={styles.listContent}
					/>
				</View>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "transparent",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingTop: 10,
		paddingBottom: 20,
	},
	backButton: {
		paddingVertical: 10,
		paddingRight: 15,
	},
	backArrow: {
		color: "#ffffff",
		fontSize: 28,
		fontWeight: "bold",
	},
	headerTitle: {
		flex: 1,
		color: "#ffffff",
		fontFamily: "BreatheFireIII",
		fontSize: 32,
		textShadowColor: "rgba(216, 180, 226, 0.8)",
		textShadowOffset: { width: 0, height: 0 },
		textShadowRadius: 10,
	},

	modalBody: {
		flex: 1,
		width: 340,
		alignSelf: "center",
		marginBottom: 20,
		position: "relative",
	},

	borderZIndex: {
		position: "absolute",
		top: -20,
		bottom: -15,
		left: -20,
		right: -20,
		zIndex: 20,
		elevation: 20,
	},
	borderImage: {
		width: "100%",
		height: "100%",
	},

	cardInner: {
		flex: 1,
		width: "100%",
		backgroundColor: "#1b1226",
		borderWidth: 2,
		borderColor: "#5d3c80",
		overflow: "hidden",
		zIndex: 10,
		top: 30,
		marginBottom: 20,
	},
	purpleTintOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(25, 15, 40, 0.85)",
	},

	// List Styles
	listContent: {
		paddingTop: 45,
		paddingHorizontal: 20,
		paddingBottom: 40,
	},
	rowContainer: {
		width: "100%",
		height: 60,
		marginBottom: 16,
		justifyContent: "center",
		shadowColor: "#d8b4e2",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.6,
		shadowRadius: 5,
		elevation: 5,
	},
	rowContent: {
		flexDirection: "row",
		alignItems: "center",
		paddingLeft: 10,
		paddingRight: 30,
	},
	rankSvgWrapper: {
		width: 36,
		height: 36,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 10,
	},
	rankSvgText: {
		color: "#ffffff",
		fontFamily: "BreatheFireIII",
		fontSize: 18,
		textShadowColor: "rgba(0, 0, 0, 0.8)",
		textShadowOffset: { width: 1, height: 1 },
		textShadowRadius: 3,
	},
	plainRankContainer: {
		width: 36,
		height: 36,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 10,
	},
	plainRankText: {
		color: "#ffffff",
		fontFamily: "BreatheFireIII",
		fontSize: 22,
		textShadowColor: "rgba(216, 180, 226, 0.8)",
		textShadowRadius: 5,
	},
	avatarPlaceholder: {
		width: 34,
		height: 34,
		borderWidth: 1,
		borderColor: "#d8b4e2",
		backgroundColor: "#1b1226",
		marginRight: 15,
	},
	userInfo: {
		flex: 1,
		justifyContent: "center",
	},
	usernameText: {
		color: "#ffffff",
		fontFamily: "BreatheFireIII",
		fontSize: 18,
		marginBottom: 0,
		textShadowColor: "rgba(0, 0, 0, 0.8)",
		textShadowOffset: { width: 1, height: 1 },
		textShadowRadius: 2,
	},
	expText: {
		color: "#ffffff",
		fontFamily: "BreatheFireIII",
		fontSize: 12,
	},
});
