import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	Image,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
} from "react-native";
import { FontAwesome5, AntDesign } from "@expo/vector-icons";
import { InputField } from "../components/InputField";
import { MenuButton } from "../components/MenuButton";
import { ForgotPasswordModal } from "../components/ForgotPasswordModal";
import { supabase } from "../services/supabase";

export const LoginScreen = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isRememberMe, setIsRememberMe] = useState(false);
	const [loading, setLoading] = useState(false);
	const [username, setUsername] = useState("");

	// NEW: State to toggle between Login and Sign Up modes
	const [isSignUpMode, setIsSignUpMode] = useState(false);

	// States for "Forgot Password" modal
	const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

	const toggleRememberMe = () => setIsRememberMe(!isRememberMe);

	const handleLogin = async () => {
		// NEW: Block empty fields
		if (!email.trim() || !password.trim()) {
			Alert.alert(
				"Hold Up",
				"Please enter both an email and a password.",
			);
			return;
		}

		setLoading(true);
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		if (error) Alert.alert("Login Failed", error.message);
		setLoading(false);
	};

	const handleSignUp = async () => {
		// Validation
		if (!email.trim() || !password.trim() || !username.trim()) {
			Alert.alert("Hold Up", "Please fill out all fields.");
			return;
		}
		if (password.length < 6) {
			Alert.alert(
				"Invalid Password",
				"Password must be at least 6 characters.",
			);
			return;
		}

		setLoading(true);
		// Pass the username into the user's metadata
		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					username: username.trim(),
				},
			},
		});

		if (error) Alert.alert("Sign Up Failed", error.message);
		else Alert.alert("Success", "Account created successfully!");
		setLoading(false);
	};

	const handleForgotPasswordSubmit = (submittedEmail: string) => {
		console.log("Forgot Password submitted for email:", submittedEmail);
		setIsForgotPasswordOpen(false);
		// TODO: Implement actual supabase forgot password logic here
	};

	// NEW: Handle the main button press dynamically
	const handleSubmit = () => {
		if (isSignUpMode) {
			handleSignUp();
		} else {
			handleLogin();
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
				<InputField
					label="Username"
					value={username}
					onChangeText={setUsername}
					autoCapitalize="none"
				/>

				<InputField
					label="Email"
					value={email}
					onChangeText={setEmail}
					autoCapitalize="none"
				/>

				<InputField
					label="Password"
					value={password}
					onChangeText={setPassword}
					secureTextEntry
				/>

				{/* Hide 'Remember Me' and 'Forgot Password' during Sign Up to make the UI distinct */}
				{!isSignUpMode && (
					<View style={styles.optionsRow}>
						<TouchableOpacity
							style={styles.checkboxRow}
							onPress={toggleRememberMe}
							activeOpacity={0.7}
						>
							<View
								style={[
									styles.checkbox,
									isRememberMe && styles.checkboxChecked,
								]}
							>
								{isRememberMe && (
									<FontAwesome5
										name="check"
										size={10}
										color="#1b1429"
									/>
								)}
							</View>
							<Text style={[styles.subText, { fontSize: 14 }]}>
								Remember me
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => setIsForgotPasswordOpen(true)}
						>
							<Text style={[styles.subText, { fontSize: 14 }]}>
								Forgot Password?
							</Text>
						</TouchableOpacity>
					</View>
				)}

				<View style={{ marginTop: isSignUpMode ? 20 : 0 }}>
					{loading ? (
						<ActivityIndicator size="large" color="#d8b4e2" />
					) : (
						<MenuButton
							title={isSignUpMode ? "CREATE ACCOUNT" : "LOG IN"}
							isThin
							onPress={handleSubmit}
						/>
					)}
				</View>

				<View style={styles.separatorRow}>
					<View style={styles.line} />
					<Text style={styles.subText}>
						{isSignUpMode ? "Or sign up with" : "Or login with"}
					</Text>
					<View style={styles.line} />
				</View>

				<View style={styles.socialRow}>
					{["google", "facebook-f", "apple", "mobile-alt"].map(
						(icon, index) => (
							<TouchableOpacity
								key={index}
								style={styles.socialBtn}
							>
								{icon === "google" || icon === "apple" ? (
									<AntDesign
										name={icon as any}
										size={24}
										color="black"
									/>
								) : (
									<FontAwesome5
										name={icon as any}
										size={24}
										color="black"
									/>
								)}
							</TouchableOpacity>
						),
					)}
				</View>

				<View style={styles.signUpRow}>
					<Text style={styles.subText}>
						{isSignUpMode
							? "Already have an account? "
							: "Don't have an account? "}
					</Text>
					<TouchableOpacity
						onPress={() => setIsSignUpMode(!isSignUpMode)}
						disabled={loading}
					>
						<Text
							style={[
								styles.subTextWhite,
								{ fontSize: 20, textShadowRadius: 8 },
							]}
						>
							{isSignUpMode ? "Log In" : "Sign Up"}
						</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* Forgot Password Modal */}
			<ForgotPasswordModal
				visible={isForgotPasswordOpen}
				onClose={() => setIsForgotPasswordOpen(false)}
				onSubmit={handleForgotPasswordSubmit}
			/>
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
		// Drop Shadow Glow effect:
		shadowColor: "#d8b4e2",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.8,
		shadowRadius: 20,
		elevation: 15,
	},
	logo: {
		width: "100%",
		height: 120,
		marginBottom: 40,
	},
	formContainer: {
		width: "100%",
		maxWidth: 400,
	},
	optionsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 30,
		paddingHorizontal: 5,
	},
	checkboxRow: {
		flexDirection: "row",
		alignItems: "center",
	},
	checkbox: {
		width: 16,
		height: 16,
		borderWidth: 1.5,
		borderColor: "#d8b4e2",
		marginRight: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	checkboxChecked: {
		backgroundColor: "#d8b4e2",
	},
	subText: {
		color: "#CED0D3",
		fontFamily: "BreatheFireIII",
		fontSize: 16,
	},
	subTextWhite: {
		color: "#ffffff",
		fontFamily: "BreatheFireIII",
		fontSize: 16,
	},
	separatorRow: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 25,
	},
	line: {
		flex: 1,
		height: 1,
		backgroundColor: "rgba(216, 180, 226, 0.4)",
		marginHorizontal: 10,
	},
	socialRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 30,
	},
	socialBtn: {
		width: 60,
		height: 45,
		backgroundColor: "#ffffff",
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	signUpRow: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
	},
});
