import React from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  Image,
} from "react-native";

interface InputFieldProps extends TextInputProps {
  label: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, ...props }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <View style={styles.diamondWrapper}>
          <View style={styles.diamondOuter}>
            <Image
              source={require("../assets/Button_Texture1.jpg")}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />
            <View style={styles.purpleTintOverlay} />

            <View style={styles.diamondInner} />
          </View>
        </View>

        {/* The Text Field Container */}
        <View style={styles.inputContainer}>
          <View style={styles.inputTextureBox}>
            <Image
              source={require("../assets/Button_Texture1.jpg")}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />
            <View style={styles.purpleTintOverlay} />
          </View>

          <TextInput
            style={styles.input}
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            {...props}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 25,
    width: "100%",
  },
  label: {
    color: "#ffffff",
    fontFamily: "BreatheFireIII",
    fontSize: 24,
    marginLeft: 60,
    marginBottom: 8,
    textShadowColor: "rgba(216, 180, 226, 0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  diamondWrapper: {
    position: "absolute",
    left: 10,
    zIndex: 2,
    // Glow Effect:
    // shadowColor: "#d8b4e2",
    // shadowOffset: { width: 0, height: 0 },
    // shadowOpacity: 0.9,
    // shadowRadius: 6,
    // elevation: 5,
  },
  diamondOuter: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: "#d8b4e2",
    transform: [{ rotate: "45deg" }],
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  diamondInner: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: "#d8b4e2",
    backgroundColor: "#302845",
  },
  inputContainer: {
    flex: 1,
    height: 55,
    marginLeft: 33,
    shadowColor: "#d8b4e2",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  inputTextureBox: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.5,
    borderColor: "#d8b4e2",
    borderRadius: 2,
    overflow: "hidden",
  },
  purpleTintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(22, 10, 38, 0.9)",
  },
  input: {
    flex: 1,
    color: "#ffffff",
    fontSize: 18,
    paddingLeft: 45,
    paddingRight: 15,
    backgroundColor: "transparent",
  },
});
