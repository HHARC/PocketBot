// src/navigation/AppNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import ReportScreen from '../screens/ReportScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

// Custom tab bar icons
const TabIcon = ({ name, focused }) => {
  return (
    <View style={[styles.iconContainer, focused ? styles.iconFocused : null]}>
      <Text style={[styles.iconText, focused ? styles.iconTextFocused : null]}>
        {name === 'Home' ? '🏠' :
         name === 'Analytics' ? '📊' :
         name === 'Report' ? '📝' : '⚙️'}
      </Text>
      <Text style={[styles.iconLabel, focused ? styles.iconLabelFocused : null]}>
        {name}
      </Text>
    </View>
  );
};

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: 60,
          paddingBottom: 5,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} />,
        }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen} 
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Analytics" focused={focused} />,
        }}
      />
      <Tab.Screen 
        name="Report" 
        component={ReportScreen} 
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Report" focused={focused} />,
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Settings" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconFocused: {
    borderRadius: 20,
  },
  iconText: {
    fontSize: 20,
  },
  iconTextFocused: {
    color: '#3498db',
  },
  iconLabel: {
    fontSize: 10,
    marginTop: 3,
  },
  iconLabelFocused: {
    color: '#3498db',
    fontWeight: 'bold',
  },
});

export default AppNavigator;
