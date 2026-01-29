import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Modal, ScrollView, Alert } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Text, FAB, Provider as PaperProvider, Button, Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import * as Location from 'expo-location';
import axios from 'axios';
import { supabase } from './supabase';

import AuthScreen from './screens/AuthScreen';
import PostAdScreen from './screens/PostAdScreen';
import OwnerDashboard from './screens/OwnerDashboard';

const API_URL = 'http://192.168.1.2:3001';

const Stack = createStackNavigator();

function HomeScreen() {
  const navigation = useNavigation();
  const [listings, setListings] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [location, setLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [selectedAd, setSelectedAd] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    })();
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await axios.get(`${API_URL}/listings`);
      setListings(res.data);
    } catch (e) { console.log("Network Error"); }
  };

  const showSuggestions = async () => {
    try {
      const res = await axios.get(`${API_URL}/suggestions`);
      setSuggestions(res.data);
      setModalVisible(true);
    } catch (e) { console.log(e); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const onPinPress = (item) => {
    setSelectedAd(item); 
    axios.post(`${API_URL}/listings/${item.id}/view`); 
  };

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={location}
          showsUserLocation={true}
          onPress={() => setSelectedAd(null)} 
        >
          {listings.map((item) => (
            <Marker
              key={item.id}
              coordinate={{ latitude: item.latitude, longitude: item.longitude }}
              pinColor="red"
              onPress={() => onPinPress(item)}
            />
          ))}
        </MapView>
      )}

      <Button mode="contained" style={styles.dashboardBtn} onPress={() => navigation.navigate('Dashboard')}>
        My Stats
      </Button>

      <Button mode="contained" icon="star" style={styles.suggestionBtn} onPress={showSuggestions}>
        Trending
      </Button>

      <Button mode="contained" color="red" style={styles.logoutBtn} onPress={handleLogout}>
        Logout
      </Button>

      <FAB style={styles.fab} icon="plus" label="Sell" onPress={() => navigation.navigate('PostAd')} />

      {selectedAd && (
        <View style={styles.bottomCard}>
          <View>
            <Title style={{ fontSize: 18 }}>{selectedAd.title}</Title>
            <Paragraph style={{ color: 'gray' }}>{selectedAd.description || 'No description'}</Paragraph>
            <Text style={{ color: 'green', fontWeight: 'bold', fontSize: 18, marginTop: 5 }}>
              ₹{selectedAd.price}
            </Text>
          </View>
          <Button mode="outlined" onPress={() => setSelectedAd(null)}>
            Close
          </Button>
        </View>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Title>Trending Near You</Title>
            <ScrollView>
              {suggestions.map((item) => (
                <Card key={item.id} style={{ marginVertical: 5 }}>
                  <Card.Content>
                    <Title>{item.title}</Title>
                    <Paragraph>₹{item.price} - {item.views_count} views</Paragraph>
                  </Card.Content>
                </Card>
              ))}
            </ScrollView>
            <Button onPress={() => setModalVisible(false)}>Close</Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (loading) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {session ? (
            <>
              <Stack.Screen name="Map" component={HomeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="PostAd" component={PostAdScreen} />
              <Stack.Screen name="Dashboard" component={OwnerDashboard} />
            </>
          ) : (
            <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#6200ee' },
  dashboardBtn: { position: 'absolute', top: 50, right: 20, backgroundColor: 'black' },
  suggestionBtn: { position: 'absolute', bottom: 20, left: 20, backgroundColor: '#ff9800' },
  logoutBtn: { position: 'absolute', top: 50, left: 20, backgroundColor: '#d32f2f' },

  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, height: '50%' },

  bottomCard: {
    position: 'absolute',
    bottom: 90, 
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
});