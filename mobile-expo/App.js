import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import LanguageSelection from './screens/LanguageSelection';
import MapView from './screens/MapView';
import ListView from './screens/ListView';
import StallDetail from './screens/StallDetail';
import ReviewForm from './screens/ReviewForm';
import OwnerDashboard from './screens/OwnerDashboard';

import theme from './styles/theme';

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
                    }

                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: theme.colors.background,
                    borderTopColor: theme.colors.border,
                    height: 60,
                    paddingBottom: 8,
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
                component={MapView}
                options={{ title: 'Nearby Stalls' }}
            />
            <Tab.Screen
                name="List"
                component={ListView}
                options={{ title: 'All Stalls' }}
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
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;
