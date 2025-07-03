import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { theme } from '../theme/theme';

interface EnhancedInputProps extends TextInputProps {
  label?: string;
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  variant?: 'outline' | 'filled' | 'underline';
  size?: 'small' | 'medium' | 'large';
}

export const EnhancedInput: React.FC<EnhancedInputProps> = ({
  label,
  error,
  success,
  icon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  variant = 'outline',
  size = 'medium',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          fontSize: 14,
        };
      case 'large':
        return {
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.xl,
          fontSize: 18,
        };
      default:
        return {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          fontSize: 16,
        };
    }
  };

  const getVariantStyles = () => {
    const baseStyle = {
      ...getSizeStyles(),
      borderRadius: theme.borderRadius.md,
    };

    if (variant === 'filled') {
      return {
        ...baseStyle,
        backgroundColor: theme.colors.background,
        borderWidth: 0,
      };
    }

    if (variant === 'underline') {
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderBottomWidth: 2,
        borderRadius: 0,
        paddingHorizontal: 0,
      };
    }

    // outline variant (default)
    return {
      ...baseStyle,
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: error 
        ? theme.colors.status.failed 
        : success 
          ? theme.colors.status.success 
          : isFocused 
            ? theme.colors.primary.start 
            : theme.colors.border,
    };
  };

  return (
    <Animatable.View 
      animation="fadeInUp" 
      duration={400}
      style={[styles.container, containerStyle]}
    >
      {label && (
        <Text style={[styles.label, labelStyle, error && styles.labelError]}>
          {label}
        </Text>
      )}
      
      <View style={[styles.inputContainer, getVariantStyles()]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        
        <TextInput
          {...props}
          style={[
            styles.input,
            inputStyle,
            icon ? styles.inputWithIcon : null,
            rightIcon ? styles.inputWithRightIcon : null,
          ]}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          placeholderTextColor={theme.colors.text.tertiary}
        />
        
        {rightIcon && (
          <TouchableOpacity 
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Animatable.Text 
          animation="fadeInLeft" 
          style={styles.errorText}
        >
          {error}
        </Animatable.Text>
      )}
      
      {success && !error && (
        <Animatable.Text 
          animation="fadeInLeft" 
          style={styles.successText}
        >
          ✓ Valid
        </Animatable.Text>
      )}
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  labelError: {
    color: theme.colors.status.failed,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  input: {
    flex: 1,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  inputWithIcon: {
    marginLeft: theme.spacing.sm,
  },
  inputWithRightIcon: {
    marginRight: theme.spacing.sm,
  },
  iconContainer: {
    marginLeft: theme.spacing.md,
  },
  rightIconContainer: {
    marginRight: theme.spacing.md,
    padding: theme.spacing.xs,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.status.failed,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  successText: {
    fontSize: 12,
    color: theme.colors.status.success,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
});
