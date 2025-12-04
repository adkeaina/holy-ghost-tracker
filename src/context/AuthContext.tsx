import { createContext, ReactNode, useContext } from "react";

export interface Profile {
  email: string;
}

interface AuthContextType {
  profile: Profile | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  profile: Profile | null;
  isLoading: boolean;
}

export const AuthProvider = ({
  children,
  profile,
  isLoading,
}: AuthProviderProps) => {
  return (
    <AuthContext.Provider value={{ profile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
