import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Title } from 'react-native-paper';
import { supabase } from '../supabase';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);

    if (isLoginMode) {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) Alert.alert('Login Failed', error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        Alert.alert('Signup Error', error.message);
      } else {
        Alert.alert('Success', 'Account created! You are logged in.');
      }
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>
        {isLoginMode ? 'Welcome Back!' : 'Create Account'}
      </Title>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button 
        mode="contained" 
        onPress={handleAuth} 
        loading={loading} 
        style={styles.btn}
      >
        {isLoginMode ? 'Log In' : 'Sign Up'}
      </Button>
      
      <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)}>
        <Text style={styles.switchText}>
          {isLoginMode 
            ? "Don't have an account? Sign Up" 
            : "Already have an account? Log In"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { textAlign: 'center', marginBottom: 20, fontSize: 24, fontWeight: 'bold' },
  input: { marginBottom: 15, backgroundColor: '#fff' },
  btn: { marginBottom: 20, padding: 5, backgroundColor: '#6200ee' },
  switchText: { textAlign: 'center', color: '#6200ee', marginTop: 10, fontWeight: 'bold' }
});