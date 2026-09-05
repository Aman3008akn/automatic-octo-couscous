import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "cartigo_auth_token";
const USER_KEY = "cartigo_user_data";

// Fallback in-memory store for web/unsupported environments
const memoryStorage: Record<string, string> = {};

export async function saveAuthToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    memoryStorage[TOKEN_KEY] = token;
    return;
  }
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.warn("SecureStore error saving token:", error);
    memoryStorage[TOKEN_KEY] = token;
  }
}

export async function getAuthToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return memoryStorage[TOKEN_KEY] || null;
  }
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.warn("SecureStore error getting token:", error);
    return memoryStorage[TOKEN_KEY] || null;
  }
}

export async function removeAuthToken(): Promise<void> {
  delete memoryStorage[TOKEN_KEY];
  if (Platform.OS === "web") return;
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.warn("SecureStore error deleting token:", error);
  }
}

export async function saveUserData(data: any): Promise<void> {
  const json = JSON.stringify(data);
  if (Platform.OS === "web") {
    memoryStorage[USER_KEY] = json;
    return;
  }
  try {
    await SecureStore.setItemAsync(USER_KEY, json);
  } catch (error) {
    memoryStorage[USER_KEY] = json;
  }
}

export async function getUserData(): Promise<any | null> {
  let raw: string | null = null;
  if (Platform.OS === "web") {
    raw = memoryStorage[USER_KEY] || null;
  } else {
    try {
      raw = await SecureStore.getItemAsync(USER_KEY);
    } catch {
      raw = memoryStorage[USER_KEY] || null;
    }
  }

  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function clearStorage(): Promise<void> {
  await removeAuthToken();
  delete memoryStorage[USER_KEY];
  if (Platform.OS !== "web") {
    try {
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch {}
  }
}
