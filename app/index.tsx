import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '@/firebaseConfig';
import { collection, doc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, updateProfile  } from 'firebase/auth';

function SignInScreen() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [number, setNumber] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: any) => {
      if (user) {
        console.log("Previously Signed In");
        router.push('/(app)');  // Replace with your main navigation screen
      }
    });
    return unsubscribe;
  }, []);

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        Alert.alert('Signed in successfully!');
        router.push('/(app)');  // Replace with your main navigation screen
      })
      .catch(error => Alert.alert('Sign-In Error', error.message));
  };

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      await updateProfile(userCredential.user, {
        displayName: name,
      });
      
      await setDoc(doc(db, 'Users', userId), {
        email,
        name,
        number,
        createdAt: new Date()
      });
      
      Alert.alert('Account created successfully!');
      router.navigate('/(app)');
    } catch (error) {
      Alert.alert('Sign-Up Error', error.message);
    }
  };

  return isSignUp ? (
    <View style={styles.container}>
      <Text style={styles.title}>My App</Text>
      <Text style={styles.subtitle}>{isSignUp ? 'Create an Account' : 'Sign In to Continue'}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={number}
        onChangeText={setNumber}
      />
      <Button 
        title="SignUp" 
        onPress={handleSignUp}
      />

      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.toggleText}>
          {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  ) : (
    <View style={styles.container}>
      <Text style={styles.title}>My App</Text>
      <Text style={styles.subtitle}>{isSignUp ? 'Create an Account' : 'Sign In to Continue'}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Button 
        title="Sign In"
        onPress={handleSignIn} 
      />

      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.toggleText}>
          {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: 'gray',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  toggleText: {
    marginTop: 15,
    fontSize: 16,
    color: 'blue',
    textAlign: 'center',
  },
});

export default SignInScreen;