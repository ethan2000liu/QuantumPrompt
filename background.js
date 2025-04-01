// This can be used for any background tasks or event handling
chrome.runtime.onInstalled.addListener(() => {
  console.log('QuantumPrompt extension installed');
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'enhancePrompt') {
    console.log('Background script received enhance request:', request.prompt);
    
    enhancePrompt(request.prompt)
      .then(enhancedPrompt => {
        console.log('Enhancement successful:', enhancedPrompt);
        sendResponse({ success: true, enhancedPrompt });
      })
      .catch(error => {
        console.error('Error enhancing prompt:', error);
        sendResponse({ 
          success: false, 
          error: error.message,
          fallbackPrompt: request.prompt + "\n\nPlease provide a detailed, step-by-step explanation in your response."
        });
      });
    
    // Return true to indicate we will send a response asynchronously
    return true;
  }
});

// Function to enhance a prompt using the API
async function enhancePrompt(originalPrompt) {
  console.log('Calling API to enhance prompt');
  
  try {
    // Add a timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch('https://quantum-prompt-api.vercel.app/api/enhance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'chrome-extension://quantum-prompt'
      },
      body: JSON.stringify({ prompt: originalPrompt }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log('API response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API response data:', data);
    
    if (data.enhancedPrompt) {
      return data.enhancedPrompt;
    } else {
      throw new Error('No enhanced prompt returned from API');
    }
  } catch (error) {
    console.error('API call failed:', error);
    
    // If the API call fails, use a more sophisticated fallback
    // This is better than just appending a generic message
    return originalPrompt + "\n\n" + 
      "Please provide a comprehensive response with the following characteristics:\n" +
      "1. Include a detailed, step-by-step explanation\n" +
      "2. Provide concrete examples where applicable\n" +
      "3. Consider different perspectives or approaches\n" +
      "4. Explain any technical terms or concepts\n" +
      "5. Summarize key points at the end";
  }
} 