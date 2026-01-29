import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import axios from 'axios';
import { supabase } from '../supabase';

const API_URL = 'http://192.168.1.2:3001';

export default function OwnerDashboard() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const res = await axios.get(`${API_URL}/my-listings/${user.id}`);
        setStats(res.data);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (loading) return <ActivityIndicator style={{marginTop:50}} />;

  return (
    <View style={styles.container}>
      <Title style={styles.header}>My Sales Dashboard</Title>
      
      {stats.length === 0 ? (
        <Text>You haven't posted any ads yet.</Text>
      ) : (
        <FlatList
          data={stats}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Title>{item.title}</Title>
                <Paragraph>Price: ₹{item.price}</Paragraph>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Total Views:</Text>
                  <Text style={styles.statValue}>{item.views_count || 0}</Text>
                </View>
              </Card.Content>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  header: { marginBottom: 20, fontSize: 22, fontWeight: 'bold' },
  card: { marginBottom: 15 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, borderTopWidth: 1, borderColor: '#eee', paddingTop: 10 },
  statLabel: { color: 'gray' },
  statValue: { fontWeight: 'bold', color: '#6200ee', fontSize: 18 }
});