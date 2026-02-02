import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Application from 'expo-application';

const DEVICE_ID_KEY = 'oneiro_device_id';

const createFallbackId = () =>
    `install-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const getDeviceId = async () => {
    const cached = await AsyncStorage.getItem(DEVICE_ID_KEY);

    let hardwareId: string | null = null;
    if (Platform.OS === 'android' && Application.androidId) {
        hardwareId = Application.androidId;
    }

    if (!hardwareId && Platform.OS === 'ios') {
        try {
            hardwareId = await Application.getIosIdForVendorAsync();
        } catch {
            hardwareId = null;
        }
    }

    const nextId = hardwareId || cached || createFallbackId();
    if (!cached || cached !== nextId) {
        await AsyncStorage.setItem(DEVICE_ID_KEY, nextId);
    }

    return nextId;
};

export const getDeviceMetadata = async () => {
    const deviceId = await getDeviceId();
    return {
        device_id: deviceId,
        platform: Platform.OS,
    };
};
