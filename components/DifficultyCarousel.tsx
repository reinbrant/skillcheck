import { useRef, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	Dimensions,
	Animated,
	Pressable,
} from "react-native";
import Svg, {
	Polygon,
	Defs,
	LinearGradient as SvgGradient,
	Stop,
} from "react-native-svg";
import { MenuButton } from "./MenuButton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface DifficultyItem {
	id: string;
	level: string;
	title: string;
	difficultyValue: "basic" | "beginner" | "intermediate" | "advanced"; 
}

const difficulties: DifficultyItem[] = [
	// 2. Update the difficultyValue strings to match our new schema
	{ id: "1", level: "1", title: "Basics", difficultyValue: "basic" },
	{ id: "2", level: "2", title: "Beginner", difficultyValue: "beginner" },
	{ id: "3", level: "3", title: "Intermediate", difficultyValue: "intermediate" },
	{ id: "4", level: "4", title: "Advanced", difficultyValue: "advanced" },
];
// Added the prop interface to bridge the gap with PathDifficultyScreen
interface DifficultyCarouselProps {
	onSelectDifficulty: (difficulty: "basic" | "beginner" | "intermediate" | "advanced") => void;
}

const DifficultyShape = ({
	item,
	onPress,
}: {
	item: DifficultyItem;
	onPress: () => void;
}) => {
	const [isHovered, setIsHovered] = useState(false);

	const getPolygonPoints = (level: string) => {
		switch (level) {
			case "1": return "110,35 195,175 25,175";
			case "2": return "110,20 200,110 110,200 20,110";
			case "3": return "110,25 200,90 165,190 55,190 20,90";
			case "4": return "110,20 190,65 190,155 110,200 30,155 30,65";
			default: return "110,20 200,110 110,200 20,110";
		}
	};

	const getTextOffset = (level: string) => {
		if (level === "1") return { marginTop: 35 };
		if (level === "3") return { marginTop: 15 };
		return { marginTop: 0 };
	};

	return (
		<Pressable
			onHoverIn={() => setIsHovered(true)}
			onHoverOut={() => setIsHovered(false)}
			onPress={onPress}
			style={({ pressed }) => [
				styles.svgWrapper,
				(pressed || isHovered) && { transform: [{ scale: 1.05 }] },
			]}
		>
			<Svg height="220" width="220" viewBox="0 0 220 220">
				<Defs>
					<SvgGradient id="shapeGrad" x1="0" y1="0" x2="0" y2="1">
						<Stop offset="0" stopColor="#e8c3f0" stopOpacity="1" />
						<Stop offset="1" stopColor="#b183c7" stopOpacity="1" />
					</SvgGradient>

					<SvgGradient id="borderGrad" x1="0" y1="0" x2="0" y2="1">
						<Stop offset="0" stopColor="#ffffff" stopOpacity="1" />
						<Stop offset="0.5" stopColor="#e8c3f0" stopOpacity="1" />
						<Stop offset="1" stopColor="#9b62b3" stopOpacity="1" />
					</SvgGradient>
				</Defs>

				<Polygon
					points={getPolygonPoints(item.level)}
					fill="rgba(15, 10, 25, 0.4)"
					stroke="rgba(216, 180, 226, 0.3)"
					strokeWidth="10"
					strokeLinejoin="round"
					transform="translate(0, 4)"
				/>

				<Polygon
					points={getPolygonPoints(item.level)}
					fill="url(#shapeGrad)"
					stroke="url(#borderGrad)"
					strokeWidth="6"
					strokeLinejoin="round"
				/>
			</Svg>

			<View style={[styles.numberOverlay, getTextOffset(item.level)]}>
				<Text style={styles.levelNumber}>{item.level}</Text>
			</View>
		</Pressable>
	);
};

export const DifficultyCarousel: React.FC<DifficultyCarouselProps> = ({ onSelectDifficulty }) => {
	const scrollX = useRef(new Animated.Value(0)).current;

	const renderItem = ({ item }: { item: DifficultyItem }) => {
		return (
			<View style={styles.carouselItem}>
				<View style={styles.shapeContainer}>
					<DifficultyShape
						item={item}
						// Passes the mapped schema value ("easy", "medium", "hard")
						onPress={() => onSelectDifficulty(item.difficultyValue)}
					/>
				</View>

				<View style={styles.buttonWrapper}>
					<MenuButton
						title={item.title.toUpperCase()}
						// Passes the mapped schema value ("easy", "medium", "hard")
						onPress={() => onSelectDifficulty(item.difficultyValue)}
						isThin
					/>
				</View>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<Animated.FlatList
				data={difficulties}
				keyExtractor={(item) => item.id}
				renderItem={renderItem}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				snapToInterval={SCREEN_WIDTH}
				decelerationRate="fast"
				bounces={false}
				onScroll={Animated.event(
					[{ nativeEvent: { contentOffset: { x: scrollX } } }],
					{ useNativeDriver: false },
				)}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	carouselItem: {
		width: SCREEN_WIDTH,
		alignItems: "center",
		justifyContent: "center",
		paddingBottom: 40,
	},
	shapeContainer: {
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 40,
		width: 220,
		height: 220,
	},
	svgWrapper: {
		width: 220,
		height: 220,
		alignItems: "center",
		justifyContent: "center",
	},
	numberOverlay: {
		...StyleSheet.absoluteFillObject,
		alignItems: "center",
		justifyContent: "center",
	},
	levelNumber: {
		color: "#1b1226",
		fontFamily: "BreatheFireIII",
		fontSize: 85,
		textShadowColor: "rgba(255,255,255,0.4)",
		textShadowOffset: { width: 1, height: 1 },
		textShadowRadius: 2,
	},
	buttonWrapper: {
		width: "75%",
	},
});