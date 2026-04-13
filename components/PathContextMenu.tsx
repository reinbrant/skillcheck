import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

interface PathContextMenuProps {
  onRename: () => void;
  onShare: () => void;
  onDelete: () => void;
}

export const PathContextMenu: React.FC<PathContextMenuProps> = ({
  onRename,
  onShare,
  onDelete,
}) => {
  // Individual menu item helper component
  const MenuItem = ({ title, icon, onPress }: { title: string, icon: any, onPress: () => void }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <Pressable
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        onPress={onPress}
        style={({ pressed }) => [
          styles.menuItem,
          (pressed || isHovered) && styles.menuItemHovered,
        ]}
      >
        {({ pressed }) => (
          <>
            <Text style={[styles.menuText, (pressed || isHovered) && { color: "#d8b4e2" }]}>{title}</Text>
            <Feather name={icon} size={14} color={(pressed || isHovered) ? "#d8b4e2" : "#ffffff"} />
          </>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.menuContainer}>
      <MenuItem title="Rename" icon="edit-2" onPress={onRename} />
      <View style={styles.divider} />
      <MenuItem title="Share" icon="upload" onPress={onShare} />
      <View style={styles.divider} />
      <MenuItem title="Delete" icon="trash-2" onPress={onDelete} />
    </View>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    backgroundColor: "rgba(27, 18, 38, 0.95)",
    borderWidth: 1,
    borderColor: "#d8b4e2",
    borderRadius: 6,
    width: 140,
    shadowColor: "#d8b4e2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  menuItemHovered: {
    backgroundColor: "rgba(216, 180, 226, 0.2)",
  },
  menuText: {
    color: "#ffffff",
    fontFamily: "BreatheFireIII",
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(216, 180, 226, 0.3)",
    width: "100%",
  },
});