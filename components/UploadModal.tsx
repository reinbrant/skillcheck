import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	Modal,
	Image,
	Pressable,
	TouchableOpacity,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";

interface UploadModalProps {
	visible: boolean;
	onClose: () => void;
	onUpload: (file: DocumentPicker.DocumentPickerAsset | null) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
	visible,
	onClose,
	onUpload,
}) => {
	const [isDropzoneHovered, setIsDropzoneHovered] = useState(false);
	const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

	const handleFilePick = async () => {
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: [
					"application/pdf", 
					"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
					"text/plain"
				],
				copyToCacheDirectory: true,
			});

			if (!result.canceled && result.assets && result.assets.length > 0) {
				setSelectedFile(result.assets[0]);
			}
		} catch (err) {
			console.log("Error picking document:", err);
		}
	};

	const handleCancel = () => {
		setSelectedFile(null);
		onClose();
	};

	const handleUploadConfirm = () => {
		onUpload(selectedFile);
		setSelectedFile(null);
	};

	const ActionButton = ({ 
		title, 
		onPress, 
		tintStyle 
	}: { 
		title: string; 
		onPress: () => void; 
		tintStyle: object 
	}) => {
		const [isHovered, setIsHovered] = useState(false);

		return (
			<Pressable
				onPress={onPress}
				onHoverIn={() => setIsHovered(true)}
				onHoverOut={() => setIsHovered(false)}
				style={({ pressed }) => [
					styles.actionButtonContainer,
					(pressed || isHovered) && { transform: [{ scale: 0.96 }] }
				]}
			>
				<View style={[styles.actionButtonInner, isHovered && styles.actionButtonHovered]}>
					<Image
						source={require("../assets/Button_Texture1.jpg")}
						style={StyleSheet.absoluteFillObject}
						resizeMode="cover"
					/>
					<View style={[styles.purpleTintOverlay, tintStyle]} />
					<View style={styles.buttonBorderGlow} />
					<Text style={styles.actionButtonText}>{title}</Text>
				</View>
			</Pressable>
		);
	};

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={handleCancel}
		>
			<Pressable style={styles.overlay} onPress={handleCancel}>
				<Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
					
					<View style={styles.cardBackgroundWrapper}>
						<Image
							source={require("../assets/Button_Texture1.jpg")}
							style={StyleSheet.absoluteFillObject}
							resizeMode="cover"
						/>
						<View style={styles.modalTintOverlay} />
					</View>

					{/* Back Button */}
					<TouchableOpacity style={styles.backButton} onPress={handleCancel}>
						<Text style={styles.backArrowText}>←</Text>
					</TouchableOpacity>

					<Text style={styles.titleText}>Upload File</Text>

					{/* Upload Frame */}
					<Pressable
						onPress={handleFilePick}
						onHoverIn={() => setIsDropzoneHovered(true)}
						onHoverOut={() => setIsDropzoneHovered(false)}
						style={({ pressed }) => [
							styles.dashedDropzone,
							(pressed || isDropzoneHovered) && styles.dashedDropzoneActive
						]}
					>
						<Image 
							source={require("../assets/UploadIcon.png")} 
							style={styles.uploadIcon}
							resizeMode="contain"
						/>
						
						{selectedFile ? (
							<Text style={styles.selectedFileText} numberOfLines={1}>
								{selectedFile.name}
							</Text>
						) : (
							<>
								<Text style={styles.dropzoneMainText}>Tap and Upload a File Here</Text>
								<Text style={styles.dropzoneSubText}>Supported Format: .pdf, .docx, .txt</Text>
							</>
						)}
					</Pressable>

					{/* Action Buttons Row */}
					<View style={styles.buttonsRow}>
						<ActionButton 
							title="Cancel" 
							onPress={handleCancel} 
							tintStyle={styles.cancelTint} 
						/>
						<ActionButton 
							title="Upload" 
							onPress={handleUploadConfirm} 
							tintStyle={styles.uploadTint} 
						/>
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
		maxWidth: 400,
		backgroundColor: "#1b1226",
		borderWidth: 1.5,
		borderColor: "#d8b4e2",
		borderRadius: 8,
		padding: 25,
		paddingTop: 20,
		shadowColor: "#d8b4e2",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.5,
		shadowRadius: 15,
		elevation: 10,
	},
	cardBackgroundWrapper: {
		...StyleSheet.absoluteFillObject,
		borderRadius: 8,
		overflow: "hidden",
		zIndex: -1,
	},
	modalTintOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(25, 15, 45, 0.95)",
	},
	
	// Back Button
	backButton: {
		alignSelf: "flex-start",
		marginBottom: 15,
	},
	backArrowText: {
		color: "#ffffff",
		fontSize: 26,
		fontWeight: "bold",
	},

	// Title
	titleText: {
		color: "#ffffff",
        fontFamily: "BreatheFireIII",
		fontSize: 32,
		fontWeight: "bold",
		marginBottom: 20,
	},

	// Upload zone
	dashedDropzone: {
		width: "100%",
		borderWidth: 1.5,
		borderColor: "rgba(216, 180, 226, 0.3)",
		borderStyle: "dashed",
		borderRadius: 8,
		backgroundColor: "rgba(0, 0, 0, 0.2)",
		paddingVertical: 40,
		paddingHorizontal: 20,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 25,
	},
	dashedDropzoneActive: {
		borderColor: "rgba(216, 180, 226, 0.8)",
		backgroundColor: "rgba(216, 180, 226, 0.1)",
	},
	uploadIcon: {
		width: 70,
		height: 70,
		marginBottom: 15,
		opacity: 0.9,
	},
	dropzoneMainText: {
		color: "#ffffff",
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 10,
		textAlign: "center",
	},
	dropzoneSubText: {
		color: "#a09ba8",
		fontSize: 12,
		textAlign: "center",
	},
	selectedFileText: {
		color: "#d8b4e2",
		fontSize: 16,
		fontWeight: "600",
		textAlign: "center",
		marginTop: 10,
	},

	// Buttons
	buttonsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
	},
	actionButtonContainer: {
		width: "47%",
		height: 50,
	},
	actionButtonInner: {
		flex: 1,
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.4)",
		overflow: "hidden",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 4,
	},
	actionButtonHovered: {
		borderColor: "#ffffff",
	},
	purpleTintOverlay: {
		...StyleSheet.absoluteFillObject,
	},
	cancelTint: {
		backgroundColor: "rgba(100, 20, 20, 0.85)",
	},
	uploadTint: {
		backgroundColor: "rgba(20, 70, 80, 0.85)",
	},
	buttonBorderGlow: {
		...StyleSheet.absoluteFillObject,
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.1)",
	},
	actionButtonText: {
		color: "#ffffff",
		fontFamily: "BreatheFireIII",
		fontSize: 22,
		textShadowColor: "rgba(0, 0, 0, 0.8)",
		textShadowOffset: { width: 1, height: 1 },
		textShadowRadius: 3,
		marginTop: 4,
	},
});