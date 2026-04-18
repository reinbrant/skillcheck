import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  Share
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PathContainer, PathItem } from "../components/PathContainer";
import { supabase } from "../services/supabase";
import { quizService } from "../services/quizService";

// UPDATED: Added `id` to the callback so we know exactly which quiz to load
export const LoadPathScreen = ({ 
  onBack, 
  onPathSelect 
}: { 
  onBack: () => void; 
  onPathSelect: (id: string, title: string) => void 
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isBackHovered, setIsBackHovered] = useState(false);
  
  // New States for Database
  const [pathsData, setPathsData] = useState<PathItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserPaths = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch all quizzes owned by this user
        const { data, error } = await supabase
          .from('quizzes')
          .select('id, language, quiz_json')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false }); // Newest first

        if (error) throw error;

        if (data) {
          // Map the database rows into the PathItem shape our UI expects
          const formattedPaths = data.map((quiz) => ({
            id: quiz.id,
            title: quiz.language || "Unknown Path",
            itemsCount: quiz.quiz_json?.questions?.length || 0,
          }));
          
          setPathsData(formattedPaths);
        }
      } catch (error) {
        console.error("Error fetching paths:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPaths();
  }, []);

  const handleRename = (id: string) => console.log(`Trigger Rename for: ${id}`);
  const handleShare = async (id: string) => {
      const link = quizService.getShareableLink(id);
      try {
          await Share.share({
              message: `Can you beat my score on this path? Play it here: ${link}`,
          });
      } catch (error: any) {
          Alert.alert("Share Error", error.message);
      }
  };
  // Real Delete Functionality
  const handleDelete = async (id: string) => {
    try {
      // Optimistic UI update
      setPathsData((prev) => prev.filter(path => path.id !== id));
      
      // Delete from DB
      await supabase.from('quizzes').delete().eq('id', id);
    } catch (error) {
      console.error("Failed to delete path", error);
    }
  };

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

        {/* Loading State */}
        {isLoading ? (
            <View style={styles.centerContent}>
                <ActivityIndicator size="large" color="#d8b4e2" />
            </View>
        ) : pathsData.length === 0 ? (
            // Empty State
            <View style={styles.centerContent}>
                <Text style={styles.emptyText}>No paths found.</Text>
                <Text style={styles.emptySubText}>Go to NEW PATH to generate one!</Text>
            </View>
        ) : (
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
                // UPDATED: Now passing BOTH the ID and the Title back to App.tsx
                onLoad={() => onPathSelect(item.id, item.title)}
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
        )}
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "transparent" },
  container: { flex: 1, width: "100%" },
  header: {
    width: "100%",
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: { paddingVertical: 10, paddingRight: 15 },
  backButtonHovered: { opacity: 0.6, transform: [{ scale: 0.9 }] },
  backArrow: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "bold",
    textShadowColor: "#d8b4e2",
    textShadowRadius: 8,
  },
  headerTitle: { color: "#ffffff", fontFamily: "BreatheFireIII", fontSize: 32 },
  listContent: { paddingTop: 10, paddingBottom: 40 },
  centerContent: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingBottom: 100,
  },
  emptyText: {
      color: "#d8b4e2",
      fontFamily: "BreatheFireIII",
      fontSize: 24,
      marginBottom: 10,
  },
  emptySubText: {
      color: "#8a6b96",
      fontFamily: "BreatheFireIII",
      fontSize: 16,
  }
});