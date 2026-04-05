import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'hospital';

export interface AuthUser {
  username: string;
  role: UserRole;
  hospitalName?: string;
  hospitalId?: string; // Unique ID assigned by server on registration
}

interface StoredCredential {
  username: string;
  password: string;
  role: UserRole;
  hospitalName?: string;
  hospitalId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => { success: boolean; error?: string };
  register: (username: string, password: string, hospitalName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  updateHospitalId: (hospitalId: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Default admin credential (not removable)
const DEFAULT_ADMIN: StoredCredential = { username: 'admin', password: 'admin123', role: 'admin' };

const API_URL = 'http://localhost:5000/api';

function getStoredCredentials(): StoredCredential[] {
  try {
    const stored = localStorage.getItem('registered_users');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveStoredCredentials(creds: StoredCredential[]) {
  localStorage.setItem('registered_users', JSON.stringify(creds));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = sessionStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const updateHospitalId = (hospitalId: string) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, hospitalId };
      sessionStorage.setItem('auth_user', JSON.stringify(updated));
      return updated;
    });
  };

  const login = (username: string, password: string) => {
    // Check admin first
    if (
      DEFAULT_ADMIN.username.toLowerCase() === username.toLowerCase() &&
      DEFAULT_ADMIN.password === password
    ) {
      const authUser: AuthUser = { username: DEFAULT_ADMIN.username, role: 'admin' };
      setUser(authUser);
      sessionStorage.setItem('auth_user', JSON.stringify(authUser));
      return { success: true };
    }

    // Check registered hospital users
    const registeredUsers = getStoredCredentials();
    const found = registeredUsers.find(
      c => c.username.toLowerCase() === username.toLowerCase() && c.password === password
    );

    if (found) {
      const authUser: AuthUser = {
        username: found.username,
        role: found.role,
        hospitalName: found.hospitalName,
        hospitalId: found.hospitalId,
      };
      setUser(authUser);
      sessionStorage.setItem('auth_user', JSON.stringify(authUser));
      return { success: true };
    }

    return { success: false, error: 'Invalid username or password' };
  };

  const register = async (username: string, password: string, hospitalName: string): Promise<{ success: boolean; error?: string }> => {
    if (!username.trim() || !password.trim() || !hospitalName.trim()) {
      return { success: false, error: 'All fields are required' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    if (username.toLowerCase() === 'admin') {
      return { success: false, error: 'This username is reserved' };
    }

    const registeredUsers = getStoredCredentials();
    const exists = registeredUsers.some(
      c => c.username.toLowerCase() === username.toLowerCase()
    );

    if (exists) {
      return { success: false, error: 'Username already exists. Please choose another.' };
    }

    // Register with backend to get a unique hospital ID & send global model
    let hospitalId = '';
    try {
      const response = await fetch(`${API_URL}/fl/register-hospital`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), hospitalName: hospitalName.trim() }),
      });
      if (response.ok) {
        const data = await response.json();
        hospitalId = data.hospitalId || '';
      }
    } catch (err) {
      console.warn('Backend unavailable — proceeding with offline registration.');
      hospitalId = `HOSP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    }

    const newUser: StoredCredential = {
      username: username.trim(),
      password,
      role: 'hospital',
      hospitalName: hospitalName.trim(),
      hospitalId,
    };

    registeredUsers.push(newUser);
    saveStoredCredentials(registeredUsers);

    // Auto-login after registration
    const authUser: AuthUser = {
      username: newUser.username,
      role: 'hospital',
      hospitalName: newUser.hospitalName,
      hospitalId,
    };
    setUser(authUser);
    sessionStorage.setItem('auth_user', JSON.stringify(authUser));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, updateHospitalId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
