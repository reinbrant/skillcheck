import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	Modal,
	Pressable,
	TouchableOpacity,
} from "react-native";
import { InputField } from "./InputField";
import { MenuButton } from "./MenuButton";

interface ForgotPasswordModalProps {
	visible: boolean;
	onClose: () => void;
	onSubmit: (email: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
	visible,
	onClose,
	onSubmit,
}) => {
	const [email, setEmail] = useState("");

	const handleSubmitLink = () => {
		onSubmit(email); 
	};

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<Pressable style={styles.overlay} onPress={onClose}>
				<Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
					
					<View style={styles.topNavigationRow}>
						<TouchableOpacity style={styles.backButton} onPress={onClose}>
							<Text style={styles.backArrowText}>←</Text>
						</TouchableOpacity>
					</View>

					<Text style={styles.titleText}>FORGOT  PASSWORD</Text>

					<View style={styles.instructionContainer}>
						<Text style={styles.instructionText}>
							Please enter your registered e-mail address to receive a password reset link.
						</Text>
					</View>

					<InputField
						label="E-mail Address"
						value={email}
						onChangeText={setEmail}
						keyboardType="email-address"
						autoCapitalize="none"
					/>

					<View style={styles.submitButtonWrapper}>
						<MenuButton 
							title="SUBMIT" 
							onPress={handleSubmitLink} 
							isThin={true} 
							fontSize={24}
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
		backgroundColor: "rgba(0, 0, 0, 0.8)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalCard: {
		width: "90%",
		maxWidth: 400,
		backgroundColor: "#1b1226",
		borderWidth: 2,
		borderColor: "#d8b4e2",
		padding: 24,
		paddingTop: 10,
		shadowColor: "#d8b4e2",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.6,
		shadowRadius: 15,
		elevation: 10,
	},
	topNavigationRow: {
		width: "100%",
		flexDirection: "row",
		justifyContent: "flex-start",
		marginBottom: 10,
	},
	backButton: {
		padding: 5,
	},
	backArrowText: {
		color: "#ffffff",
		fontSize: 30,
		fontWeight: "normal",
	},
	titleText: {
		color: "#ffffff", 
		fontSize: 24, 
		fontFamily: "BreatheFireIII",
		textAlign: "justify",
		marginBottom: 20,
		paddingLeft: 15,
	},
	instructionContainer: {
		marginBottom: 24,
		paddingHorizontal: 10,
	},
	instructionText: {
		color: "#CED0D3",
		fontFamily: "BreatheFireIII",
		fontSize: 14,
		textAlign: "center",
		lineHeight: 20,
	},
	submitButtonWrapper: {
		width: "100%",
		marginTop: 8,
		marginBottom: -10,
	},
});