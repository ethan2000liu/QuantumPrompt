import { config } from './config.js'
import { authManager } from './auth.js'
import { supabase } from './supabase.js'

class API {
  constructor() {
    this.baseUrl = process.env.API_BASE_URL || 'https://quantum-prompt-api.vercel.app'
    this.supabase = supabase
  }

  async login(email, password) {
    console.log('API: Starting login process');
    try {
      console.log('API: Attempting to sign in with Supabase');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      console.log('API: Login successful, data:', data);
      if (data.session) {
        localStorage.setItem('supabase.session', JSON.stringify(data.session));
        await supabase.auth.setSession(data.session);
        localStorage.setItem('auth_token', data.session.access_token);
        console.log('API: Storing access token:', data.session.access_token);
      }
      return data;
    } catch (error) {
      console.error('API: Login error:', error);
      throw error;
    }
  }

  getAuthToken() {
    const token = localStorage.getItem('auth_token');
    console.log('API: Getting auth token:', token ? 'Token exists' : 'Not found');
    return token;
  }

  async handleResponse(response, errorMessage) {
    console.log('API: Handling response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${errorMessage} response:`, errorText);
      
      if (response.status === 401) {
        // Clear invalid token and redirect to login
        localStorage.removeItem('supabase.auth.token');
        window.location.href = 'popup.html#login';
        throw new Error('Session expired. Please log in again.');
      }
      
      throw new Error(`${errorMessage}: ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error(`${errorMessage} non-JSON response:`, text);
      throw new Error(`Invalid response format: ${text}`);
    }

    const data = await response.json();
    console.log('API: Response data:', data);
    return data;
  }

  async enhancePrompt(prompt) {
    try {
      const token = await this.getAuthToken()
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
      
      const response = await fetch(`${this.baseUrl}/api/enhance`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt, model: 'gemini-1.5-flash' })
      })
      
      return this.handleResponse(response, 'Failed to enhance prompt')
    } catch (error) {
      console.error('Enhance error:', error)
      throw error
    }
  }

  getFallbackEnhancement(prompt) {
    const enhancements = [
      'Please provide more context about',
      'Could you elaborate on',
      'I would like to know more about',
      'Please explain in detail about'
    ]
    
    const randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)]
    return `${randomEnhancement} ${prompt}`
  }

  async getApiKeys() {
    try {
      const token = await this.getAuthToken();
      console.log('API: Making getApiKeys request with token:', token.substring(0, 10) + '...');
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      console.log('API: getApiKeys headers:', headers);
      
      const response = await fetch(`${this.baseUrl}/api/api-keys`, {
        headers
      });
      
      return this.handleResponse(response, 'Failed to get API keys');
    } catch (error) {
      console.error('API keys error:', error);
      return []; // Return empty array if not authenticated
    }
  }

  async addApiKey({ name, apiKey, provider }) {
    try {
      const token = await this.getAuthToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      const body = JSON.stringify({ name, apiKey, provider });
      const response = await fetch(`${this.baseUrl}/api/api-keys`, {
        method: 'POST',
        headers,
        body
      });
      return this.handleResponse(response, 'Failed to add API key');
    } catch (error) {
      console.error('Add API key error:', error);
      throw error;
    }
  }

  async deleteApiKey(keyId) {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    console.log('API: Deleting API key:', keyId);
    const response = await fetch(`${this.baseUrl}/api/api-keys/${keyId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return this.handleResponse(response);
  }

  async getSettings() {
    try {
      const token = await this.getAuthToken();
      console.log('API: Making getSettings request with token:', token.substring(0, 10) + '...');
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      console.log('API: getSettings headers:', headers);
      
      const response = await fetch(`${this.baseUrl}/api/settings`, {
        headers
      });
      
      return this.handleResponse(response, 'Failed to get settings');
    } catch (error) {
      console.error('Settings error:', error);
      return { use_own_api: false }; // Return default settings if not authenticated
    }
  }

  async updateSettings(settings) {
    try {
      const token = await this.getAuthToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      const response = await fetch(`${this.baseUrl}/api/settings`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(settings)
      });
      return this.handleResponse(response, 'Failed to update settings');
    } catch (error) {
      console.error('Settings error:', error);
      throw error;
    }
  }

  async getUsage() {
    try {
      const token = await this.getAuthToken();
      console.log('API: Making getUsage request with token:', token.substring(0, 10) + '...');
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      console.log('API: getUsage headers:', headers);
      
      // Get current month's start and end dates
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const response = await fetch(`${this.baseUrl}/api/usage?start_date=${startDate}&end_date=${endDate}`, {
        headers
      });
      
      return this.handleResponse(response, 'Failed to get usage');
    } catch (error) {
      console.error('Usage error:', error);
      return { total_prompts: 0, total_tokens: 0 }; // Return default usage if not authenticated
    }
  }
}

export default new API() 