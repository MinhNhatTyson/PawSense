import React, { useState } from 'react'
import {
  TextInput as RNTextInput,
  TextInputProps,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
} from 'react-native'
import { Colors, Typography, Spacing, Radius } from '../theme'

interface Props extends TextInputProps {
  secureToggle?: boolean  // show/hide password eye
}

export function TextInput({ secureToggle, secureTextEntry, style, ...props }: Props) {
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(false)

  const isSecure = secureTextEntry && !visible

  return (
    <View style={styles.wrap}>
      <RNTextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          secureToggle && styles.inputWithToggle,
          style,
        ]}
        placeholderTextColor={Colors.textLight}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        secureTextEntry={isSecure}
        autoCapitalize="none"
        autoCorrect={false}
        {...props}
      />
      {secureToggle && (
        <TouchableOpacity
          style={styles.eyeBtn}
          onPress={() => setVisible(v => !v)}
          activeOpacity={0.7}
        >
          <Text style={styles.eyeText}>{visible ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  input: {
    height: 50,
    backgroundColor: Colors.ivory,
    borderWidth: 1.5,
    borderColor: Colors.warmWhite,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontFamily: 'System',
  },
  inputFocused: {
    borderColor: Colors.greenSage,
    backgroundColor: Colors.white,
  },
  inputWithToggle: {
    paddingRight: Spacing['3xl'] + Spacing.lg,
  },
  eyeBtn: {
    position: 'absolute',
    right: Spacing.lg,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeText: {
    fontSize: Typography.sm,
    color: Colors.greenSage,
    fontWeight: '500',
  },
})