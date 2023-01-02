import { useState } from 'react';

export function useLocalstorage<T>(id: string, initialValue: T) {
  const [localStorageValue, setLocalStorageValue] = useState<T>(
    localStorage.getItem(id) ? JSON.parse(localStorage.getItem(id)!) : initialValue
  );
  function updateLocalStorage(value: T) {
    localStorage.setItem(id, JSON.stringify(value));
    setLocalStorageValue(value);
  }
  return [localStorageValue, updateLocalStorage] as const;
}
