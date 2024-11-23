import { create } from 'zustand';
import { JwtPayload, jwtDecode } from 'jwt-decode';
import { persist } from 'zustand/middleware';

interface AuthState {
    isLoggedIn: boolean;
    session: {
        userId: string | null; 
        isOrganizer: boolean | null;
    };
    accessToken: string | null;
    login: (accessToken: string) => void;
    logout: () => void;
    autoLogout: () => void;
}

interface CustomJwtPayload extends JwtPayload {
    userId: string;
    isOrganizer: boolean;
}

const useAuthStore = create<AuthState>()(
    persist(
      (set, get) => ({
        isLoggedIn: false,
        session: {
          userId: null,
          isOrganizer: null,
        },
        accessToken: null,
  
        // Login function
        login: (accessToken: string) => {
          try {
            const decodedToken = jwtDecode<CustomJwtPayload>(accessToken);
  
            // Store token and decoded values
            set({
              isLoggedIn: true,
              accessToken,
              session: {
                userId: decodedToken.userId,
                isOrganizer: decodedToken.isOrganizer,
              },
            });
  
            // Setup auto-logout when token expires
            const expirationTime = decodedToken.exp ? decodedToken.exp * 1000 - Date.now() : 0;
            if (expirationTime > 0) {
              setTimeout(() => {
                get().autoLogout();
              }, expirationTime);
            }
          } catch (error) {
            console.error('Invalid token:', error);
            get().logout();
          }
        },
  
        // Logout function
        logout: () => {
          set({
            isLoggedIn: false,
            accessToken: null,
            session: {
              userId: null,
              isOrganizer: null,
            },
          });
        },
  
        // Auto-logout when token expires
        autoLogout: () => {
          console.warn('Session expired. Logging out...');
          get().logout();
        },
      }),
      {
        name: 'auth-storage', // Name of the key in localStorage
      }
    )
  );

export default useAuthStore;
