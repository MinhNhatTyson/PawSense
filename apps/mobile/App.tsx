import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from './src/contexts/AuthContext'
import { RootNavigator } from './src/navigation/RootNavigator'

export default function App() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </>
  )
}
