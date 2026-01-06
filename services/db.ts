
import { UserAccount, SavedPatient } from '../types';

const DB_KEY_USERS = 'tcm_pro_users';
const DB_KEY_PATIENTS = 'tcm_pro_patients';

// Default Seed Data - Password cleared for temporary access
export const DEFAULT_ADMIN: UserAccount = {
  username: 'admin',
  password: '', 
  role: 'admin',
  createdAt: Date.now()
};

export const db = {
  users: {
    getAll: (): UserAccount[] => {
      if (typeof window === 'undefined') return [];
      try {
        const stored = localStorage.getItem(DB_KEY_USERS);
        if (!stored) {
            const initial = [DEFAULT_ADMIN];
            localStorage.setItem(DB_KEY_USERS, JSON.stringify(initial));
            return initial;
        }
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
            const initial = [DEFAULT_ADMIN];
            localStorage.setItem(DB_KEY_USERS, JSON.stringify(initial));
            return initial;
        }
        return parsed;
      } catch (e) {
        return [DEFAULT_ADMIN];
      }
    },
    saveAll: (users: UserAccount[]) => {
      localStorage.setItem(DB_KEY_USERS, JSON.stringify(users));
    },
    add: (user: UserAccount): boolean => {
       const users = db.users.getAll();
       if (users.some(u => u.username.toLowerCase() === user.username.toLowerCase())) return false;
       db.users.saveAll([...users, user]);
       return true;
    },
    delete: (username: string): boolean => {
        const users = db.users.getAll();
        const filtered = users.filter(u => u.username !== username);
        if (filtered.length === users.length) return false;
        db.users.saveAll(filtered);
        return true;
    }
  },
  patients: {
    getAll: (): SavedPatient[] => {
      if (typeof window === 'undefined') return [];
      try {
        const stored = localStorage.getItem(DB_KEY_PATIENTS);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    },
    saveAll: (patients: SavedPatient[]) => {
      localStorage.setItem(DB_KEY_PATIENTS, JSON.stringify(patients));
    },
    add: (patient: SavedPatient) => {
      const patients = db.patients.getAll();
      db.patients.saveAll([patient, ...patients]);
    },
    delete: (id: string) => {
      const patients = db.patients.getAll();
      db.patients.saveAll(patients.filter(p => p.id !== id));
    }
  }
};
