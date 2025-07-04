import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { theme } from '../theme/theme';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  colors?: string[];
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  animation?: string;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  colors,
  loading = false,
  disabled = false,
  style,
  textStyle,
  size = 'medium',
  variant = 'primary',
  animation = 'fadeInUp',
}) => {
  const getColors = () => {
    if (colors) return colors;
    switch (variant) {
      case 'secondary': return theme.gradients.secondary;
      case 'success': return theme.gradients.success;
      case 'warning': return theme.gradients.warning;
      case 'error': return theme.gradients.error;
      default: return theme.gradients.primary;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.borderRadius.sm,
        };
      case 'large':
        return {
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.xl,
          borderRadius: theme.borderRadius.lg,
        };
      default:
        return {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.borderRadius.md,
        };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small': return 14;
      case 'large': return 18;
      default: return 16;
    }
  };

  return (
    <Animatable.View animation={animation} duration={600}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.container, style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={getColors() as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradient,
            getSizeStyles(),
            (disabled || loading) && styles.disabled,
            theme.shadows.md,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.text.inverse} size="small" />
          ) : (
            <Text
              style={[
                styles.text,
                { fontSize: getTextSize() },
                textStyle,
              ]}
            >
              {title}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  text: {
    color: theme.colors.text.inverse,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
});