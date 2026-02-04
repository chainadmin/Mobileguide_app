import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = '@buzzreel_streak';
const LAST_OPEN_KEY = '@buzzreel_last_open';

type StreakData = {
  count: number;
  lastOpenDate: string;
};

function getTodayDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
}

export async function getStreak(): Promise<number> {
  try {
    const stored = await AsyncStorage.getItem(STREAK_KEY);
    if (stored) {
      const data: StreakData = JSON.parse(stored);
      return data.count;
    }
    return 0;
  } catch (error) {
    console.error('Error getting streak:', error);
    return 0;
  }
}

export async function recordAppOpen(): Promise<number> {
  try {
    const today = getTodayDate();
    const yesterday = getYesterdayDate();
    
    const stored = await AsyncStorage.getItem(STREAK_KEY);
    let streakData: StreakData = { count: 0, lastOpenDate: '' };
    
    if (stored) {
      streakData = JSON.parse(stored);
    }
    
    if (streakData.lastOpenDate === today) {
      return streakData.count;
    }
    
    if (streakData.lastOpenDate === yesterday) {
      streakData.count += 1;
    } else if (streakData.lastOpenDate !== today) {
      streakData.count = 1;
    }
    
    streakData.lastOpenDate = today;
    await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(streakData));
    
    return streakData.count;
  } catch (error) {
    console.error('Error recording app open:', error);
    return 0;
  }
}
