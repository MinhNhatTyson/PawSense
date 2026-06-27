import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useAuth } from '../contexts/AuthContext'

import { LoginScreen } from '../screens/LoginScreen'
import { RegisterScreen } from '../screens/RegisterScreen'
import { ProfileScreen } from '../screens/ProfileScreen'
import { EditProfileScreen } from '../screens/EditProfileScreen'
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen'

import { Colors, Typography } from '../theme'

const Stack = createNativeStackNavigator()

// ── Shared header options ─────────────────────────────────────────────────────

const sharedHeaderOptions = {
  headerStyle: {
    backgroundColor: Colors.greenDeep,
  },
  headerTintColor: Colors.cream,
  headerTitleStyle: {
    fontFamily: 'System',
    fontSize: Typography.lg,
    fontWeight: '500' as const,
    color: Colors.cream,
    letterSpacing: -0.2,
  },
  headerBackTitleVisible: false,
  headerShadowVisible: false,
}

// ── Auth stack (unauthenticated) ──────────────────────────────────────────────

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          ...sharedHeaderOptions,
          headerShown: true,
          title: '',
          // transparent back button over the dark hero
        }}
      />
    </Stack.Navigator>
  )
}

// ── App stack (authenticated) ─────────────────────────────────────────────────

function AppStack() {
  return (
    <Stack.Navigator screenOptions={sharedHeaderOptions}>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,    // Profile has its own hero header
          title: 'My Profile',
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerShown: false,    // EditProfile has its own dark header
          title: 'Edit Profile',
        }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{
          headerShown: false,    // ChangePassword has its own dark header
          title: 'Change Password',
        }}
      />
    </Stack.Navigator>
  )
}

// ── Loading screen ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={Colors.greenSage} />
    </View>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────

export function RootNavigator() {
  const { token, isInitializing } = useAuth()

  if (isInitializing) return <LoadingScreen />

  return (
    <NavigationContainer>
      {token ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
})