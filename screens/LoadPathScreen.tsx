import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PathContainer, PathItem } from "../components/PathContainer";

export const LoadPathScreen = ({ onBack, onPathSelect }: { onBack: () => void; onPathSelect: (title: string) => void }) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isBackHovered, setIsBackHovered] = useState(false);

  // Mock data
  const pathsData: PathItem[] = [
    { id: "1", title: "Python Quiz", itemsCount: 18 },
    { id: "2", title: "C#", itemsCount: 10 },
    { id: "3", title: "Assembly Language", itemsCount: 15 },
    { id: "4", title: "Finals", itemsCount: 20 },
  ];

  const handleLoad = (id: string) => console.log(`Loading path: ${id}`);
  const handleRename = (id: string) => console.log(`Trigger Rename for: ${id}`);
  const handleShare = (id: string) => console.log(`Trigger Share for: ${id}`);
  const handleDelete = (id: string) => console.log(`Trigger Delete for: ${id}`);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Pressable 
        style={styles.container} 
        onPress={() => setActiveMenuId(null)}
        accessible={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable 
            onPress={onBack} 
            onHoverIn={() => setIsBackHovered(true)}
            onHoverOut={() => setIsBackHovered(false)}
            style={({ pressed }) => [
              styles.backButton,
              (pressed || isBackHovered) && styles.backButtonHovered
            ]}
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}> CHOOSE  PATH</Text>
        </View>

        {/* List of Paths */}
        <FlatList
          data={pathsData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PathContainer
              item={item}
              isMenuOpen={activeMenuId === item.id}
              onToggleMenu={() =>
                setActiveMenuId(activeMenuId === item.id ? null : item.id)
              }
              onLoad={() => onPathSelect(item.title)}
              onRename={() => {
                handleRename(item.id);
                setActiveMenuId(null);
              }}
              onShare={() => {
                handleShare(item.id);
                setActiveMenuId(null);
              }}
              onDelete={() => {
                handleDelete(item.id);
                setActiveMenuId(null);
              }}
            />
          )}
        />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  container: {
    flex: 1,
    width: "100%",
  },
  header: {
    width: "100%",
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    paddingVertical: 10,
    paddingRight: 15,
  },
  backButtonHovered: {
    opacity: 0.6,
    transform: [{ scale: 0.9 }],
  },
  backArrow: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "bold",
    textShadowColor: "#d8b4e2",
    textShadowRadius: 8,
  },
  headerTitle: {
    color: "#ffffff",
    fontFamily: "BreatheFireIII",
    fontSize: 32,
  },
  listContent: {
    paddingTop: 10, 
    paddingBottom: 40,
  },
});