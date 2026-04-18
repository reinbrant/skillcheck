import { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	Image,
	Alert,
	ActivityIndicator,
} from "react-native";
import { InputField } from "../components/InputField";
import { MenuButton } from "../components/MenuButton";
import { supabase } from "../services/supabase";

interface ResetPasswordScreenProps {
	onPasswordUpdated: () => void; // Call this to send them back to login
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
	onPasswordUpdated,
}) => {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleUpdatePassword = async () => {
		if (!password || !confirmPassword) {
			Alert.alert("Hold Up", "Please fill out both fields.");
			return;
		}

		if (password !== confirmPassword) {
			Alert.alert("Mismatch", "Your passwords do not match.");
			return;
		}

		if (password.length < 6) {
			Alert.alert("Weak Password", "Password must be at least 6 characters.");
			return;
		}

		setLoading(true);

		// Supabase knows WHICH user to update because clicking the email link
		// securely logged them in with a temporary "recovery" session.
		const { error } = await supabase.auth.updateUser({
			password: password,
		});

		setLoading(false);

		if (error) {
			Alert.alert("Update Failed", error.message);
		} else {
			Alert.alert("Success!", "Your password has been securely updated.");
			onPasswordUpdated(); // Send them back to the login/main screen
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.logoContainer}>
				<Image
					source={require("../assets/SkillCheck_Logo_v1.png")}
					style={styles.logo}
					resizeMode="contain"
				/>
			</View>

			<View style={styles.formContainer}>
				<Text style={styles.titleText}>RESET PASSWORD</Text>
				<Text style={styles.instructionText}>
					Please enter your new password below. Make sure it's something you'll remember!
				</Text>

				<InputField
					label="New Password"
					value={password}
					onChangeText={setPassword}
					secureTextEntry
				/>

				<InputField
					label="Confirm New Password"
					value={confirmPassword}
					onChangeText={setConfirmPassword}
					secureTextEntry
				/>

				<View style={{ marginTop: 20 }}>
					{loading ? (
						<ActivityIndicator size="large" color="#d8b4e2" />
					) : (
						<MenuButton
							title="UPDATE PASSWORD"
							isThin
							onPress={handleUpdatePassword}
						/>
					)}
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
		paddingHorizontal: 30,
	},
	logoContainer: {
		marginBottom: 10,
		alignItems: "center",
		width: "100%",
		shadowColor: "#d8b4e2",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.8,
		shadowRadius: 20,
		elevation: 15,
	},
	logo: {
		width: "100%",
		height: 120,
		marginBottom: 20,
	},
	formContainer: {
		width: "100%",
		maxWidth: 400,
	},
	titleText: {
		color: "#ffffff",
		fontSize: 28,
		fontFamily: "BreatheFireIII",
		textAlign: "center",
		marginBottom: 10,
	},
	instructionText: {
		color: "#CED0D3",
		fontFamily: "BreatheFireIII",
		fontSize: 14,
		textAlign: "center",
		lineHeight: 20,
		marginBottom: 25,
	},
});