import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import theme from './styles/theme';

// Screens
// Note: Ensure these filenames match exactly what is in the directory
import LanguageSelection from './screens/LanguageSelection';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import MapViewScreen from './screens/MapView'; // Renamed import to avoid conflict
import ListView from './screens/ListView';
import StallDetail from './screens/StallDetail';
import ReviewForm from './screens/ReviewForm';
import OwnerDashboard from './screens/OwnerDashboard';
import StallProfileEditor from './screens/StallProfileEditor';

// Customer Profile Screens
import UserProfile from './screens/UserProfile';
import Favorites from './screens/Favorites';
import MyReviews from './screens/MyReviews';
import Settings from './screens/Settings';
import Notifications from './screens/Notifications';
import ReportStall from './screens/ReportStall';
import About from './screens/About';
import Help from './screens/Help';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Main Tab Navigator (User App)
 */
function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Map') {
            iconName = 'map';
          } else if (route.name === 'List') {
            iconName = 'list';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          height: 90, // Increased height for Android nav bar clearance
          paddingBottom: 30, // Extra padding to stay above Android nav bar
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.fontSize.sm,
          fontFamily: theme.typography.fontFamily.medium,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.textLight,
        headerTitleStyle: {
          fontFamily: theme.typography.fontFamily.bold,
          fontSize: theme.typography.fontSize.lg,
        },
      })}
    >
      <Tab.Screen
        name="Map"
        component={MapViewScreen}
        options={{ title: 'Nearby Stalls' }}
      />
      <Tab.Screen
        name="List"
        component={ListView}
        options={{ title: 'All Stalls' }}
      />
      <Tab.Screen
        name="Profile"
        component={UserProfile}
        options={{ title: 'My Profile' }}
      />
    </Tab.Navigator>
  );
}

/**
 * Main App Navigator
 */
function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="LanguageSelection"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.textLight,
          headerTitleStyle: {
            fontFamily: theme.typography.fontFamily.bold,
            fontSize: theme.typography.fontSize.lg,
          },
          cardStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        {/* Onboarding */}
        <Stack.Screen
          name="LanguageSelection"
          component={LanguageSelection}
          options={{ headerShown: false }}
        />

        {/* Authentication */}
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUpScreen"
          component={SignUpScreen}
          options={{ headerShown: false }}
        />

        {/* Main User App */}
        <Stack.Screen
          name="Main"
          component={UserTabs}
          options={{ headerShown: false }}
        />

        {/* Stall Detail */}
        <Stack.Screen
          name="StallDetail"
          component={StallDetail}
          options={{ title: 'Stall Details' }}
        />

        {/* Review Form */}
        <Stack.Screen
          name="ReviewForm"
          component={ReviewForm}
          options={{ title: 'Write Review' }}
        />

        {/* Owner Dashboard */}
        <Stack.Screen
          name="OwnerDashboard"
          component={OwnerDashboard}
          options={{ title: 'Owner Dashboard' }}
        />

        {/* Stall Profile Editor */}
        <Stack.Screen
          name="StallProfileEditor"
          component={StallProfileEditor}
          options={{ title: 'Edit Stall Profile' }}
        />

        {/* Customer Profile Screens */}
        <Stack.Screen
          name="Favorites"
          component={Favorites}
          options={{ title: 'My Favorites' }}
        />
        <Stack.Screen
          name="MyReviews"
          component={MyReviews}
          options={{ title: 'My Reviews' }}
        />
        <Stack.Screen
          name="Settings"
          component={Settings}
          options={{ title: 'Settings' }}
        />
        <Stack.Screen
          name="Notifications"
          component={Notifications}
          options={{ title: 'Notifications' }}
        />
        <Stack.Screen
          name="ReportStall"
          component={ReportStall}
          options={{ title: 'Report Issue' }}
        />
        <Stack.Screen
          name="About"
          component={About}
          options={{ title: 'About' }}
        />
        <Stack.Screen
          name="Help"
          component={Help}
          options={{ title: 'Help & Support' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

