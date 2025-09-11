'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  role: 'ADMIN' | 'USER' | 'GUEST' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'ADMIN' | 'USER' | 'GUEST' | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // 관리자 이메일 확인 (role 우선, 이메일은 백업)
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'yangseonghwan119@gmail.com';
  const isAdmin = role === 'ADMIN' || user?.email === adminEmail;

  // Supabase 클라이언트를 한 번만 생성
  const supabase = typeof window !== 'undefined' ? createClient() : null;

  // 마운트 체크
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (!mounted || !supabase || isInitialized) return;

    // 초기 세션 체크
    const initializeAuth = async () => {
      setIsInitialized(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setSession(session);
          setUser(session.user);
          
          // 사용자 역할 확인 - Email 기반으로 조회 (NextAuth → Supabase 마이그레이션 대응)
          // 핵심: NextAuth의 User.id와 Supabase auth.users.id가 다르므로 email로 매칭
          const { data: userData, error: fetchError } = await supabase
            .from('User')
            .select('id, role, grade, status')
            .eq('email', session.user.email)
            .single();
          
          if (fetchError) {
            console.log('User fetch error:', fetchError);
          }
          
          if (userData) {
            console.log('Found existing user:', {
              email: session.user.email,
              role: userData.role,
              grade: userData.grade,
              dbId: userData.id,
              authId: session.user.id
            });
            
            // Role 설정
            setRole(userData.role);
            
            // Supabase Auth ID와 DB ID가 다른 경우 (NextAuth에서 마이그레이션된 사용자)
            // 향후 마이그레이션 스크립트로 일괄 처리 필요
            if (userData.id !== session.user.id) {
              console.log('ID mismatch detected - NextAuth legacy user:', {
                dbId: userData.id,
                authId: session.user.id
              });
            }
          } else {
            // 신규 사용자 생성 - Supabase Auth ID 사용
            console.log('Creating new user for:', session.user.email);
            const newRole = session.user.email === adminEmail ? 'ADMIN' : 'USER';
            
            // 새 사용자는 Supabase Auth ID를 사용
            const { error: insertError } = await supabase.from('User').insert({
              id: session.user.id, // Supabase Auth UUID
              email: session.user.email,
              name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
              role: newRole,
              grade: newRole === 'ADMIN' ? 'ADMIN' : 'GUEST',
              status: 'ACTIVE',
              points: 0,
              image: session.user.user_metadata.avatar_url || null
            });
            
            if (insertError) {
              console.error('Failed to create user:', insertError);
              // Unique constraint 에러인 경우 (이미 존재하는 ID)
              if (insertError.code === '23505') {
                console.log('User already exists with this ID, trying to fetch again...');
                const { data: retryData } = await supabase
                  .from('User')
                  .select('role')
                  .eq('email', session.user.email)
                  .single();
                
                if (retryData) {
                  setRole(retryData.role);
                }
              }
            } else {
              console.log('New user created successfully with role:', newRole);
              setRole(newRole);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Auth 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (session) {
        console.log('Session found:', session.user.email);
        setSession(session);
        setUser(session.user);
        
        // 사용자 역할 확인 - Email 기반으로 조회 (NextAuth → Supabase 마이그레이션 대응)
        const { data: userData } = await supabase
          .from('User')
          .select('id, role, grade, status')
          .eq('email', session.user.email)
          .single();
        
        if (userData) {
          console.log('Auth state change - Found user:', {
            email: session.user.email,
            role: userData.role,
            dbId: userData.id,
            authId: session.user.id
          });
          setRole(userData.role);
        } else {
          console.log('Auth state change - User not found in DB for:', session.user.email);
          // onAuthStateChange에서는 새 사용자 생성하지 않음 (초기화 시에만)
          setRole(null);
        }
      } else {
        setSession(null);
        setUser(null);
        setRole(null);
      }
      
      // 로그인 성공시 리다이렉트 (콜백 페이지와 이미 대시보드인 경우 스킵)
      if (event === 'SIGNED_IN' && 
          !window.location.pathname.includes('/auth/callback') &&
          !window.location.pathname.includes('/dashboard')) {
        console.log('Redirecting to dashboard after sign in');
        router.push('/dashboard');
      }
      
      // 로그아웃시 홈으로 이동
      if (event === 'SIGNED_OUT') {
        router.push('/');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router, adminEmail, supabase, isInitialized, mounted]);

  const signInWithGoogle = async () => {
    if (typeof window === 'undefined' || !supabase) {
      console.error('Supabase client not initialized');
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      
      // 디버깅용 로그
      console.log('OAuth initiated:', data);
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (typeof window === 'undefined' || !supabase) {
      console.error('Supabase client not initialized');
      return;
    }
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // SSR 중이거나 마운트되지 않은 경우 로딩 상태로 렌더링
  if (!mounted) {
    return (
      <AuthContext.Provider
        value={{
          user: null,
          session: null,
          loading: true,
          signInWithGoogle: async () => {},
          signOut: async () => {},
          isAdmin: false,
          role: null,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithGoogle,
        signOut,
        isAdmin,
        role,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}