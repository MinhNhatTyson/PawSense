import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useAuth } from '../contexts/AuthContext'

export function EditProfileScreen({ navigation }: any) {
  const { user, updateProfile, isLoading } = useAuth()
  const [fullName, setFullName] = useState(user?.profile?.fullName || '')
  const [phone, setPhone] = useState(user?.profile?.phone || '')
  const [clinicName, setClinicName] = useState(user?.profile?.clinicName || '')
  const [address, setAddress] = useState(user?.profile?.address || '')
  const [specialization, setSpecialization] = useState(user?.profile?.specialization || '')

  const handleSave = async () => {
    try {
      await updateProfile({
        fullName: fullName || undefined,
        phone: phone || undefined,
        clinicName: clinicName || undefined,
        address: address || undefined,
        specialization: specialization || undefined,
      })
      Alert.alert('Success', 'Profile updated successfully')
      navigation.goBack()
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update profile')
    }
  }

  if (!user) return null

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
            editable={!isLoading}
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            placeholder="+1 (555) 000-0000"
            placeholderTextColor="#999"
            value={phone}
            onChangeText={setPhone}
            editable={!isLoading}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            placeholder="123 Main St, City"
            placeholderTextColor="#999"
            value={address}
            onChangeText={setAddress}
            editable={!isLoading}
          />
        </View>

        {user.role === 'VET' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Information</Text>

            <Text style={styles.label}>Clinic Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your clinic name"
              placeholderTextColor="#999"
              value={clinicName}
              onChangeText={setClinicName}
              editable={!isLoading}
            />

            <Text style={styles.label}>Specialization</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Feline Medicine"
              placeholderTextColor="#999"
              value={specialization}
              onChangeText={setSpecialization}
              editable={!isLoading}
            />
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save Changes</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={styles.buttonSecondaryText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  actions: {
    gap: 12,
  },
  button: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: '#2d3748',
    fontSize: 14,
    fontWeight: '600',
  },
})
