import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { theme } from '../theme/theme';

interface GradientCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  colors?: string[];
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  animation?: string;
  delay?: number;
  shadow?: boolean;
}

export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  style,
  colors,
  variant = 'default',
  animation = 'fadeInUp',
  delay = 0,
  shadow = true,
}) => {
  const getColors = () => {
    if (colors) return colors;
    switch (variant) {
      case 'primary': return theme.gradients.primary;
      case 'secondary': return theme.gradients.secondary;
      case 'success': return theme.gradients.success;
      case 'warning': return theme.gradients.warning;
      case 'error': return theme.gradients.error;
      default: return theme.gradients.card;
    }
  };

  return (
    <Animatable.View 
      animation={animation} 
      duration={600} 
      delay={delay}
      style={styles.container}
    >
      {variant === 'default' ? (
        <View style={[styles.card, shadow && theme.shadows.lg, style]}>
          {children}
        </View>
      ) : (
        <LinearGradient
          colors={getColors() as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientCard, shadow && theme.shadows.lg, style]}
        >
          {children}
        </LinearGradient>
      )}
    </Animatable.View>
  );
};

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  colors?: string[];
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  animation?: string;
  delay?: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  colors,
  variant = 'primary',
  animation = 'fadeInUp',
  delay = 0,
}) => {
  return (
    <GradientCard
      variant={variant}
      colors={colors}
      animation={animation}
      delay={delay}
      style={styles.statsCard}
    >
      <View style={styles.statsContent}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={styles.statsText}>
          <Text style={[
            styles.statsTitle,
            variant !== 'default' && styles.statsTitle
          ]}>
            {title}
          </Text>
          <Text style={[
            styles.statsValue,
            variant !== 'default' && styles.statsValueWhite
          ]}>
            {value}
          </Text>
          {subtitle && (
            <Text style={[
              styles.statsSubtitle,
              variant !== 'default' && styles.statsSubtitleWhite
            ]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </GradientCard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  gradientCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  statsCard: {
    margin: theme.spacing.sm,
    minHeight: 100,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: theme.spacing.md,
  },
  statsText: {
    flex: 1,
  },
  statsTitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  statsTitleWhite: {
    color: theme.colors.text.inverse,
    opacity: 0.9,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  statsValueWhite: {
    color: theme.colors.text.inverse,
  },
  statsSubtitle: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    fontWeight: '400',
  },
  statsSubtitleWhite: {
    color: theme.colors.text.inverse,
    opacity: 0.8,
  },
});
