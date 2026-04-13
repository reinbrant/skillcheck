import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PathContextMenu } from "./PathContextMenu";

export interface PathItem {
  id: string;
  title: string;
  itemsCount: number;
}

interface PathContainerProps {
  item: PathItem;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onLoad: () => void;
  onRename: () => void;
  onShare: () => void;
  onDelete: () => void;
}

export const PathContainer: React.FC<PathContainerProps> = ({
  item,
  isMenuOpen,
  onToggleMenu,
  onLoad,
  onRename,
  onShare,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDotsHovered, setIsDotsHovered] = useState(false);

  return (
    <View style={[styles.wrapper, isMenuOpen && { zIndex: 10 }]}>
      <Pressable
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        onPress={onLoad}
        style={({ pressed }) => [
          styles.container,
          (pressed || isHovered) && styles.containerPressed,
        ]}
      >
        {({ pressed }) => (
          <>
            <LinearGradient
              colors={["#63447a", "#291838", "#1c0d26", "#422452"]}
              locations={[0, 0.2, 0.8, 1]}
              style={StyleSheet.absoluteFillObject}
            />
            
            <View style={styles.innerRim} />

            {/* Overlay on press/hover */}
            {(pressed || isHovered) && (
              <View style={styles.highlightOverlay} />
            )}

            {/* Content */}
            <View style={styles.contentRow}>
              <View style={styles.textColumn}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.itemsCount} items</Text>
              </View>

              {/* 3 dots symbol / button */}
              <Pressable 
                style={styles.dotsButton} 
                onHoverIn={() => setIsDotsHovered(true)}
                onHoverOut={() => setIsDotsHovered(false)}
                onPress={(e) => {
                  e.stopPropagation();
                  onToggleMenu();
                }}
              >
                {({ pressed: dotsPressed }) => (
                  <Text style={[
                    styles.dotsText, 
                    (dotsPressed || isDotsHovered) && { color: "#d8b4e2" }
                  ]}>
                    ⋮
                  </Text>
                )}
              </Pressable>
            </View>
          </>
        )}
      </Pressable>

      {/* Context Menu */}
      {isMenuOpen && (
        <View style={styles.contextMenuPosition}>
          <PathContextMenu 
            onRename={onRename} 
            onShare={onShare} 
            onDelete={onDelete} 
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 25, 
    marginBottom: 20,
    position: "relative",
  },
  container: {
    width: "100%",
    height: 85, 
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 3, 
    borderColor: "#c1b1c7",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  containerPressed: {
    transform: [{ scale: 0.98 }],
    borderColor: "#d8b4e2",
    shadowColor: "#d8b4e2",
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  innerRim: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 10,
  },
  highlightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(216, 180, 226, 0.15)",
    zIndex: 1,
  },
  contentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 25,
    paddingRight: 15,
    height: "100%",
    zIndex: 2,
  },
  textColumn: {
    justifyContent: "center",
  },
  title: {
    color: "#ffffff",
    fontFamily: "BreatheFireIII",
    fontSize: 26,
    marginBottom: 2,
  },
  subtitle: {
    color: "#CED0D3",
    fontSize: 12,
    fontFamily: "BreatheFireIII",
  },
  dotsButton: {
    padding: 10,
    paddingRight: 10,
  },
  dotsText: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "bold",
    textShadowColor: "rgba(216, 180, 226, 0.8)",
    textShadowRadius: 5,
  },
  contextMenuPosition: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 100, 
  },
});