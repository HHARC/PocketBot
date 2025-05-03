// src/screens/HomeScreen.js
import React from 'react';
import { SafeAreaView, StyleSheet, StatusBar, View, Text, TouchableOpacity } from 'react-native';
import ChatInterface from '../components/ChatInterface';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = () => {
  return (
    <LinearGradient 
      colors={['#6A11CB', '#2575FC']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.emoji}>💬</Text>
            <Text style={styles.title}>PocketBot</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.welcomeCard}>
          <BlurView intensity={30} tint="light" style={styles.blurContainer}>
            <Text style={styles.welcomeTitle}>Hey there! 👋</Text>
            <Text style={styles.welcomeText}>
              I'm your AI assistant. How can I help you today?
            </Text>
          </BlurView>
        </View>
        
        <View style={styles.chatWrapper}>
          <ChatInterface />
        </View>
        
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="create-outline" size={22} color="#fff" />
            <Text style={styles.actionText}>New Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="help-circle-outline" size={22} color="#fff" />
            <Text style={styles.actionText}>Help</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="star-outline" size={22} color="#fff" />
            <Text style={styles.actionText}>Favorites</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 5,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 30,
    marginRight: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  settingsButton: {
    padding: 8,
  },
  welcomeCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    height: 120,
  },
  blurContainer: {
    padding: 20,
    height: '100%',
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
  },
  chatWrapper: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#ffffff',
    marginLeft: 6,
    fontWeight: '600',
  }
});

export default HomeScreen;