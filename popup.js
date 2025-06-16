import api from './api.js';
import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM Content Loaded - Initializing extension');
  
  // Try to restore session
  await restoreSession();

  // Set up event listeners
  console.log('Setting up event listeners');
  setupEventListeners();
});

async function restoreSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      console.log('No valid session found, showing login form');
      localStorage.removeItem('supabase.session');
      localStorage.removeItem('auth_token');
      showLoginForm();
      return;
    }
    console.log('Session restored:', session);
    showMainContent();
    await loadSettings();
    await loadUsage();
    await renderApiKeysList();
  } catch (error) {
    console.error('Error restoring session:', error);
    showLoginForm();
  }
}

function showLoginForm() {
  console.log('Showing login form');
  document.getElementById('main-content').style.display = 'none';
  document.getElementById('login-form').style.display = 'block';
  setupEventListeners();
}

function showMainContent() {
  console.log('Showing main content');
  document.getElementById('main-content').style.display = 'block';
  document.getElementById('login-form').style.display = 'none';
  setupEventListeners();
}

function signOut() {
  localStorage.removeItem('supabase.session');
  localStorage.removeItem('auth_token');
  supabase.auth.signOut();
  showLoginForm();
}

async function loadSettings() {
  try {
    const response = await api.getSettings();
    const settings = response.settings;
    
    // Update current settings display
    document.getElementById('current-model').textContent = settings.preferred_model;
    document.getElementById('current-api-status').textContent = settings.use_own_api ? 'Yes' : 'No';
    
    // Update selected API key display
    const currentApiKeyElement = document.getElementById('current-api-key');
    if (settings.use_own_api && settings.selected_key) {
      currentApiKeyElement.textContent = settings.selected_key.name;
    } else {
      currentApiKeyElement.textContent = 'None';
    }

    // Update form fields
    document.getElementById('preferred-model').value = settings.preferred_model;
    document.getElementById('use-own-api').checked = settings.use_own_api;

    // Show/hide API key selection based on use_own_api
    const apiKeySelection = document.getElementById('api-key-selection');
    apiKeySelection.style.display = settings.use_own_api ? 'block' : 'none';

    // Load API keys if using own API
    if (settings.use_own_api) {
      await loadApiKeysForSettings(settings.selected_key_id);
    }
  } catch (error) {
    console.error('Error loading settings:', error);
    showError('Failed to load settings');
  }
}

