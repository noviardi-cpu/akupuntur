
import { UserAccount } from '../types';
import { db } from './db';

// Ensure DB is initialized
export const getUsers = (): UserAccount[] => {
  return db.users.getAll();
};

export const saveUser = (user: UserAccount): { success: boolean, message: string } => {
  // Simple validation
  if (!user.username || !user.password) {
      return { success: false, message: 'Username and password are required.' };
  }
  
  const success = db.users.add(user);
  if (success) {
      return { success: true, message: 'User successfully saved to database.' };
  } else {
      return { success: false, message: 'Username already exists.' };
  }
};

export const deleteUser = (username: string): { success: boolean, message: string } => {
  if (username === 'admin') {
      return { success: false, message: 'Cannot delete the main admin account.' };
  }
  
  const success = db.users.delete(username);
  if (success) {
      return { success: true, message: 'User deleted from database.' };
  } else {
      return { success: false, message: 'User not found.' };
  }
};

export const login = (username: string, password: string): UserAccount | null => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  return user || null;
};
