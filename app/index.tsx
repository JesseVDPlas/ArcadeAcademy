import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  const { name } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (name) router.replace('/home');
    else router.replace('/start');
  }, [name]);

  return null;
} 