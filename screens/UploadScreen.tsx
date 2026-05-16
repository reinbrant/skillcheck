import { useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { MenuButton } from "../components/MenuButton";
import { quizService } from "../services/quizService";
import { supabase } from "../services/supabase";

interface UploadScreenProps {
	onBack: () => void;
	onSuccess: () => void;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({ onBack, onSuccess, }) => {
	const [isBackHovered, setIsBackHovered] = useState(false);
	const [fileUri, setFileUri] = useState<string | null>(null);
	const [fileName, setFileName] = useState<string | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);

	const handlePickDocument = async () => {
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: [
					"application/pdf",
					"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
					"text/plain",
				],
				copyToCacheDirectory: true,
			});

			if (result.canceled === false) {
				setFileUri(result.assets[0].uri);
				setFileName(result.assets[0].name);
			}
		} catch (error) {
			Alert.alert("Error", "Failed to pick document.");
		}
	};

	const handleGenerateQuiz = async () => {
		if (!fileUri || !fileName) return;

		setIsGenerating(true);
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) throw new Error("Not authenticated");

			const shareableLink = await quizService.uploadAndProcessDocument(fileUri, fileName, user.id);
			
			Alert.alert("Success!", "Quiz Generated!\n\nLink: " + shareableLink, [
                { text: "OK", onPress: onBack }
            ]);
		} catch (error: any) {
			Alert.alert("Generation Failed", error.message);
		} finally {
			setIsGenerating(false);
		}
	};

	return (
        // Removed SafeAreaView here since App.tsx already handles it
		<View style={styles.container}>
			<View style={styles.header}>
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
				<Text style={styles.headerTitle}> NEW PATH</Text>
			</View>

			<View style={styles.content}>
				<Text style={styles.instructionText}>
					Upload a programming document (PDF, DOCX, TXT) to generate your custom path.
				</Text>

				<View style={styles.uploadBox}>
					{fileName ? (
						<Text style={styles.fileNameText}>{fileName}</Text>
					) : (
						<Text style={styles.placeholderText}>No file selected</Text>
					)}
				</View>

				{isGenerating ? (
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="large" color="#d8b4e2" />
						<Text style={styles.loadingText}>Synthesizing Knowledge...</Text>
					</View>
				) : (
					<View style={styles.actionButtons}>
                        <View style={{ marginBottom: 20 }}>
						    <MenuButton title="SELECT FILE" onPress={handlePickDocument} />
                        </View>
						{fileUri && (
							<MenuButton title="GENERATE QUIZ" onPress={handleGenerateQuiz} />
						)}
					</View>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: "100%",
        backgroundColor: "transparent",
	},
	header: {
		width: "100%",
		paddingHorizontal: 25,
		paddingTop: 20,
		paddingBottom: 30,
		flexDirection: "row",
		alignItems: "center",
	},
	backButton: {
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
	headerTitle: {
		color: "#ffffff",
		fontFamily: "BreatheFireIII",
		fontSize: 32,
	},
	content: {
		flex: 1,
		paddingHorizontal: 30,
		alignItems: "center",
		marginTop: 40,
	},
    instructionText: {
        color: "#CED0D3",
		fontFamily: "BreatheFireIII",
		fontSize: 18,
        textAlign: "center",
        marginBottom: 40,
    },
	uploadBox: {
		width: "100%",
		height: 120,
		borderWidth: 2,
		borderColor: "#5d3c80",
		backgroundColor: "rgba(27, 18, 38, 0.8)",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 40,
        borderStyle: "dashed",
	},
	placeholderText: {
		color: "#5d3c80",
		fontFamily: "BreatheFireIII",
		fontSize: 20,
	},
	fileNameText: {
		color: "#d8b4e2",
		fontFamily: "BreatheFireIII",
		fontSize: 18,
		textAlign: "center",
		padding: 10,
	},
	actionButtons: {
		width: "80%",
        // Removed "gap: 20" here to prevent silent layout crashes
	},
    loadingContainer: {
        alignItems: "center",
        marginTop: 20,
    },
    loadingText: {
        color: "#d8b4e2",
		fontFamily: "BreatheFireIII",
		fontSize: 18,
        marginTop: 15,
    }
});