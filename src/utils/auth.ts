import { User } from '../types';

const AUTH_USER_KEY = 'makassar_ducting_auth_user_v4';
const ACCOUNTS_KEY = 'makassar_ducting_registered_accounts_v4';

export interface SystemAccount extends User {
  password: string;
  description: string;
}

// Akun Resmi Sistem: Admin dan Surveyor
export const DEFAULT_SYSTEM_ACCOUNTS: SystemAccount[] = [
  {
    id: 'acc-admin',
    name: 'A Hamid S.Si',
    email: 'admin@makassar.go.id',
    password: 'admin',
    role: 'admin',
    roleTitle: 'Administrator Kokek Konsulting',
    agency: 'Kokek Konsulting',
    avatarBg: 'bg-indigo-600',
    initials: 'AH',
    description: 'Akses penuh seluruh modul survei, scoring, GIS, verifikasi data, dan master export.',
  },
  {
    id: 'acc-surveyor',
    name: 'Andi Rahmat Hidayat',
    email: 'surveyor@makassar.go.id',
    password: 'surveyor',
    role: 'surveyor',
    roleTitle: 'Surveyor Lapangan Teknis',
    agency: 'Kokek Konsulting',
    avatarBg: 'bg-emerald-600',
    initials: 'AR',
    description: 'Akses verifikasi lapangan Ground Check, input tiang, geotagging GPS, dan dokumentasi foto.',
  },
];

export function getRegisteredAccounts(): SystemAccount[] {
  try {
    const saved = localStorage.getItem(ACCOUNTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Synchronize default admin if matches admin@makassar.go.id
        return parsed.map((acc: SystemAccount) => {
          if (acc.email.toLowerCase() === 'admin@makassar.go.id') {
            return {
              ...acc,
              name: DEFAULT_SYSTEM_ACCOUNTS[0].name,
              initials: DEFAULT_SYSTEM_ACCOUNTS[0].initials,
              agency: 'Kokek Konsulting',
              roleTitle: 'Administrator Kokek Konsulting',
            };
          }
          if (acc.email.toLowerCase() === 'surveyor@makassar.go.id') {
            return {
              ...acc,
              agency: 'Kokek Konsulting',
            };
          }
          return acc;
        });
      }
    }
  } catch (err) {
    console.error('Error loading registered accounts:', err);
  }
  return DEFAULT_SYSTEM_ACCOUNTS;
}

export function saveRegisteredAccount(newAccount: SystemAccount): void {
  try {
    const accounts = getRegisteredAccounts();
    const existingIndex = accounts.findIndex(
      (a) => a.email.toLowerCase() === newAccount.email.toLowerCase()
    );
    if (existingIndex >= 0) {
      accounts[existingIndex] = newAccount;
    } else {
      accounts.push(newAccount);
    }
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Error saving registered account:', err);
  }
}

export function getStoredUser(): User | null {
  try {
    const saved = localStorage.getItem(AUTH_USER_KEY);
    if (saved) {
      const user = JSON.parse(saved);
      if (user && user.email && user.email.toLowerCase() === 'admin@makassar.go.id') {
        return {
          ...user,
          name: DEFAULT_SYSTEM_ACCOUNTS[0].name,
          initials: DEFAULT_SYSTEM_ACCOUNTS[0].initials,
          agency: 'Kokek Konsulting',
          roleTitle: 'Administrator Kokek Konsulting',
        };
      }
      if (user && user.email && user.email.toLowerCase() === 'surveyor@makassar.go.id') {
        return {
          ...user,
          agency: 'Kokek Konsulting',
        };
      }
      return user;
    }
  } catch (err) {
    console.error('Error reading auth user from storage:', err);
  }
  return null;
}

export function saveStoredUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch (err) {
    console.error('Error saving auth user to storage:', err);
  }
}
