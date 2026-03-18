// Simple authentication utility for frontend
// NOTE: This is a frontend-only implementation for demo purposes
// In production, use proper backend authentication with JWT/OAuth

export interface User {
  email: string;
  name: string;
  role: string;
}

// Demo users for IT Division (all are admins)
const DEMO_USERS = [
  { email: 'admin@company.com', password: 'admin123', name: 'Admin User', role: 'IT Admin' },
  { email: 'it@company.com', password: 'it123', name: 'IT Staff', role: 'IT Admin' },
  { email: 'tech@company.com', password: 'tech123', name: 'Tech Support', role: 'IT Admin' },
];

const SESSION_KEY = 'asset-manager-session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

interface Session {
  user: User;
  loginTime: number;
  lastActivity: number;
}

export class AuthService {
  // Validate credentials (frontend demo only)
  static login(email: string, password: string): { success: boolean; user?: User; error?: string } {
    const user = DEMO_USERS.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    const session: Session = {
      user: { email: user.email, name: user.name, role: user.role },
      loginTime: Date.now(),
      lastActivity: Date.now(),
    };

    // Save session to localStorage
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    
    return { success: true, user: session.user };
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
