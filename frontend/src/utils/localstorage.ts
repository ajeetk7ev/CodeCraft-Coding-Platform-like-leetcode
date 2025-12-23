// Set item in localStorage (handles objects)
export function setToLocalStorage(key: string, value: any): void {
  try {
    const stringValue = JSON.stringify(value);
    localStorage.setItem(key, stringValue);
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error);
  }
}

// Get item from localStorage (parses JSON)
export function getFromLocalStorage<T = any>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return null;
  }
}

// Remove item from localStorage
export function removeFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
}