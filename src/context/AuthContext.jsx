import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseclient'

const AuthContext = createContext(null)

export const AuthProvider = ({children}) => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        setSession(data.session ?? null)
      } catch (err) {
        console.error('Error fetching session:', err)
      } finally {
        setLoading(false)
      }
    }

    initializeSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUpNewUser = async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })

      if (error) {
        console.error('Error signing up:', error.message)
        return { success: false, error }
      }
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    }
  }

  const signInUser = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error }
    }

    return { success: true, data }
  }

  const signOutUser = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error }
    }

    return { success: true }
  }

  return (
    <AuthContext.Provider value={{ session, loading, signUpNewUser, signInUser, signOutUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const UserAuth = () => {
  return useContext(AuthContext)
}