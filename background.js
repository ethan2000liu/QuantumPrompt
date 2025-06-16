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
  // Add a timeout to the fetch request
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  const API_URL = 'https://quantum-prompt-api.vercel.app/api/prompt/enhance';

  // Read the auth_token from chrome.storage.local
  const token = await new Promise((resolve) => {
    chrome.storage.local.get(['auth_token'], (result) => {
      resolve(result.auth_token);
    });
  });
  if (!token) {
    throw new Error('Not authenticated');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Origin': 'chrome-extension://quantum-prompt',
    'Authorization': `Bearer ${token}`
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt: originalPrompt }),
    signal: controller.signal
  });

  clearTimeout(timeoutId);

  if (response.status === 401) {
    throw new Error('Not authenticated');
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API error response:', errorText);
    throw new Error(`API responded with status: ${response.status}`);
  }

  const data = await response.json();

  if (data.enhancedPrompt) {
    return data.enhancedPrompt;
  } else {
    throw new Error('No enhanced prompt returned from API');
  }
} 