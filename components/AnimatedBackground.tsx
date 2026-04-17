import React, { use, useEffect } from "react";
import { StyleSheet, View, AppState } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { useSettings } from "../contexts/SettingsContext";

const videoSource = require("../assets/BG_Video_Loop.mp4");

export const AnimatedBackground = () => {
	const { isAnimationDisabled } = useSettings();

	const player = useVideoPlayer(videoSource, (p) => {
		p.loop = true;
		p.muted = true;
		p.playbackRate = 1.0;
	});

	useEffect(() => {
		if (isAnimationDisabled) {
			player.pause();
		} else {
			player.play();
		}
	}, [isAnimationDisabled, player]);

	useEffect(() => {
		const appStateWatcher = AppState.addEventListener(
			"change",
			(nextAppState) => {
				if (nextAppState === "active" && !isAnimationDisabled) {
					player.play();
				}
			},
		);

		return () => {
			appStateWatcher.remove();
		};
	}, [player, isAnimationDisabled]);

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
		backgroundColor: "#0a0512",
	},
	purpleTint: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(30, 10, 45, 0.8)",
	},
});
