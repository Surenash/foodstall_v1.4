/**
 * Food Stall Discovery Platform - Design System
 * Centralized theme configuration following Design Document specifications
 */

export const colors = {
    // Primary Colors (from Design Document)
    primary: '#FF5733',        // Vibrant Orange - appetizing, energetic
    secondary: '#FFC300',      // Yellow - highlights, warnings

    // Status Colors
    statusOpen: '#00C853',     // Bright Green for "OPEN"
    statusClosed: '#9E9E9E',   // Grey for "CLOSED"

    // Neutral Colors
    background: '#FFFFFF',     // White backgrounds for readability
    surface: '#F5F5F5',        // Light grey for cards
    textPrimary: '#212121',    // Dark Grey for text
    textSecondary: '#757575',  // Medium grey for secondary text
    textLight: '#FFFFFF',      // White text for dark backgrounds

    // UI Colors
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',

    // Hygiene Badge Colors
    hygieneHigh: '#4CAF50',    // Green shield
    hygieneMedium: '#FFC107',  // Yellow shield
    hygieneLow: '#FF5722',     // Red shield

    // Borders and Dividers
    border: '#E0E0E0',
    divider: '#BDBDBD',
};

export const typography = {
    // Font Family (Google Fonts: Inter or Roboto)
    fontFamily: {
        regular: 'System',
        medium: 'System',
        semibold: 'System',
        bold: 'System',
    },

    // Font Sizes
    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
        '5xl': 48,   // For Owner App large buttons
    },

    // Line Heights
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
};

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
};

// Component-specific styles
export const components = {
    // Status Badge (Open/Closed indicators)
    statusBadge: {
        open: {
            backgroundColor: colors.statusOpen,
            color: colors.textLight,
            fontSize: typography.fontSize.sm,
            fontFamily: typography.fontFamily.bold,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: borderRadius.sm,
        },
        closed: {
            backgroundColor: colors.statusClosed,
            color: colors.textLight,
            fontSize: typography.fontSize.sm,
            fontFamily: typography.fontFamily.bold,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: borderRadius.sm,
        },
    },

    // Owner Dashboard Toggle Button
    ownerToggle: {
        // Large touch target for accessibility
        minHeight: 120,
        minWidth: '80%',
        borderRadius: borderRadius.xl,
        fontSize: typography.fontSize['5xl'],
        fontFamily: typography.fontFamily.bold,
        // High contrast for outdoor visibility
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 12,
    },

    // Stall Card
    stallCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginVertical: spacing.sm,
        marginHorizontal: spacing.md,
        ...shadows.md,
    },

    // Hygiene Score Badge
    hygieneBadge: (score) => {
        let bgColor = colors.hygieneLow;
        if (score >= 4) bgColor = colors.hygieneHigh;
        else if (score >= 3) bgColor = colors.hygieneMedium;

        return {
            backgroundColor: bgColor,
            color: colors.textLight,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: borderRadius.sm,
            fontSize: typography.fontSize.sm,
            fontFamily: typography.fontFamily.semibold,
        };
    },
};

export default {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    components,
};
