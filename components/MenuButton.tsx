import React, { useRef } from "react";
import {
  Text,
  StyleSheet,
  ViewStyle,
  Animated,
  Pressable,
  View,
  Easing,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface MenuButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  isThin?: boolean;
}

export const MenuButton: React.FC<MenuButtonProps> = ({
  title,
  onPress,
  style,
  isThin = false,
}) => {
  const rotation = useRef(new Animated.Value(0)).current;

  const startGlow = () => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ).start();
  };

  const stopGlow = () => {
    rotation.stopAnimation();
    rotation.setValue(0);
  };

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={startGlow}
      onPressOut={stopGlow}
      onHoverIn={startGlow}
      onHoverOut={stopGlow}
      style={({ pressed }) => [
        styles.container,
        style,
        pressed && { transform: [{ scale: 0.97 }] },
      ]}
    >
      <View style={styles.borderMask}>
        {/* Rotating Glow Highlight */}
        <Animated.View
          style={[styles.spinningCanvas, { transform: [{ rotate: spin }] }]}
        >
          <LinearGradient
            colors={[
              "rgba(216, 180, 226, 0.1)",
              "#BF9BC8",
              "rgba(216, 180, 226, 0.1)",
            ]}
            locations={[0.35, 0.5, 0.65]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>

        {/* Textured Button */}
        <View style={[styles.innerButton, isThin && { paddingVertical: 12 }]}>
          
          <Image 
            source={require("../assets/Button_Texture1.jpg")}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <View style={styles.purpleTintOverlay} />
          <View style={styles.textInnerGlow} />
          <Text style={[styles.text, isThin && { fontSize: 32 }]}>{title}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    shadowColor: "#d8b4e2",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 15,
    elevation: 10,
    width: "100%",
  },
  borderMask: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  spinningCanvas: {
    position: "absolute",
    width: 600,
    height: 600,
    top: "50%",
    left: "50%",
    marginTop: -300,
    marginLeft: -300,
  },
  innerButton: {
    paddingVertical: 26,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  purpleTintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(22, 10, 38, 0.9)",
  },
  text: {
    color: "#ffffff",
    fontSize: 42,
    fontFamily: "BreatheFireIII",
    textTransform: "uppercase",

    textShadowColor: "rgba(216, 180, 226, 0.9)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  textInnerGlow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 0,
    borderColor: "rgba(216, 180, 226, 0.25)",
    backgroundColor: "rgba(216, 180, 226, 0.05)",
  },
});
