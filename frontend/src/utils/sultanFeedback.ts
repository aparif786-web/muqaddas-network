// Sultan's Royal Feedback System
// Haptic vibrations and Royal sounds for "Live Device" feel

import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

// Sound URLs (royalty-free sounds)
const SOUNDS = {
  coinDrop: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
  levelUp: 'https://assets.mixkit.co/active_storage/sfx/1997/1997-preview.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  reward: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3',
  gameWin: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  gameLose: 'https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3',
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
};

let soundObject: Audio.Sound | null = null;

// Initialize audio
export const initializeAudio = async () => {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
  } catch (error) {
    console.log('Audio init error:', error);
  }
};

// Play sound effect
export const playSound = async (soundType: keyof typeof SOUNDS) => {
  try {
    // Unload previous sound
    if (soundObject) {
      await soundObject.unloadAsync();
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: SOUNDS[soundType] },
      { shouldPlay: true, volume: 0.5 }
    );
    soundObject = sound;

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.log('Sound play error:', error);
  }
};

// Haptic feedback functions
export const hapticFeedback = {
  // Light tap - for button presses
  light: () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },

  // Medium tap - for selections
  medium: () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },

  // Heavy tap - for important actions
  heavy: () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },

  // Success vibration - for completed tasks
  success: () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  },

  // Warning vibration
  warning: () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  },

  // Error vibration
  error: () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },

  // Selection changed
  selection: () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  },
};

// Combined feedback for different actions
export const sultanFeedback = {
  // Transaction completed (coins received/sent)
  transaction: async () => {
    hapticFeedback.success();
    await playSound('coinDrop');
  },

  // Level up or achievement
  levelUp: async () => {
    hapticFeedback.heavy();
    await playSound('levelUp');
  },

  // Task/lesson completed
  taskComplete: async () => {
    hapticFeedback.success();
    await playSound('success');
  },

  // Reward claimed
  rewardClaimed: async () => {
    hapticFeedback.medium();
    await playSound('reward');
  },

  // Game won
  gameWon: async () => {
    hapticFeedback.success();
    await playSound('gameWin');
  },

  // Game lost
  gameLost: async () => {
    hapticFeedback.warning();
    await playSound('gameLose');
  },

  // Button press
  buttonPress: async () => {
    hapticFeedback.light();
    await playSound('click');
  },

  // VIP upgrade
  vipUpgrade: async () => {
    hapticFeedback.heavy();
    await playSound('levelUp');
  },

  // Withdrawal request
  withdrawal: async () => {
    hapticFeedback.medium();
    await playSound('success');
  },

  // Error occurred
  error: async () => {
    hapticFeedback.error();
  },
};

export default sultanFeedback;
