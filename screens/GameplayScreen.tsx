import React, { useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	Pressable,
	TextInput,
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Platform,
	Animated,
	Easing,
	ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ResultModal } from "../components/ResultModal";
import { MenuButton } from "../components/MenuButton";
import { supabase } from "../services/supabase";

interface GameplayScreenProps {
	quizId: string;
	pathTitle: string;
	onBack: () => void;
	onGoToLeaderboard: () => void;
}

export const GameplayScreen: React.FC<GameplayScreenProps> = ({
	quizId,
	pathTitle,
	onBack,
	onGoToLeaderboard,
}) => {
	const [questions, setQuestions] = useState<any[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isLoading, setIsLoading] = useState(true);

	const [playerHP, setPlayerHP] = useState(100);
	const [enemyHP, setEnemyHP] = useState(100);
	const [timeLeft, setTimeLeft] = useState(120);

	const [fitbAnswer, setFitbAnswer] = useState("");
	const [isGameOver, setIsGameOver] = useState(false);
	const [showResult, setShowResult] = useState(false);
	const [isVictory, setIsVictory] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);

	// --- ANIMATION VALUES ---
	const idleAnim = useRef(new Animated.Value(0)).current;
	const shakeAnim = useRef(new Animated.Value(0)).current;
	const successFlashAnim = useRef(new Animated.Value(0)).current;

	const enemyFlashAnim = useRef(new Animated.Value(0)).current;
	const playerFlashAnim = useRef(new Animated.Value(0)).current;

	const enemyDmgAnim = useRef(new Animated.Value(0)).current;
	const playerDmgAnim = useRef(new Animated.Value(0)).current;

	const [enemyDmgNum, setEnemyDmgNum] = useState<number | null>(null);
	const [playerDmgNum, setPlayerDmgNum] = useState<number | null>(null);

	// Start Idle Animation
	useEffect(() => {
		Animated.loop(
			Animated.sequence([
				Animated.timing(idleAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
				Animated.timing(idleAnim, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
			])
		).start();
	}, []);

	useEffect(() => {
		const fetchQuiz = async () => {
			setIsLoading(true);
			const { data, error } = await supabase
				.from("quizzes")
				.select("quiz_json")
				.eq("id", quizId)
				.single();

			if (error || !data) {
				Alert.alert("Error", "Could not load the battle.");
				onBack();
				return;
			}

			const parsed = typeof data.quiz_json === "string" ? JSON.parse(data.quiz_json) : data.quiz_json;
			let qList = parsed.questions || [];

			const diffValues: Record<string, number> = { basic: 1, beginner: 2, intermediate: 3, advanced: 4 };
			qList.sort((a: any, b: any) => (diffValues[a.difficulty] || 0) - (diffValues[b.difficulty] || 0));

			setQuestions(qList);
			setIsLoading(false);
		};
		fetchQuiz();
	}, [quizId]);

	useEffect(() => {
		if (isLoading || isGameOver) return;
		const timer = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					handleEndGame("time_out", playerHP, enemyHP);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
		return () => clearInterval(timer);
	}, [isLoading, isGameOver, playerHP, enemyHP]);

	const triggerCorrectEffects = (dmg: number) => {
		setEnemyDmgNum(dmg);
		enemyDmgAnim.setValue(0);
		Animated.parallel([
			Animated.sequence([
				Animated.timing(successFlashAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
				Animated.timing(successFlashAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
			]),
			Animated.sequence([
				Animated.timing(enemyFlashAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
				Animated.timing(enemyFlashAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
				Animated.timing(enemyFlashAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
				Animated.timing(enemyFlashAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
			]),
			Animated.timing(enemyDmgAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
		]).start(() => setEnemyDmgNum(null));
	};

	const triggerWrongEffects = (dmg: number) => {
		setPlayerDmgNum(dmg);
		playerDmgAnim.setValue(0);
		Animated.parallel([
			Animated.sequence([
				Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
				Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
				Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
				Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
				Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
			]),
			Animated.sequence([
				Animated.timing(playerFlashAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
				Animated.timing(playerFlashAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
				Animated.timing(playerFlashAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
				Animated.timing(playerFlashAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
			]),
			Animated.timing(playerDmgAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
		]).start(() => setPlayerDmgNum(null));
	};

	const handleAnswer = (answer: string | number) => {
		if (isGameOver || isAnimating) return;
		setIsAnimating(true);

		const q = questions[currentIndex];
		let isCorrect = false;

		if (q.type === "multiple-choice") {
			isCorrect = answer === q.correctIndex;
		} else {
			isCorrect = String(answer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
		}

		// Scaling check: With 20 questions, 100/20 = 5. Ceil handles odd numbers securely.
		const dmgAmount = Math.ceil(100 / questions.length);
		let newEnemyHP = enemyHP;
		let newPlayerHP = playerHP;

		if (isCorrect) {
			newEnemyHP = Math.max(0, enemyHP - dmgAmount);
			setEnemyHP(newEnemyHP);
			triggerCorrectEffects(dmgAmount);
		} else {
			newPlayerHP = Math.max(0, playerHP - dmgAmount);
			setPlayerHP(newPlayerHP);
			triggerWrongEffects(dmgAmount);
		}

		setTimeout(() => {
			if (newEnemyHP <= 0) {
				handleEndGame("victory", newPlayerHP, 0);
			} else if (newPlayerHP <= 0) {
				handleEndGame("defeat", 0, newEnemyHP);
			} else if (currentIndex + 1 < questions.length) {
				setCurrentIndex(currentIndex + 1);
				setFitbAnswer("");
			} else {
				handleEndGame("out_of_questions", newPlayerHP, newEnemyHP);
			}
			setIsAnimating(false);
		}, 1200);
	};

	const handleEndGame = (reason: string, finalPlayerHP: number, finalEnemyHP: number) => {
		setIsGameOver(true);
		let win = false;
		if (reason === "victory" || finalEnemyHP <= 0) win = true;
		else if (reason === "defeat" || finalPlayerHP <= 0) win = false;
		else win = finalPlayerHP > finalEnemyHP;

		setIsVictory(win);
		setShowResult(true);
	};

	const formatTime = (seconds: number) => {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m}:${s < 10 ? "0" : ""}${s}`;
	};

	if (isLoading) {
		return (
			<SafeAreaView style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#d8b4e2" />
				<Text style={styles.loadingText}>A wild challenge approaches...</Text>
			</SafeAreaView>
		);
	}

	const q = questions[currentIndex];

	const enemyIdleY = idleAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 8] });
	const playerIdleY = idleAnim.interpolate({ inputRange: [0, 1], outputRange: [8, -8] });

	const dmgRiseY = (anim: Animated.Value) => anim.interpolate({ inputRange: [0, 1], outputRange: [0, -50] });
	const dmgFade = (anim: Animated.Value) => anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: "#1b1226" }} edges={['top', 'bottom']}>
			<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
				<Animated.View style={[styles.mainContainer, { transform: [{ translateX: shakeAnim }] }]}>
					
					<Animated.View style={[styles.greenFlashOverlay, { opacity: successFlashAnim }]} pointerEvents="none" />

					{/* Top HUD */}
					<View style={styles.header}>
						<Pressable onPress={onBack} disabled={isAnimating} style={{ padding: 10 }}>
							<Text style={styles.backArrow}>←</Text>
						</Pressable>
						<Text style={styles.pathTitleText} numberOfLines={1} adjustsFontSizeToFit>BATTLE</Text>
						<Text style={[styles.timerText, timeLeft <= 30 && { color: "#ff4444" }]}>
							{formatTime(timeLeft)}
						</Text>
					</View>

					{/* BATTLE ARENA (Flex 1 to take remaining space) */}
					<View style={styles.arena}>
						
						{/* Enemy Side */}
						<View style={styles.enemySide}>
							<View style={styles.hpBox}>
								<Text style={styles.combatantName} numberOfLines={1} adjustsFontSizeToFit>
									{pathTitle}
								</Text>
								<View style={styles.hpBarBg}>
									<View style={[styles.hpBarFill, { width: `${enemyHP}%`, backgroundColor: "#ff4444" }]} />
									<Text style={styles.hpNumberText}>{enemyHP}/100</Text>
									<Animated.View style={[styles.flashOverlay, { opacity: enemyFlashAnim }]} />
								</View>
							</View>

							<Animated.View style={[styles.orbWrapper, { transform: [{ translateY: enemyIdleY }] }]}>
								<View style={[styles.enemyOrb]}>
									<View style={styles.enemyOrbCore} />
									<Animated.View style={[styles.flashOverlay, { borderRadius: 45, opacity: enemyFlashAnim }]} />
								</View>
								{enemyDmgNum && (
									<Animated.Text style={[styles.damageNumberText, { opacity: dmgFade(enemyDmgAnim), transform: [{ translateY: dmgRiseY(enemyDmgAnim) }] }]}>
										-{enemyDmgNum}
									</Animated.Text>
								)}
							</Animated.View>
						</View>

						{/* Player Side */}
						<View style={styles.playerSide}>
							<Animated.View style={[styles.orbWrapper, { transform: [{ translateY: playerIdleY }] }]}>
								<View style={[styles.playerOrb]}>
									<View style={styles.playerOrbCore} />
									<Animated.View style={[styles.flashOverlay, { borderRadius: 45, opacity: playerFlashAnim }]} />
								</View>
								{playerDmgNum && (
									<Animated.Text style={[styles.damageNumberText, { color: "#ff4444", opacity: dmgFade(playerDmgAnim), transform: [{ translateY: dmgRiseY(playerDmgAnim) }] }]}>
										-{playerDmgNum}
									</Animated.Text>
								)}
							</Animated.View>

							<View style={styles.hpBox}>
								<Text style={styles.combatantName}>You</Text>
								<View style={styles.hpBarBg}>
									<View style={[styles.hpBarFill, { 
										width: `${playerHP}%`, 
										backgroundColor: playerHP > 50 ? "#44ff44" : playerHP > 20 ? "#ffaa00" : "#ff4444" 
									}]} />
									<Text style={styles.hpNumberText}>{playerHP}/100</Text>
									<Animated.View style={[styles.flashOverlay, { opacity: playerFlashAnim }]} />
								</View>
							</View>
						</View>
					</View>

					{/* QUESTION PANEL (Max Height to prevent off-screen pushes) */}
					<View style={styles.questionPanel}>
						<Text style={styles.questionCounter}>
							Question {currentIndex + 1} of {questions.length} • {q.difficulty.toUpperCase()}
						</Text>
						
						{/* ScrollView protects against long text overflows */}
						<ScrollView 
							contentContainerStyle={styles.scrollContent}
							showsVerticalScrollIndicator={false}
							bounces={false}
						>
							<Text style={styles.questionText}>{q.question}</Text>

							{q.type === "multiple-choice" ? (
								<View style={styles.choicesContainer}>
									{q.choices.map((choice: string, idx: number) => (
										<Pressable 
											key={idx} 
											style={[styles.choiceButton, isAnimating && styles.disabledButton]} 
											onPress={() => handleAnswer(idx)}
											disabled={isAnimating}
										>
											<View style={styles.buttonDarkOverlay} />
											<View style={styles.buttonInnerGlow} />
											<Text style={styles.choiceText}>{choice}</Text>
										</Pressable>
									))}
								</View>
							) : (
								<View style={styles.fitbContainer}>
									<TextInput
										style={[styles.textInput, isAnimating && { opacity: 0.5 }]}
										placeholder="Type your answer here..."
										placeholderTextColor="rgba(255,255,255,0.3)"
										value={fitbAnswer}
										onChangeText={setFitbAnswer}
										onSubmitEditing={() => handleAnswer(fitbAnswer)}
										autoCapitalize="none"
										editable={!isAnimating}
									/>
									<View style={{ width: "100%", marginTop: 15 }}>
										<MenuButton 
											title={isAnimating ? "ATTACKING..." : "ATTACK"} 
											onPress={() => handleAnswer(fitbAnswer)} 
											isThin 
										/>
									</View>
								</View>
							)}
						</ScrollView>
					</View>

					<ResultModal
						visible={showResult}
						isVictory={isVictory}
						score={playerHP}
						timeLeft={formatTime(timeLeft)}
						onSelectLevel={onBack}
						onNextOrRetry={() => {
							if (isVictory) {
								onGoToLeaderboard();
							} else {
								setPlayerHP(100);
								setEnemyHP(100);
								setTimeLeft(120);
								setCurrentIndex(0);
								setIsGameOver(false);
								setShowResult(false);
								setIsAnimating(false);
							}
						}}
					/>
				</Animated.View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	mainContainer: { flex: 1 },
	loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
	loadingText: { color: "#d8b4e2", fontFamily: "BreatheFireIII", fontSize: 24, marginTop: 20 },
	greenFlashOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(68, 255, 68, 0.2)", zIndex: 1 },
	flashOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(255, 255, 255, 0.8)", zIndex: 5 },

	header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 15, paddingTop: 10, zIndex: 10 },
	backArrow: { color: "#ffffff", fontSize: 28, fontWeight: "bold", textShadowColor: "#d8b4e2", textShadowRadius: 8 },
	pathTitleText: { flex: 1, textAlign: "center", color: "#ffffff", fontFamily: "BreatheFireIII", fontSize: 24, textShadowColor: "#000", textShadowRadius: 5 },
	timerText: { color: "#ffffff", fontFamily: "BreatheFireIII", fontSize: 28, textShadowColor: "#000", textShadowRadius: 5 },

	arena: { flex: 1, justifyContent: "space-evenly", paddingHorizontal: 20, zIndex: 2 },
	enemySide: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", width: "100%" },
	playerSide: { flexDirection: "row", justifyContent: "flex-start", alignItems: "center", width: "100%" },
	
	hpBox: { flexShrink: 1, backgroundColor: "rgba(20, 10, 30, 0.8)", padding: 10, borderWidth: 1, borderColor: "rgba(216, 180, 226, 0.5)", borderRadius: 8, maxWidth: 200, width: "100%" },
	combatantName: { color: "#ffffff", fontFamily: "BreatheFireIII", fontSize: 18, marginBottom: 5 },
	hpBarBg: { width: "100%", height: 16, backgroundColor: "#000", borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: "#333", justifyContent: "center", alignItems: "center" },
	hpBarFill: { position: "absolute", left: 0, top: 0, height: "100%", borderRadius: 6 },
	hpNumberText: { color: "#ffffff", fontSize: 10, fontWeight: "bold", zIndex: 2, textShadowColor: "#000", textShadowRadius: 2 },
	
	orbWrapper: { position: "relative", justifyContent: "center", alignItems: "center", marginHorizontal: 15 },
	enemyOrb: { width: 90, height: 90, borderRadius: 45, backgroundColor: "rgba(255, 68, 68, 0.2)", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#ff4444", shadowColor: "#ff4444", shadowOpacity: 1, shadowRadius: 20, elevation: 10, overflow: "hidden" },
	enemyOrbCore: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#ff4444" },
	playerOrb: { width: 90, height: 90, borderRadius: 45, backgroundColor: "rgba(107, 40, 145, 0.3)", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#d8b4e2", shadowColor: "#d8b4e2", shadowOpacity: 1, shadowRadius: 20, elevation: 10, overflow: "hidden" },
	playerOrbCore: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#d8b4e2" },
	damageNumberText: { position: "absolute", top: -20, color: "#ffffff", fontFamily: "BreatheFireIII", fontSize: 36, textShadowColor: "#000", textShadowRadius: 5, zIndex: 20 },

	// Restricted max height ensures the choices stay on screen
	questionPanel: { maxHeight: "55%", backgroundColor: "#1b1226", borderTopWidth: 2, borderColor: "#d8b4e2", paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10, borderTopLeftRadius: 20, borderTopRightRadius: 20, zIndex: 10 },
	questionCounter: { color: "#d8b4e2", fontSize: 14, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
	
	scrollContent: { paddingBottom: 20 },
	questionText: { color: "#ffffff", fontSize: 20, fontFamily: "BreatheFireIII", textAlign: "center", lineHeight: 28, marginBottom: 15 },
	
	choicesContainer: { gap: 10 },
	choiceButton: { width: "100%", minHeight: 55, paddingVertical: 10, paddingHorizontal: 15, borderRadius: 4, overflow: "hidden", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.4)" },
	disabledButton: { opacity: 0.7 },
	buttonDarkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(20, 10, 30, 0.95)" },
	buttonInnerGlow: { ...StyleSheet.absoluteFillObject, borderWidth: 1, borderColor: "rgba(216, 180, 226, 0.2)" },
	choiceText: { color: "#ffffff", fontFamily: "BreatheFireIII", fontSize: 18, zIndex: 2, textAlign: "center" },
	
	fitbContainer: { width: "100%", alignItems: "center" },
	textInput: { width: "100%", backgroundColor: "rgba(0,0,0,0.5)", color: "#ffffff", fontFamily: "BreatheFireIII", fontSize: 20, padding: 15, borderWidth: 1, borderColor: "#d8b4e2", borderRadius: 4, textAlign: "center" },
});