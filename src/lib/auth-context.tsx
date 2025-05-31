import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User, supabase } from './supabase'

type AuthContextType = {
  session: Session | null
  user: User | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, metadata?: { 
    name: string
    studentId: string
    phoneNumber: string 
  }) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsAdmin(session?.user?.email === 'admin@admin.com')
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsAdmin(session?.user?.email === 'admin@admin.com')
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const loginEmail = email.toLowerCase() === 'admin' ? 'admin@admin.com' : email

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    })
    if (error) throw error
  }

  const signUp = async (
    email: string, 
    password: string, 
    metadata?: { 
      name: string
      studentId: string
      phoneNumber: string 
    }
  ) => {
    if (email.toLowerCase() === 'admin' || email === 'admin@admin.com') {
      throw new Error('Cannot create account with admin email')
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ session, user, loading, isAdmin, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 