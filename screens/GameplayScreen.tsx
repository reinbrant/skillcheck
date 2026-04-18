import { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	Pressable,
	Image,
	ActivityIndicator,
	Alert,
	TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ResultModal } from "../components/ResultModal";
import { supabase } from "../services/supabase";
import { quizService } from "../services/quizService";
import { MenuButton } from "../components/MenuButton"; // <-- Imported for the Submit button

interface GameplayScreenProps {
	quizId: string;
	pathTitle: string;
	difficulty: "basic" | "beginner" | "intermediate" | "advanced";
	onBack: () => void;
	onSelectLevel: () => void;
	onGoToLeaderboard: () => void;
}

export const GameplayScreen: React.FC<GameplayScreenProps> = ({
	quizId,
	pathTitle,
	difficulty,
	onBack,
	onSelectLevel,
	onGoToLeaderboard,
}) => {
	const [isBackHovered, setIsBackHovered] = useState(false);
	
	// Game State
	const [questions, setQuestions] = useState<any[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [score, setScore] = useState(0);
	const [timeLeft, setTimeLeft] = useState(60); 
	const [gameState, setGameState] = useState<"loading" | "playing" | "victory" | "defeat">("loading");

	// Feedback States
	const [feedbackState, setFeedbackState] = useState<"idle" | "correct" | "wrong">("idle");
	const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
	
	// Fill-in-the-blank State
	const [textInput, setTextInput] = useState("");

	useEffect(() => {
		const loadQuiz = async () => {
			try {
				const data = await quizService.fetchQuiz(quizId);
				const filtered = data.quiz_json.questions.filter((q: any) => q.difficulty === difficulty);
				setQuestions(filtered);
				setGameState("playing");
			} catch (error) {
				console.error("Failed to load quiz", error);
				setGameState("playing");
			}
		};
		loadQuiz();
	}, [quizId, difficulty]);

	useEffect(() => {
		if (gameState !== "playing") return;

		const timer = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					handleGameOver(false);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [gameState]);

	// Accepts either a choice index or a string answer
	const handleAnswer = (answer: number | string) => {
		if (feedbackState !== "idle") return; // Prevent double clicks

		const currentQuestion = questions[currentIndex];
		let isCorrect = false;

		if (currentQuestion.type === "fill-in-the-blank") {
			// Case-insensitive comparison and trim whitespace
			const userAnswer = (answer as string).trim().toLowerCase();
			const correctAnswer = currentQuestion.correctAnswer.trim().toLowerCase();
			isCorrect = userAnswer === correctAnswer;
		} else {
			isCorrect = answer === currentQuestion.correctIndex;
			setSelectedChoiceIndex(answer as number);
		}
		
		if (isCorrect) {
			setFeedbackState("correct");
			
			// Dynamic Scoring: Base score based on 4-tier difficulty + Time Bonus
			let baseScore = 10;
			if (difficulty === "advanced") baseScore = 40;
			else if (difficulty === "intermediate") baseScore = 30;
			else if (difficulty === "beginner") baseScore = 20;

			const timeBonus = Math.max(0, timeLeft);
			setScore((prev) => prev + baseScore + timeBonus);
		} else {
			setFeedbackState("wrong");
		}

		// Wait 1.5s to show feedback before moving to next question
		setTimeout(() => {
			setFeedbackState("idle");
			setSelectedChoiceIndex(null);
			setTextInput(""); // Clear text input for the next question

			if (currentIndex + 1 < questions.length) {
				setCurrentIndex((prev) => prev + 1);
			} else {
				handleGameOver(true);
			}
		}, 1500); // Slightly longer timeout to read the correct answer if wrong
	};

	const handleTextSubmit = () => {
		if (!textInput.trim()) return;
		handleAnswer(textInput);
	};

	const handleGameOver = async (victory: boolean) => {
		setGameState(victory ? "victory" : "defeat");
		
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (user) {
				await quizService.submitAttempt(quizId, user.id, score, difficulty);
			}
		} catch (error: any) {
			console.log("Failed to save score", error);
			Alert.alert("Save Error", error.message);
		}
	};

	const formatTime = (seconds: number) => {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m}:${s < 10 ? "0" : ""}${s}`;
	};

	if (gameState === "loading") {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#d8b4e2" />
			</View>
		);
	}

	const currentQuestion = questions[currentIndex];

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.container}>
				{/* Header */}
				<View style={styles.header}>
					<Pressable onPress={onBack} style={({ pressed }) => [styles.backButton, (pressed || isBackHovered) && styles.backButtonHovered]}>
						<Text style={styles.backArrow}>←</Text>
					</Pressable>
					<Text style={styles.headerTitle}> {pathTitle.toUpperCase()}</Text>
				</View>

				{/* Top Info Bar */}
				<View style={styles.topInfoBar}>
					<View>
						<Text style={styles.infoText}>
							Question {currentIndex + 1} of {questions.length}
						</Text>
						<Text style={styles.infoTextSub}>
							{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
						</Text>
					</View>
					
					{/* Score Tracker */}
					<View style={{ alignItems: "flex-end" }}>
						<Text style={styles.timerText}>SCORE: {score}</Text>
						<Text style={[styles.timerText, timeLeft <= 10 && styles.timerDanger]}>
							⏳ {formatTime(timeLeft)}
						</Text>
					</View>
				</View>

				{/* Question Box */}
				<View style={styles.questionBox}>
					<Image source={require("../assets/Button_Texture1.jpg")} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
					<View style={styles.purpleTintOverlay} />
					<Text style={styles.questionText}>{currentQuestion?.question}</Text> 
				</View>

				{/* Choices or Text Input depending on type */}
				<View style={styles.choicesContainer}>
					{currentQuestion?.type === "fill-in-the-blank" ? (
						<View style={styles.fitbContainer}>
							<TextInput
								style={[
									styles.textInput,
									feedbackState === "correct" && styles.textInputCorrect,
									feedbackState === "wrong" && styles.textInputWrong
								]}
								value={textInput}
								onChangeText={setTextInput}
								placeholder="Type your answer here..."
								placeholderTextColor="#8a6b96"
								editable={feedbackState === "idle"}
								autoCapitalize="none"
								autoCorrect={false}
								onSubmitEditing={handleTextSubmit}
							/>
							
							{/* Show correction if they got it wrong */}
							{feedbackState === "wrong" && (
								<Text style={styles.correctionText}>
									Correct Answer: {currentQuestion.correctAnswer}
								</Text>
							)}

							<View style={{ marginTop: 20, width: "100%", alignItems: "center" }}>
								<MenuButton 
									title="SUBMIT" 
									onPress={handleTextSubmit} 
									isThin 
								/>
							</View>
						</View>
					) : (
						currentQuestion?.choices.map((choice: string, index: number) => {
							let status: "default" | "correct" | "wrong" | "dimmed" = "default";
							if (feedbackState !== "idle") {
								if (index === currentQuestion.correctIndex) {
									status = "correct";
								} else if (index === selectedChoiceIndex) {
									status = "wrong";
								} else {
									status = "dimmed";
								}
							}

							return (
								<ChoiceButton
									key={index}
									title={choice}
									status={status}
									onPress={() => handleAnswer(index)}
								/>
							);
						})
					)}
				</View>
			</View>

			<ResultModal
				visible={gameState === "victory" || gameState === "defeat"}
				isVictory={gameState === "victory"}
				score={score}
				timeLeft={formatTime(timeLeft)}
				onSelectLevel={onSelectLevel}
				onNextOrRetry={() => {
					if (gameState === "victory") {
						onGoToLeaderboard();
					} else {
						setCurrentIndex(0);
						setScore(0);
						setTimeLeft(60);
						setGameState("playing");
					}
				}}
			/>
		</SafeAreaView>
	);
};

const ChoiceButton = ({ 
	title, 
	onPress, 
	status 
}: { 
	title: string; 
	onPress: () => void;
	status: "default" | "correct" | "wrong" | "dimmed";
}) => {
	const [isHovered, setIsHovered] = useState(false);

	const getGlowColor = () => {
		if (status === "correct") return "rgba(76, 175, 80, 0.6)"; 
		if (status === "wrong") return "rgba(244, 67, 54, 0.6)"; 
		return "rgba(255, 255, 255, 0.2)"; 
	};

	const getBorderColor = () => {
		if (status === "correct") return "#4caf50";
		if (status === "wrong") return "#f44336";
		return "#d8b4e2";
	};

	return (
		<Pressable
			onPress={onPress}
			onHoverIn={() => setIsHovered(true)}
			onHoverOut={() => setIsHovered(false)}
			style={({ pressed }) => [
				styles.choiceButtonWrapper,
				(pressed || isHovered) && { transform: [{ scale: 0.98 }] },
				status === "dimmed" && { opacity: 0.5 }
			]}
		>
			<View style={[styles.choiceButtonInner, { borderColor: getBorderColor() }]}>
				<Image source={require("../assets/Button_Texture1.jpg")} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
				<View style={styles.buttonDarkOverlay} />
				<View style={[styles.buttonInnerGlow, { borderColor: getGlowColor() }]} />
				<Text style={[styles.choiceText, (status === "correct" || status === "wrong") && { color: getBorderColor() }]}>{title}</Text>
			</View>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: "transparent" },
	container: { flex: 1, width: "100%", alignItems: "center" },
	loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
	header: { width: "100%", paddingHorizontal: 25, paddingTop: 20, flexDirection: "row", alignItems: "center" },
	backButton: { paddingVertical: 10, paddingRight: 15 },
	backButtonHovered: { opacity: 0.6, transform: [{ scale: 0.9 }] },
	backArrow: { color: "#ffffff", fontSize: 28, fontWeight: "bold", textShadowColor: "#d8b4e2", textShadowRadius: 8 },
	headerTitle: { color: "#ffffff", fontFamily: "BreatheFireIII", fontSize: 36, textShadowColor: "rgba(216, 180, 226, 0.8)", textShadowRadius: 10 },
	topInfoBar: { width: "85%", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 20, marginBottom: 30, borderBottomWidth: 1, borderColor: "rgba(216, 180, 226, 0.5)", paddingBottom: 10 },
	infoText: { color: "#d8b4e2", fontFamily: "BreatheFireIII", fontSize: 16 },
	infoTextSub: { color: "#8a6b96", fontFamily: "BreatheFireIII", fontSize: 14 },
	timerText: { color: "#d8b4e2", fontFamily: "BreatheFireIII", fontSize: 18, textAlign: "right" },
	timerDanger: { color: "#ff4d4d" },
	questionBox: { width: "85%", minHeight: 180, backgroundColor: "#1b1226", borderWidth: 2, borderColor: "rgba(216, 180, 226, 0.6)", justifyContent: "center", alignItems: "center", padding: 20, marginBottom: 40, overflow: "hidden", shadowColor: "#d8b4e2", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 15, elevation: 10 },
	purpleTintOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(35, 20, 50, 0.85)" },
	questionText: { color: "#ffffff", fontSize: 22, fontFamily: "BreatheFireIII", textAlign: "center", lineHeight: 32, zIndex: 2 },
	choicesContainer: { width: "85%", gap: 15 },
	choiceButtonWrapper: { width: "100%", height: 55, shadowColor: "#d8b4e2", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
	choiceButtonInner: { flex: 1, borderWidth: 2, borderRadius: 4, overflow: "hidden", justifyContent: "center", alignItems: "center" },
	buttonDarkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(20, 10, 30, 0.95)" },
	buttonInnerGlow: { ...StyleSheet.absoluteFillObject, borderWidth: 1 },
	choiceText: { color: "#ffffff", fontFamily: "BreatheFireIII", fontSize: 20, zIndex: 2 },
	fitbContainer: { width: "100%", alignItems: "center" },
	textInput: { width: "100%", backgroundColor: "#1b1226", color: "#ffffff", fontFamily: "BreatheFireIII", fontSize: 20, padding: 15, borderWidth: 2, borderColor: "#d8b4e2", borderRadius: 4, textAlign: "center", shadowColor: "#d8b4e2", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
	textInputCorrect: { borderColor: "#4caf50", color: "#4caf50", shadowColor: "#4caf50" },
	textInputWrong: { borderColor: "#f44336", color: "#f44336", shadowColor: "#f44336" },
	correctionText: { color: "#f44336", fontFamily: "BreatheFireIII", fontSize: 18, marginTop: 15, textAlign: "center", textShadowColor: "rgba(244, 67, 54, 0.5)", textShadowRadius: 5 },
});