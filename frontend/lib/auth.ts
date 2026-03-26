// Authentication utility for frontend with backend integration

const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
}

const SESSION_KEY = 'asset-manager-session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

interface Session {
  access_token: string;
  token_type: string;
  user: User;
  loginTime: number;
  lastActivity: number;
}

export class AuthService {
  // Login with backend API
  static async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Extract username from email (e.g., admin@company.com -> admin)
      const username = email.split('@')[0];

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Login failed' }));
        return { success: false, error: error.detail || 'Invalid email or password' };
      }

      const data = await response.json();

      const session: Session = {
        access_token: data.access_token,
        token_type: data.token_type,
        user: data.user,
        loginTime: Date.now(),
        lastActivity: Date.now(),
      };

      // Save session to localStorage
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  // Get auth token for API calls
  static getToken(): string | null {
    const session = this.getSession();
    return session?.access_token || null;
  }

  // Logout user
  static logout(): void {
    localStorage.removeItem(SESSION_KEY);
  }

  // Check if user is logged in and session is valid
  static isAuthenticated(): boolean {
    const session = this.getSession();
    if (!session) return false;

    // Check if session has expired
    const now = Date.now();
    const timeSinceLastActivity = now - session.lastActivity;

    if (timeSinceLastActivity > SESSION_TIMEOUT) {
      this.logout();
      return false;
    }

    // Update last activity
    this.updateActivity();
    return true;
  }

  // Get current session
  static getSession(): Session | null {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (!sessionData) return null;
      return JSON.parse(sessionData) as Session;
    } catch (error) {
      console.error('Failed to parse session:', error);
      return null;
    }
  }

  // Get current user
  static getCurrentUser(): User | null {
    const session = this.getSession();
    return session?.user || null;
  }

  // Update last activity time
  static updateActivity(): void {
    const session = this.getSession();
    if (session) {
      session.lastActivity = Date.now();
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  }

  // Get session info for display
  static getSessionInfo(): { loginTime: Date; lastActivity: Date } | null {
    const session = this.getSession();
    if (!session) return null;

    return {
      loginTime: new Date(session.loginTime),
      lastActivity: new Date(session.lastActivity),
    };
  }
}
