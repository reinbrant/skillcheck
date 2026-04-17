import React, { createContext, useState, useEffect, useContext } from "react";
import { useAudioPlayer } from "expo-audio";

interface SettingsContextType {
	isMusicMuted: boolean;
	toggleMusic: () => void;
	isAnimationDisabled: boolean;
	toggleAnimation: () => void;
}

const SettingsContext = createContext<SettingsContextType>({
	isMusicMuted: false,
	toggleMusic: () => {},
	isAnimationDisabled: false,
	toggleAnimation: () => {},
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [isMusicMuted, setIsMusicMuted] = useState(false);
	const [isAnimationDisabled, setIsAnimationDisabled] = useState(false);

	const audioSource = require("../assets/audio/YakaStreams_SkillCheck_BGMusic.mp3");
	const player = useAudioPlayer(audioSource);

	// Initial config and play trigger
	useEffect(() => {
		player.loop = true;
		player.volume = isMusicMuted ? 0 : 0.5;
		player.play();
	}, [player]);

	// Dynamically adjust the volume when the mute state changes
	useEffect(() => {
		player.volume = isMusicMuted ? 0 : 0.5;
	}, [isMusicMuted, player]);

	const toggleMusic = () => setIsMusicMuted(!isMusicMuted);
	const toggleAnimation = () => setIsAnimationDisabled(!isAnimationDisabled);

	return (
		<SettingsContext.Provider
			value={{
				isMusicMuted,
				toggleMusic,
				isAnimationDisabled,
				toggleAnimation,
			}}
		>
			{children}
		</SettingsContext.Provider>
	);
};
