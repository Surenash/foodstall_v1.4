import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import theme from '../styles/theme';

/**
 * Loading Spinner Component
 * Reusable loading indicator
 */
const LoadingSpinner = ({ size = 'large', color = theme.colors.primary }) => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size={size} color={color} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default LoadingSpinner;
