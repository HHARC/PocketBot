// src/screens/SettingsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(false);
  
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    try {
      const notifications = await AsyncStorage.getItem('notificationsEnabled');
      const darkMode = await AsyncStorage.getItem('darkModeEnabled');
      const biometrics = await AsyncStorage.getItem('biometricsEnabled');
      const sync = await AsyncStorage.getItem('syncEnabled');
      
      setNotificationsEnabled(notifications === 'true');
      setDarkModeEnabled(darkMode === 'true');
      setBiometricsEnabled(biometrics === 'true');
      setSyncEnabled(sync === 'true');
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };
  
  const saveSettings = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  };
  
  const toggleNotifications = (value) => {
    setNotificationsEnabled(value);
    saveSettings('notificationsEnabled', value);
  };
  
  const toggleDarkMode = (value) => {
    setDarkModeEnabled(value);
    saveSettings('darkModeEnabled', value);
  };
  
  const toggleBiometrics = (value) => {
    setBiometricsEnabled(value);
    saveSettings('biometricsEnabled', value);
  };
  
  const toggleSync = (value) => {
    setSyncEnabled(value);
    saveSettings('syncEnabled', value);
  };
  
  const clearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all your financial data? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('transactions');
              await AsyncStorage.removeItem('balance');
              Alert.alert('Success', 'All financial data has been cleared.');
            } catch (e) {
              console.error('Failed to clear data', e);
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ]
    );
  };
  
  return (
    <LinearGradient
      colors={['#6A11CB', '#2575FC']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>⚙️ Settings</Text>
        </View>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <BlurView intensity={25} tint="light" style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Ionicons name="person" size={40} color="#fff" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>User</Text>
              <Text style={styles.profileEmail}>user@example.com</Text>
            </View>
            <TouchableOpacity style={styles.editProfileButton}>
              <Ionicons name="create-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </BlurView>
          
          <BlurView intensity={25} tint="light" style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="options-outline" size={20} color="#fff" style={styles.sectionIcon} />
              App Settings
            </Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLabelContainer}>
                <Ionicons name="notifications-outline" size={20} color="#fff" style={styles.settingIcon} />
                <Text style={styles.settingLabel}>Daily Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: "rgba(255, 255, 255, 0.1)", true: "rgba(128, 255, 219, 0.5)" }}
                thumbColor={notificationsEnabled ? "#80FFDB" : "#f4f3f4"}
                ios_backgroundColor="rgba(255, 255, 255, 0.1)"
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLabelContainer}>
                <Ionicons name="moon-outline" size={20} color="#fff" style={styles.settingIcon} />
                <Text style={styles.settingLabel}>Dark Mode</Text>
              </View>
              <Switch
                value={darkModeEnabled}
                onValueChange={toggleDarkMode}
                trackColor={{ false: "rgba(255, 255, 255, 0.1)", true: "rgba(128, 255, 219, 0.5)" }}
                thumbColor={darkModeEnabled ? "#80FFDB" : "#f4f3f4"}
                ios_backgroundColor="rgba(255, 255, 255, 0.1)"
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLabelContainer}>
                <Ionicons name="finger-print-outline" size={20} color="#fff" style={styles.settingIcon} />
                <Text style={styles.settingLabel}>Biometric Authentication</Text>
              </View>
              <Switch
                value={biometricsEnabled}
                onValueChange={toggleBiometrics}
                trackColor={{ false: "rgba(255, 255, 255, 0.1)", true: "rgba(128, 255, 219, 0.5)" }}
                thumbColor={biometricsEnabled ? "#80FFDB" : "#f4f3f4"}
                ios_backgroundColor="rgba(255, 255, 255, 0.1)"
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLabelContainer}>
                <Ionicons name="cloud-outline" size={20} color="#fff" style={styles.settingIcon} />
                <Text style={styles.settingLabel}>Cloud Sync</Text>
              </View>
              <Switch
                value={syncEnabled}
                onValueChange={toggleSync}
                trackColor={{ false: "rgba(255, 255, 255, 0.1)", true: "rgba(128, 255, 219, 0.5)" }}
                thumbColor={syncEnabled ? "#80FFDB" : "#f4f3f4"}
                ios_backgroundColor="rgba(255, 255, 255, 0.1)"
              />
            </View>
          </BlurView>
          
          <BlurView intensity={25} tint="light" style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="save-outline" size={20} color="#fff" style={styles.sectionIcon} />
              Data Management
            </Text>
            
            <TouchableOpacity style={styles.actionButton} onPress={clearAllData}>
              <View style={styles.actionButtonContent}>
                <Ionicons name="trash-outline" size={20} color="#FF6B8B" />
                <Text style={[styles.actionButtonText, styles.dangerText]}>Clear All Data</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionButtonContent}>
                <Ionicons name="download-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Export Transactions</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionButtonContent}>
                <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Backup to Cloud</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>
          </BlurView>
          
          <BlurView intensity={25} tint="light" style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="information-circle-outline" size={20} color="#fff" style={styles.sectionIcon} />
              About
            </Text>
            
            <View style={styles.aboutContainer}>
              <View style={styles.appInfoRow}>
                <Text style={styles.appInfoLabel}>Version</Text>
                <Text style={styles.appInfoValue}>PocketBot v1.0</Text>
              </View>
              
              <View style={styles.appInfoRow}>
                <Text style={styles.appInfoLabel}>Build</Text>
                <Text style={styles.appInfoValue}>2023.04.20</Text>
              </View>
              
              <Text style={styles.appDescription}>
                A beautiful app to manage your finances with ease using natural language processing.
              </Text>
              
              <View style={styles.buttonGroup}>
                <TouchableOpacity style={styles.outlineButton}>
                  <Ionicons name="help-circle-outline" size={18} color="#fff" />
                  <Text style={styles.outlineButtonText}>Help</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.outlineButton}>
                  <Ionicons name="star-outline" size={18} color="#fff" />
                  <Text style={styles.outlineButtonText}>Rate App</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.outlineButton}>
                  <Ionicons name="share-social-outline" size={18} color="#fff" />
                  <Text style={styles.outlineButtonText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
          
          {/* Bottom spacing */}
          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileEmail: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  editProfileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 10,
  },
  settingLabel: {
    color: '#fff',
    fontSize: 16,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  dangerText: {
    color: '#FF6B8B',
  },
  aboutContainer: {
    paddingTop: 5,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  appInfoLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  appInfoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  appDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
    marginBottom: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  outlineButtonText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 14,
  },
});
export default SettingsScreen;