import React, { useEffect } from 'react';
import { StyleSheet, View, AppState } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

const videoSource = require('../assets/BG_Video_Loop.mp4');

export const AnimatedBackground = () => {
  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.muted = true;
    p.playbackRate = 1.0;
    p.play();
  });

  useEffect(() => {
    const appStateWatcher = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        player.play();
      }
    });

    return () => {
      appStateWatcher.remove();
    };
  }, [player]);

  return (
    <View style={styles.container} pointerEvents="none">
      
      <VideoView
        player={player}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        nativeControls={false}
      />
      
      <View style={styles.purpleTint} />
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    backgroundColor: '#0a0512',
  },
  purpleTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 10, 45, 0.8)', 
  },
});