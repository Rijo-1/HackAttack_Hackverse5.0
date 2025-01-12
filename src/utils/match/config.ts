export const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_SERVER_URL || 'ws://localhost:3001';

export const checkServerConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(SOCKET_SERVER_URL.replace('ws', 'http') + '/health');
    return response.ok;
  } catch (error) {
    return false;
  }
}; 