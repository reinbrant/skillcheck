import { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	Image,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
	KeyboardAvoidingView
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

	const [isSignUpMode, setIsSignUpMode] = useState(false);
	const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

	// Load saved email on startup
	useEffect(() => {
		const loadCredentials = async () => {
			try {
				const savedEmail = await AsyncStorage.getItem("user_email");
				if (savedEmail) {
					setEmail(savedEmail);
					setIsRememberMe(true);
				}
			} catch (error) {
				console.error("Failed to load credentials", error);
			}
		};
		loadCredentials();
	}, []);

	const toggleRememberMe = () => setIsRememberMe(!isRememberMe);

	const handleLogin = async () => {
		if (!email.trim() || !password.trim()) {
			Alert.alert("Hold Up", "Please enter both an email and a password.");
			return;
		}

		setLoading(true);
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			Alert.alert("Login Failed", error.message);
		} else {
			// Handle Remember Me persistence
			try {
				if (isRememberMe) {
					await AsyncStorage.setItem("user_email", email);
				} else {
					await AsyncStorage.removeItem("user_email");
				}
			} catch (storageError) {
				console.error("Failed to save credentials", storageError);
			}
		}
		setLoading(false);
	};

	const handleSignUp = async () => {
		if (!email.trim() || !password.trim() || !username.trim()) {
			Alert.alert("Hold Up", "Please fill out all fields.");
			return;
		}

		// --- Password Regex Validation ---
		// Requires: Minimum 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
		
		if (!passwordRegex.test(password)) {
			Alert.alert(
				"Weak Password", 
				"Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
			);
			return;
		}

		setLoading(true);
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

	const handleForgotPasswordSubmit = async (submittedEmail: string) => {
		if (!submittedEmail.trim()) {
			Alert.alert("Hold Up", "Please enter a valid email address.");
			return;
		}

		// 1. Call Supabase to send the reset email
		const { error } = await supabase.auth.resetPasswordForEmail(submittedEmail);

		// 2. Handle the response
		if (error) {
			Alert.alert("Reset Failed", error.message);
		} else {
			Alert.alert(
				"Link Sent!", 
				"Check your inbox for the password reset link."
			);
			setIsForgotPasswordOpen(false); // Only close the modal on success
		}
	};

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
					{/* CONDITIONAL USERNAME: Only shows for Sign Up */}
					{isSignUpMode && (
						<InputField
							label="Username"
							value={username}
							onChangeText={setUsername}
							autoCapitalize="none"
						/>
					)}

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

					{/* Hide 'Remember Me' and 'Forgot Password' during Sign Up */}
					{!isSignUpMode && (
						<View style={styles.optionsRow}>
							<TouchableOpacity
								style={styles.checkboxRow}
								onPress={toggleRememberMe}
								activeOpacity={0.7}
							>
								<View style={[styles.checkbox, isRememberMe && styles.checkboxChecked]}>
									{isRememberMe && <FontAwesome5 name="check" size={10} color="#1b1429" />}
								</View>
								<Text style={[styles.subText, { fontSize: 14 }]}>Remember me</Text>
							</TouchableOpacity>
							<TouchableOpacity onPress={() => setIsForgotPasswordOpen(true)}>
								<Text style={[styles.subText, { fontSize: 14 }]}>Forgot Password?</Text>
							</TouchableOpacity>
						</View>
					)}

					<View style={{ marginTop: isSignUpMode ? 20 : 0, marginBottom: 30 }}>
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

					<View style={styles.signUpRow}>
						<Text style={styles.subText}>
							{isSignUpMode ? "Already have an account? " : "Don't have an account? "}
						</Text>
						<TouchableOpacity onPress={() => setIsSignUpMode(!isSignUpMode)} disabled={loading}>
							<Text style={[styles.subTextWhite, { fontSize: 20, textShadowRadius: 8 }]}>
								{isSignUpMode ? "Log In" : "Sign Up"}
							</Text>
						</TouchableOpacity>
					</View>
				</View>

				<ForgotPasswordModal
					visible={isForgotPasswordOpen}
					onClose={() => setIsForgotPasswordOpen(false)}
					onSubmit={handleForgotPasswordSubmit}
				/>
			</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, alignItems: "center", justifyContent: "center", width: "100%", paddingHorizontal: 30 },
	logoContainer: { marginBottom: 10, alignItems: "center", width: "100%", shadowColor: "#d8b4e2", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.8, shadowRadius: 20, elevation: 15 },
	logo: { width: "100%", height: 120, marginBottom: 40 },
	formContainer: { width: "100%", maxWidth: 400 },
	optionsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 30, paddingHorizontal: 5 },
	checkboxRow: { flexDirection: "row", alignItems: "center" },
	checkbox: { width: 16, height: 16, borderWidth: 1.5, borderColor: "#d8b4e2", marginRight: 8, alignItems: "center", justifyContent: "center" },
	checkboxChecked: { backgroundColor: "#d8b4e2" },
	subText: { color: "#CED0D3", fontFamily: "BreatheFireIII", fontSize: 16 },
	subTextWhite: { color: "#ffffff", fontFamily: "BreatheFireIII", fontSize: 16 },
	signUpRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
});