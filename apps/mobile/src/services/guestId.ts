import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_ID_KEY = '@buzzreel_guest_id';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

let cachedGuestId: string | null = null;

export async function getGuestId(): Promise<string> {
  if (cachedGuestId) {
    return cachedGuestId;
  }

  try {
    let guestId = await AsyncStorage.getItem(GUEST_ID_KEY);
    
    if (!guestId) {
      guestId = generateUUID();
      await AsyncStorage.setItem(GUEST_ID_KEY, guestId);
    }
    
    cachedGuestId = guestId;
    return guestId;
  } catch (error) {
    console.error('Error getting guest ID:', error);
    const fallbackId = generateUUID();
    cachedGuestId = fallbackId;
    return fallbackId;
  }
}
