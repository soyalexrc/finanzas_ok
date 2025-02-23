// write a custom hook where i can check what platform i am on
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export default function usePlatform() {
  const [platform, setPlatform] = useState(Platform.OS);

  useEffect(() => {
    setPlatform(Platform.OS);
  }, []);

  return platform;
}
