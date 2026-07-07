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
import { CatListScreen } from '../screens/cats/CatListScreen'
import { CatFormScreen } from '../screens/cats/CatFormScreen'
import { CatDetailScreen } from '../screens/cats/CatDetailScreen'
import { MedicineListScreen } from '../screens/medicines/MedicineListScreen'
import { MedicineDetailScreen } from '../screens/medicines/MedicineDetailScreen'
import { BreedRecognitionScreen } from '../screens/cats/BreedRecognitionScreen' 
import { SymptomCheckerScreen } from '../screens/diagnosis/SymptomCheckerScreen'
import { FoodRecommendationScreen } from '../screens/nutrition/FoodRecommendationScreen'
import { EmergencyGuideListScreen } from '../screens/emergency/EmergencyGuideListScreen'
import { EmergencyGuideDetailScreen } from '../screens/emergency/EmergencyGuideDetailScreen'
import { HealthTrackingScreen } from '../screens/cats/HealthTrackingScreen'
import { VetDirectoryScreen } from '../screens/appointments/VetDirectoryScreen'
import { VetAvailabilityScreen } from '../screens/appointments/VetAvailabilityScreen'
import { MyAppointmentsScreen } from '../screens/appointments/MyAppointmentsScreen'

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
        options={{ headerShown: false, title: 'My Profile' }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false, title: 'Edit Profile' }}
      />
      <Stack.Screen
        name="EmergencyGuideList"
        component={EmergencyGuideListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EmergencyGuideDetail"
        component={EmergencyGuideDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ headerShown: false, title: 'Change Password' }}
      />
      <Stack.Screen
        name="CatList"
        component={CatListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CatForm"
        component={CatFormScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CatDetail"
        component={CatDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HealthTracking"
        component={HealthTrackingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BreedRecognition"
        component={BreedRecognitionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MedicineList"
        component={MedicineListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MedicineDetail"
        component={MedicineDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SymptomChecker"
        component={SymptomCheckerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FoodRecommendation"
        component={FoodRecommendationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="VetDirectory" component={VetDirectoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="VetAvailability" component={VetAvailabilityScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MyAppointments" component={MyAppointmentsScreen} options={{ headerShown: false }} />
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