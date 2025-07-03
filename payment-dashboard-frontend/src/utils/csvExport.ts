import { Platform, Alert, Linking } from 'react-native';
import * as FileSystem from 'expo-file-system';

/**
 * Safely handles CSV export across platforms without relying on expo-sharing
 */
export const exportCsv = async (csvBlob: Blob, fileName?: string) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const csvFileName = fileName || `transactions_${timestamp}.csv`;

  try {
    if (Platform.OS === 'web') {
      // Web platform - use blob download
      const url = window.URL.createObjectURL(new Blob([csvBlob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', csvFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      Alert.alert('Success', 'Transactions exported successfully!');
      return true;
    } else {
      // Mobile platform - save to device storage
      try {
        // Convert blob to text for mobile
        const csvText = await new Response(csvBlob).text();
        
        // Try to save to external storage if available, otherwise use documents directory
        let fileUri: string;
        let locationMessage: string;
        
        if (FileSystem.StorageAccessFramework) {
          // Android: Try to use Storage Access Framework for public Downloads folder
          try {
            const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (permissions.granted) {
              const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
                permissions.directoryUri,
                csvFileName,
                'text/csv'
              );
              await FileSystem.writeAsStringAsync(fileUri, csvText);
              locationMessage = `File saved to Downloads folder:\n${csvFileName}`;
            } else {
              throw new Error('Permission denied');
            }
          } catch (safError) {
            // Fallback to documents directory
            fileUri = FileSystem.documentDirectory + csvFileName;
            await FileSystem.writeAsStringAsync(fileUri, csvText, {
              encoding: FileSystem.EncodingType.UTF8,
            });
            locationMessage = `File saved to app documents:\n${csvFileName}\n\nTo access: Open Files app > Browse > PayFlow folder`;
          }
        } else {
          // iOS or fallback: Use documents directory
          fileUri = FileSystem.documentDirectory + csvFileName;
          await FileSystem.writeAsStringAsync(fileUri, csvText, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          locationMessage = `File saved to app documents:\n${csvFileName}\n\nTo access: Open Files app > On My iPhone > PayFlow`;
        }
        
        // Show success message with better location info
        Alert.alert(
          'Export Successful', 
          locationMessage,
          [
            {
              text: 'Copy File Path',
              onPress: () => {
                // Copy file path to clipboard if available
                if (Platform.OS === 'android') {
                  // Show the file path for manual access
                  Alert.alert('File Path', fileUri);
                }
              }
            },
            {
              text: 'OK',
              style: 'default'
            }
          ]
        );
        
        return true;
      } catch (mobileError) {
        console.error('Mobile CSV export error:', mobileError);
        Alert.alert('Error', 'Failed to export transactions on mobile device');
        return false;
      }
    }
  } catch (error) {
    console.error('CSV export error:', error);
    Alert.alert('Error', 'Failed to export transactions');
    return false;
  }
};

/**
 * Alternative CSV export that uses React Native's Share API as fallback
 */
export const exportCsvWithShare = async (csvBlob: Blob, fileName?: string) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const csvFileName = fileName || `transactions_${timestamp}.csv`;

  try {
    if (Platform.OS === 'web') {
      return exportCsv(csvBlob, fileName);
    } else {
      // Mobile platform - try native sharing first, fallback to file save
      try {
        const csvText = await new Response(csvBlob).text();
        const fileUri = FileSystem.documentDirectory + csvFileName;
        
        // Write CSV content to file
        await FileSystem.writeAsStringAsync(fileUri, csvText, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        
        // Try to use React Native's built-in Share API
        const { Share } = require('react-native');
        
        await Share.share({
          message: 'Transaction Export',
          url: fileUri,
          title: 'Export CSV',
        });
        
        Alert.alert('Success', 'CSV file ready to share!');
        return true;
      } catch (shareError) {
        console.warn('Native share failed, saving to device:', shareError);
        // Fallback to simple file save
        return exportCsv(csvBlob, fileName);
      }
    }
  } catch (error) {
    console.error('CSV export with share error:', error);
    Alert.alert('Error', 'Failed to export transactions');
    return false;
  }
};
