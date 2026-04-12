import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { FontAwesome5, AntDesign } from "@expo/vector-icons";
import { InputField } from "../components/InputField";
import { MenuButton } from "../components/MenuButton";

export const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isRememberMe, setIsRememberMe] = useState(false);

  const toggleRememberMe = () => {
    setIsRememberMe(!isRememberMe);
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

      {/* Username and Password Fields */}
      <View style={styles.formContainer}>
        <InputField
          label="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <InputField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Checkbox and Forgot Password Row */}
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={toggleRememberMe}
            activeOpacity={0.7}
          >
            <View
              style={[styles.checkbox, isRememberMe && styles.checkboxChecked]}
            >
              {isRememberMe && (
                <FontAwesome5 name="check" size={10} color="#1b1429" />
              )}
            </View>
            <Text style={[styles.subText, { fontSize: 14 }]}>Remember me</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={[styles.subText, { fontSize: 14 }]}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Log In Button */}
        <View style={{ marginTop: 20 }}>
          <MenuButton title="LOG IN" isThin onPress={onLogin} />
        </View>

        <View style={styles.separatorRow}>
          <View style={styles.line} />
          <Text style={styles.subText}>Or login with</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socialRow}>
          {["google", "facebook-f", "apple", "mobile-alt"].map(
            (icon, index) => (
              <TouchableOpacity key={index} style={styles.socialBtn}>
                {icon === "google" || icon === "apple" ? (
                  <AntDesign name={icon as any} size={24} color="black" />
                ) : (
                  <FontAwesome5 name={icon as any} size={24} color="black" />
                )}
              </TouchableOpacity>
            ),
          )}
        </View>

        {/* Sign Up Row */}
        <View style={styles.signUpRow}>
          <Text style={styles.subText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => console.log("Navigate to Sign Up")}>
            <Text
              style={[
                styles.subTextWhite,
                { fontSize: 20, textShadowRadius: 8 },
              ]}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
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
