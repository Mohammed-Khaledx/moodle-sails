// services/moodle.ts
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const MOODLE_BASE_URL = 'http://192.168.1.4'; // TODO: Move to env config

// ─── Centralized fetch with error handling ───
async function moodleFetch<T>(endpoint: string, params: Record<string, string>): Promise<T> {
    const body = new URLSearchParams(params).toString();
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body,
            signal: controller.signal,
        });
        clearTimeout(timeout);

        const text = await response.text();
        
        // Moodle sometimes returns HTML errors (e.g., invalid token)
        if (text.trim().startsWith('<')) {
            if (text.includes('invalidtoken')) {
                throw new Error('MOODLE_INVALID_TOKEN');
            }
            throw new Error('Moodle returned HTML instead of JSON. Check server logs.');
        }

        const json = JSON.parse(text);
        
        if (json.errorcode || json.error) {
            throw new Error(json.message || json.error || `Moodle error: ${json.errorcode}`);
        }

        return json as T;
    } catch (err) {
        clearTimeout(timeout);
        if (err instanceof Error && err.name === 'AbortError') {
            throw new Error('Request timed out. Check your network connection.');
        }
        throw err;
    }
}

// ─── Device Registration ───
export async function registerDeviceWithMoodle(userToken: string, fcmToken: string) {
    let uuid = await AsyncStorage.getItem('deviceUUID');
    if (!uuid) {
        uuid = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        await AsyncStorage.setItem('deviceUUID', uuid);
    }

    return moodleFetch<any>(`${MOODLE_BASE_URL}/webservice/rest/server.php`, {
        wstoken: userToken,
        wsfunction: 'core_user_add_user_device',
        moodlewsrestformat: 'json',
        appid: 'moodle-sails',
        uuid,
        pushid: fcmToken,
        platform: Platform.OS,
        name: Device.modelName || 'Mobile',
        model: Device.modelName || 'Unknown',
        version: Constants.expoConfig?.version || '1.0.0',
    });
}

// ─── Auth ───
export async function loginToMoodle(username: string, password: string) {
    const params = new URLSearchParams({
        username: username.trim(),
        password,
        service: 'sails_mobile_service',
    });
    
    const url = `${MOODLE_BASE_URL}/login/token.php?${params.toString()}`;
    const response = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
    const data = await response.json();
    
    if (data.error) throw new Error(data.error);
    if (!data.token) throw new Error('No token received from Moodle.');
    
    return data.token;
}

// ─── Site Info ───
export async function getMoodleSiteInfo(userToken: string) {
    return moodleFetch<{ userid: number; fullname: string; userpictureurl: string }>(
        `${MOODLE_BASE_URL}/webservice/rest/server.php`,
        {
            wstoken: userToken,
            wsfunction: 'core_webservice_get_site_info',
            moodlewsrestformat: 'json',
        }
    );
}

// ─── Courses ───
export async function getUserCourses(userToken: string, userId: number) {
    return moodleFetch<any[]>(
        `${MOODLE_BASE_URL}/webservice/rest/server.php`,
        {
            wstoken: userToken,
            wsfunction: 'core_enrol_get_users_courses',
            moodlewsrestformat: 'json',
            userid: userId.toString(),
        }
    );
}

// ─── Course Contents ───
export async function getCourseContents(userToken: string, courseId: number) {
    return moodleFetch<any[]>(
        `${MOODLE_BASE_URL}/webservice/rest/server.php`,
        {
            wstoken: userToken,
            wsfunction: 'core_course_get_contents',
            moodlewsrestformat: 'json',
            courseid: courseId.toString(),
        }
    );
}

// ─── Notifications ───
export async function getHistoricalNotifications(userToken: string, userId: number) {
    const result = await moodleFetch<{ notifications?: any[] }>(
        `${MOODLE_BASE_URL}/webservice/rest/server.php`,
        {
            wstoken: userToken,
            wsfunction: 'core_message_get_popup_notifications',
            moodlewsrestformat: 'json',
            useridto: userId.toString(),
        }
    );
    return result.notifications || [];
}

// ─── Helpdesk ───
export async function getTicketDetails(userToken: string, ticketId: string) {
    return moodleFetch<any>(
        `${MOODLE_BASE_URL}/webservice/rest/server.php`,
        {
            wstoken: userToken,
            wsfunction: 'local_helpdesk_get_ticket_details',
            moodlewsrestformat: 'json',
            ticketid: ticketId,
        }
    );
}

export async function updateTicketState(userToken: string, ticketId: string, newState: string) {
    return moodleFetch<any>(
        `${MOODLE_BASE_URL}/webservice/rest/server.php`,
        {
            wstoken: userToken,
            wsfunction: 'local_helpdesk_update_ticket_status',
            moodlewsrestformat: 'json',
            ticketid: ticketId,
            status: newState,
        }
    );
}