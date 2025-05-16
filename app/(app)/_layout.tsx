import React from 'react';
import { View, Pressable, StyleSheet, Alert, Image, Text } from 'react-native';
import { Tabs, useSegments, useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { MaterialIcons } from '@expo/vector-icons';
import { auth } from '@/firebaseConfig';
import Camera from '@/components/CameraButton.jsx';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';


export default function TabLayout() {
  const segments = useSegments();
  const lastSegment = segments[segments.length - 1];
  const showFab = lastSegment !== 'market' && lastSegment !== 'cameraTab';
  const router = useRouter();
  const [ecoCoins, setEcoCoins] = useState(0);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDocRef = doc(db, 'Users', user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setEcoCoins(data.eco_points || 0);
        } else {
          setEcoCoins(0); 
        }
      } catch (error) {
        console.error('Error fetching ecoCoins:', error);
        setEcoCoins(0);
      }
    } else {
      setEcoCoins(0);
    }
  });

  return () => unsubscribe(); 
}, []);


  const handleProfile = () => {
    router.navigate('/(app)/profile')
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#2563eb',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarStyle: {
            backgroundColor: '#f1f5f9',
            borderTopWidth: 0,
            elevation: 5,
            height: 60,
          },
          headerTitle: ()=>(
            <View/>
          ),
          headerLeft: () => (
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          ),
          headerRight: () => (
          <View style={styles.headerRightContainer}>
            <View style={styles.coinBox}>
              <Image source={require('@/assets/images/coin.png')} style={styles.coinIcon} />
              <Text style={styles.coinText}>{ecoCoins}</Text>
            </View>

            <Pressable onPress={handleProfile} style={styles.profileButton}>
              <Image
                source={require('@/assets/images/avatar.png')}
                style={styles.profileAvatar}
              />
            </Pressable>
          </View>
          ),
        }}
      >
        
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <FontAwesome size={26} name="home" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(upload)"
          options={{
            title: 'Upload Image',
            tabBarIcon: ({color}) =>(
              <FontAwesome size={28} name="camera" />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Map',
            tabBarIcon: ({ color }) => (
              <FontAwesome6 size={26} name="map" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="user-circle" size={26} color={color} />
            ),
            href: null,
          }}
        />
        <Tabs.Screen
          name="market"
          options={{
            title: 'Market',
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="shopping-cart" size={26} color={color} />
            ),
            href: null,
          }}
        />
        <Tabs.Screen
          name="plants"
          options={{
            title: 'Plant',
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="tree" size={26} color={color} />
            ),
            href: null,
          }}
        />
      </Tabs>

      {showFab && (
        <View style={styles.fabContainer}>
          <Camera />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 25,
    right: 25,
  },
  logoutButton: {
    paddingRight: 20,
    alignItems: "center",
  },
  logoContainer: {
    paddingLeft: 10,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  logo: {
    width: 100, 
    height: 100,
  },
  headerRightContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  marginRight: 15,
},

profileButton: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 20,
  borderWidth: 2,
  borderColor: '#2563eb',
},

profileAvatar: {
  width: 24,
  height: 24,
  borderRadius: 12,
},

profileText: {
  fontSize: 14,
  color: '#1e293b',
  fontWeight: '600',
},

coinBox: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fffbea',
  paddingVertical: 4,
  paddingHorizontal: 10,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: '#facc15',
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 1 },
  shadowRadius: 2,
  elevation: 2,
},

coinIcon: {
  width: 20,
  height: 20,
  marginRight: 6,
},

coinText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#ca8a04',
},

});


