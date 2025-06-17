import api from './api.js';

// This can be used for any background tasks or event handling
chrome.runtime.onInstalled.addListener(() => {
  console.log('QuantumPrompt extension installed');
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openPopup') {
    // Open the extension popup
    chrome.action.openPopup();
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'enhancePrompt') {
    console.log('Background script received enhance request:', request.prompt);
    
    enhancePrompt(request.prompt)
      .then(enhancedPrompt => {
        console.log('Enhancement successful:', enhancedPrompt);
        sendResponse({ success: true, enhancedPrompt });
      })
      .catch(error => {
        // Only log unexpected errors
        if (error.message !== 'Not authenticated') {
          console.error('Error enhancing prompt:', error);
        }
        // Check if it's an authentication error
        if (error.message === 'Not authenticated' || error.message.includes('401')) {
          sendResponse({ 
            success: false, 
            error: 'Not authenticated'
          });
        } else {
          sendResponse({ 
            success: false, 
            error: 'Failed to enhance prompt. Please try again.'
          });
        }
      });
    
    // Return true to indicate we will send a response asynchronously
    return true;
  }
});

// Function to enhance a prompt using the API
async function enhancePrompt(originalPrompt) {
  try {
    console.log('Background: Starting enhance prompt');
    // Get the auth token from storage
    const { auth_token } = await chrome.storage.local.get(['auth_token']);
    console.log('Background: Auth token exists:', !!auth_token);
    
    if (!auth_token) {
      console.log('Background: No auth token found');
      throw new Error('Not authenticated');
    }

    // Use the default API instance
    console.log('Background: Calling API enhancePrompt');
    const enhancedPrompt = await api.enhancePrompt(originalPrompt);
    console.log('Background: Enhancement successful');
    return enhancedPrompt;
  } catch (error) {
    console.error('Background: Enhance error:', error);
    if (error.message === 'Not authenticated' || error.message.includes('401')) {
      throw new Error('Not authenticated');
    }
    throw error;
  }
} 