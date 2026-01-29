import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { supabase } from '../supabase';

const API_URL = 'http://192.168.1.2:3001'; 

export default function PostAdScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    })();
  }, []);

  const handleSubmit = async () => {
    if (!title || !price || !region) {
      Alert.alert('Missing Info', 'Please fill all fields and pick a location.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user logged in");

      await axios.post(`${API_URL}/listings`, {
        owner_id: user.id,
        title,
        description: desc,
        price: parseFloat(price),
        latitude: region.latitude,
        longitude: region.longitude
      });

      Alert.alert('Success', 'Ad posted successfully!');
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Could not post ad.');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Sell an Item</Text>

      <TextInput label="Title (e.g. iPhone 12)" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput label="Price (₹)" value={price} keyboardType="numeric" onChangeText={setPrice} style={styles.input} />
      <TextInput label="Description" value={desc} onChangeText={setDesc} multiline numberOfLines={3} style={styles.input} />

      <Text style={styles.label}>Pick Location (Drag Map)</Text>
      <View style={styles.mapContainer}>
        {region && (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
          >
            <Marker coordinate={region} />
          </MapView>
        )}
      </View>
      <Text style={styles.hint}>Center the pin on your item location</Text>

      <Button mode="contained" onPress={handleSubmit} loading={loading} style={styles.btn}>
        Post Ad
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { marginBottom: 15, backgroundColor: '#fff' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
  mapContainer: { height: 200, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#ddd' },
  map: { flex: 1 },
  hint: { fontSize: 12, color: 'gray', textAlign: 'center', marginBottom: 15 },
  btn: { marginTop: 10, backgroundColor: '#6200ee' }
});