async function loadApiKeysForSettings(selectedKeyId = null) {
  try {
    const response = await api.getApiKeys();
    const select = document.getElementById('selected-api-key');
    select.innerHTML = '<option value="">Select an API key</option>';

    if (response.apiKeys && response.apiKeys.length > 0) {
      response.apiKeys.forEach(key => {
        const option = document.createElement('option');
        option.value = key.id;
        option.textContent = `${key.name} (${key.provider})`;
        if (key.id === selectedKeyId) {
          option.selected = true;
        }
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading API keys for settings:', error);
    showError('Failed to load API keys');
  }
}

// Dummy loadUsage function to prevent ReferenceError
async function loadUsage() {
  // Optionally implement usage loading here
  return;
}

function setupEventListeners() {
  console.log('setupEventListeners called');
  console.log('Setting up event listeners');
  
  // Sign out button
  const signOutBtn = document.getElementById('sign-out');
  if (signOutBtn) {
    console.log('Sign out button found, attaching listener');
    signOutBtn.addEventListener('click', signOut);
  } else {
    console.error('Sign out button not found!');
  }

  // Settings form
  document.getElementById('settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const preferredModel = document.getElementById('preferred-model').value;
    const useOwnApi = document.getElementById('use-own-api').checked;
    const selectedKeyId = useOwnApi ? document.getElementById('selected-api-key').value : null;

    try {
      await api.updateSettings({
        preferred_model: preferredModel,
        use_own_api: useOwnApi,
        selected_key_id: selectedKeyId
      });
      showSuccess('Settings updated successfully');
      await loadSettings();
    } catch (error) {
      console.error('Error updating settings:', error);
      showError('Failed to update settings');
    }
  });

  // Toggle API key selection visibility
  document.getElementById('use-own-api').addEventListener('change', async (e) => {
    const apiKeySelection = document.getElementById('api-key-selection');
    apiKeySelection.style.display = e.target.checked ? 'block' : 'none';
    if (e.target.checked) {
      await loadApiKeysForSettings();
    }
  });

  // API key form
  let addApiKeyFormInitialized = false;
  function setupAddApiKeyForm() {
    if (addApiKeyFormInitialized) return;
    addApiKeyFormInitialized = true;
    const form = document.getElementById('add-api-key-form');
    if (!form) return;
    form.onsubmit = null; // Remove any previous handler
    form.onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById('api-key-name').value;
      const apiKey = document.getElementById('api-key-value').value;
      const provider = document.getElementById('api-key-provider').value;
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      try {
        await api.addApiKey({ name, apiKey, provider });
        showSuccess('API key added successfully');
        await loadSettings(); // Refresh settings and dropdown
        await renderApiKeysList(); // Refresh API keys list
        form.reset();
      } catch (error) {
        console.error('Error adding API key:', error);
        showError('Failed to add API key. Please try again.');
      } finally {
        submitButton.disabled = false;
      }
    };
  }
  setupAddApiKeyForm();

  // Delete API key button
  setupDeleteApiKeyHandler();

  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    console.log('Login form found, attaching submit listener');
    loginForm.addEventListener('submit', async (e) => {
      console.log('Login form submitted');
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      console.log('Attempting login with email:', email);
      
      try {
        console.log('Calling api.login()');
        const result = await api.login(email, password);
        console.log('Login result:', result);
        
        console.log('Login successful, showing main content');
        showMainContent();
        
        console.log('Loading user data');
        await Promise.all([
          loadSettings(),
          loadUsage()
        ]);
        
        await renderApiKeysList();
        
        showSuccess('Login successful!');
      } catch (error) {
        console.error('Login error details:', error);
        showError('Login failed: ' + (error && error.message ? error.message : error));
        // Keep login form visible
        document.getElementById('main-content').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
      }
    });
  } else {
    console.error('Login form not found!');
  }
}

function setupDeleteApiKeyHandler() {
  const apiKeysList = document.getElementById('api-keys-list');
  if (!apiKeysList) return;
  apiKeysList.replaceWith(apiKeysList.cloneNode(true)); // Remove all previous handlers
  const newApiKeysList = document.getElementById('api-keys-list');
  newApiKeysList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-key')) {
      const keyId = e.target.dataset.keyId;
      if (!keyId) return;
      if (confirm('Are you sure you want to delete this API key?')) {
        try {
          await api.deleteApiKey(keyId);
          showSuccess('API key deleted successfully');
          await renderApiKeysList();
        } catch (error) {
          console.error('Error deleting API key:', error);
          showError('Failed to delete API key. Please try again.');
        }
      }
    }
  });
}

function showSuccess(message) {
  const successDiv = document.getElementById('success-message');
  successDiv.textContent = message;
  successDiv.style.display = 'block';
  setTimeout(() => {
    successDiv.style.display = 'none';
  }, 3000);
}

function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 3000);
}

async function renderApiKeysList() {
  try {
    const response = await api.getApiKeys();
    const listElement = document.getElementById('api-keys-list');
    listElement.innerHTML = '';
    if (response.apiKeys && response.apiKeys.length > 0) {
      const ul = document.createElement('ul');
      response.apiKeys.forEach(key => {
        const li = document.createElement('li');
        li.innerHTML = `${key.name} (${key.provider}) <button class="delete-key" data-key-id="${key.id}">Delete</button>`;
        ul.appendChild(li);
      });
      listElement.appendChild(ul);
    } else {
      listElement.innerHTML = '<p>No API keys found. Add one above.</p>';
    }
  } catch (error) {
    console.error('Error rendering API keys list:', error);
    showError('Failed to load API keys list');
  }
} 