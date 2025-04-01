console.log('QuantumPrompt: Extension loaded');

// Configuration for different AI platforms with specific selectors
const PLATFORMS = {
  'chat.openai.com': {
    inputSelectors: [
      '#prompt-textarea',
      'textarea[data-id="root"]', 
      'textarea.text-input',
      'form textarea',
      'div[role="textbox"]',
      'textarea'
    ]
  },
  'gemini.google.com': {
    inputSelectors: [
      'textarea[aria-label="Response input"]',
      'textarea[placeholder="Enter a prompt"]',
      'textarea[aria-label="Input"]',
      'textarea.message-input',
      '[contenteditable="true"]',
      'div[role="textbox"]',
      'textarea'
    ]
  }
};

// Try to find an element using multiple selectors
function findElement(selectors) {
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      console.log('QuantumPrompt: Found element with selector:', selector);
      // Return the last element (usually the active input in chat interfaces)
      return elements[elements.length - 1];
    }
  }
  console.log('QuantumPrompt: No element found with selectors:', selectors);
  return null;
}

// Determine current platform
const currentPlatform = Object.keys(PLATFORMS).find(domain => 
  window.location.hostname.includes(domain)
);

console.log('QuantumPrompt: Detected platform:', currentPlatform);

// Function to create a completely new button element
function createFloatingButton() {
  // Remove any existing button first
  const existingButton = document.getElementById('quantum-enhance-btn');
  if (existingButton) {
    existingButton.remove();
  }
  
  // Create a div container for the button (for better isolation)
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'quantum-enhance-container';
  buttonContainer.style.position = 'fixed';
  buttonContainer.style.bottom = '30px';
  buttonContainer.style.right = '30px';
  buttonContainer.style.zIndex = '2147483647'; // Maximum z-index
  buttonContainer.style.fontFamily = 'Arial, sans-serif';
  
  // Create the button
  const enhanceButton = document.createElement('button');
  enhanceButton.id = 'quantum-enhance-btn';
  enhanceButton.textContent = '✨ Enhance';
  enhanceButton.title = 'Enhance your prompt with QuantumPrompt';
  
  // Apply extreme styling to ensure visibility
  enhanceButton.style.backgroundColor = '#6c5ce7';
  enhanceButton.style.color = 'white';
  enhanceButton.style.border = 'none';
  enhanceButton.style.borderRadius = '8px';
  enhanceButton.style.padding = '15px 25px';
  enhanceButton.style.fontSize = '18px';
  enhanceButton.style.fontWeight = 'bold';
  enhanceButton.style.cursor = 'pointer';
  enhanceButton.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
  enhanceButton.style.transition = 'all 0.3s ease';
  enhanceButton.style.display = 'block';
  enhanceButton.style.width = 'auto';
  enhanceButton.style.height = 'auto';
  enhanceButton.style.margin = '0';
  enhanceButton.style.opacity = '1';
  enhanceButton.style.visibility = 'visible';
  enhanceButton.style.transform = 'none';
  enhanceButton.style.pointerEvents = 'auto';
  
  // Add the button to the container
  buttonContainer.appendChild(enhanceButton);
  
  // Add the container to the document body
  document.body.appendChild(buttonContainer);
  
  console.log('QuantumPrompt: Created new floating button');
  
  return enhanceButton;
}

// Function to inject the enhance button
function injectEnhanceButton() {
  if (!currentPlatform) {
    console.log('QuantumPrompt: Not on a supported platform');
    return;
  }

  const config = PLATFORMS[currentPlatform];
  
  // Find the input element
  const inputElement = findElement(config.inputSelectors);
  if (!inputElement) {
    console.log('QuantumPrompt: Input element not found, retrying in 1s');
    return;
  }
  
  console.log('QuantumPrompt: Found input element:', inputElement);
  
  // Create the floating button
  const enhanceButton = createFloatingButton();
  
  // Add click event listener
  enhanceButton.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get the prompt text
    let promptText = '';
    if (inputElement.value !== undefined && inputElement.value !== null) {
      promptText = inputElement.value;
    } else if (inputElement.textContent !== undefined && inputElement.textContent !== null) {
      promptText = inputElement.textContent;
    } else if (inputElement.innerText !== undefined && inputElement.innerText !== null) {
      promptText = inputElement.innerText;
    }
    
    if (!promptText || !promptText.trim()) {
      alert('Please enter a prompt to enhance');
      return;
    }
    
    console.log('QuantumPrompt: Got prompt text:', promptText);
    
    enhanceButton.disabled = true;
    enhanceButton.textContent = '⏳ Enhancing...';
    enhanceButton.style.backgroundColor = '#a29bfe';
    
    try {
      const enhancedPrompt = await enhancePrompt(promptText);
      
      // Update the input field
      if (inputElement.value !== undefined) {
        inputElement.value = enhancedPrompt;
      } else if (inputElement.textContent !== undefined) {
        inputElement.textContent = enhancedPrompt;
      } else if (inputElement.innerText !== undefined) {
        inputElement.innerText = enhancedPrompt;
      }
      
      // Trigger input event to make sure the AI platform recognizes the change
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      inputElement.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Focus the input element
      inputElement.focus();
      
      console.log('QuantumPrompt: Prompt enhanced successfully');
    } catch (error) {
      console.error('QuantumPrompt: Error enhancing prompt:', error);
      alert('Failed to enhance prompt. Please try again.');
    } finally {
      enhanceButton.disabled = false;
      enhanceButton.textContent = '✨ Enhance';
      enhanceButton.style.backgroundColor = '#6c5ce7';
    }
  });
  
  console.log('QuantumPrompt: Enhancement button added successfully');
}

async function enhancePrompt(originalPrompt) {
  const enhancementServiceUrl = 'https://quantum-prompt-58xau0f7o-ethan2000lius-projects.vercel.app/api/enhance';
  
  console.log('QuantumPrompt: Enhancing prompt:', originalPrompt);
  
  try {
    const response = await fetch(enhancementServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: originalPrompt })
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    
    const data = await response.json();
    console.log('QuantumPrompt: Enhanced prompt received:', data.enhancedPrompt);
    return data.enhancedPrompt;
  } catch (error) {
    console.error('QuantumPrompt: Error calling enhancement service:', error);
    throw error;
  }
}

// Try to inject the button immediately
injectEnhanceButton();

// Try again after a short delay
setTimeout(injectEnhanceButton, 1000);

// Try again after the page has fully loaded
window.addEventListener('load', () => {
  console.log('QuantumPrompt: Page loaded');
  setTimeout(injectEnhanceButton, 1000);
  setTimeout(injectEnhanceButton, 3000);
});

// Set up a mutation observer to detect when the chat interface is loaded
const observer = new MutationObserver(() => {
  injectEnhanceButton();
});

// Start observing the document
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Try periodically in case the UI is slow to load or changes
setInterval(injectEnhanceButton, 5000);

// Add a keyboard shortcut (Alt+E) to trigger the button
document.addEventListener('keydown', (e) => {
  if (e.altKey && e.key === 'e') {
    const button = document.getElementById('quantum-enhance-btn');
    if (button) {
      button.click();
    }
  }
});

console.log('QuantumPrompt: Setup complete'); 