import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUser } from '@/lib/analytics';

const INSTALLATION_ID_KEY = 'arcade_installation_id';
const LOCAL_USER_ID_KEY = 'arcade_local_user_id';
const INSTALL_DATE_KEY = 'arcade_install_date';
const SESSION_START_TS_KEY = 'arcade_session_start_ts';

let identitySnapshot: {
  installationId: string;
  localUserId: string;
  sessionId: string;
  installDate: string;
  sessionStartTs: number;
} | null = null;

function randomId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function initializeIdentity(): Promise<{
  installationId: string;
  localUserId: string;
  sessionId: string;
  installDate: string;
  sessionStartTs: number;
}> {
  let installationId = await AsyncStorage.getItem(INSTALLATION_ID_KEY);
  if (!installationId) {
    installationId = randomId('install');
    await AsyncStorage.setItem(INSTALLATION_ID_KEY, installationId);
  }

  let localUserId = await AsyncStorage.getItem(LOCAL_USER_ID_KEY);
  if (!localUserId) {
    localUserId = randomId('user');
    await AsyncStorage.setItem(LOCAL_USER_ID_KEY, localUserId);
  }

  let installDate = await AsyncStorage.getItem(INSTALL_DATE_KEY);
  if (!installDate) {
    installDate = new Date().toISOString().slice(0, 10);
    await AsyncStorage.setItem(INSTALL_DATE_KEY, installDate);
  }

  const sessionStartTs = Date.now();
  await AsyncStorage.setItem(SESSION_START_TS_KEY, String(sessionStartTs));
  const sessionId = randomId('session');
  setUser({
    installationId,
    localUserId,
    sessionId,
    installDate,
    session_start_ts: sessionStartTs,
    install_id: installationId,
    local_user_id: localUserId,
    session_id: sessionId,
  });

  identitySnapshot = {
    installationId,
    localUserId,
    sessionId,
    installDate,
    sessionStartTs,
  };

  return { installationId, localUserId, sessionId, installDate, sessionStartTs };
}

export function getIdentitySnapshot():
  | {
      installationId: string;
      localUserId: string;
      sessionId: string;
      installDate: string;
      sessionStartTs: number;
    }
  | null {
  return identitySnapshot;
}
