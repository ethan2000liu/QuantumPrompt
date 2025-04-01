console.log('QuantumPrompt: Extension loaded');

// Configuration for different AI platforms
const PLATFORMS = {
  'chat.openai.com': {
    inputSelectors: [
      'textarea[data-id="root"]', 
      'textarea.text-input',
      'form textarea',
      'div[role="textbox"]',
      'textarea'
    ],
    buttonContainerSelectors: [
      '.flex.flex-col.w-full.py-2.flex-grow.md\\:py-3.md\\:pl-4',
      'form div',
      '.relative.flex.h-full.flex-1.items-stretch.md\\:flex-col'
    ]
  },
  'gemini.google.com': {
    inputSelectors: [
      'textarea[aria-label="Input"]',
      'textarea.message-input',
      '[contenteditable="true"]',
      'div[role="textbox"]',
      'textarea'
    ],
    buttonContainerSelectors: [
      '.input-area-container',
      'form',
      '.input-container',
      '.request-response-container'
    ]
  }
};

// Try to find an element using multiple selectors
function findElement(selectors) {
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      console.log('QuantumPrompt: Found element with selector:', selector);
      return element;
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

// Function to inject the enhance button
function injectEnhanceButton() {
  if (!currentPlatform) {
    console.log('QuantumPrompt: Not on a supported platform');
    return;
  }

  // Check if button already exists
  if (document.getElementById('quantum-enhance-btn')) {
    console.log('QuantumPrompt: Button already exists');
    return;
  }

  const config = PLATFORMS[currentPlatform];
  
  // Find the input element
  const inputElement = findElement(config.inputSelectors);
  if (!inputElement) {
    console.log('QuantumPrompt: Input element not found, will retry later');
    return;
  }
  
  // Find a suitable container for the button
  let container = null;
  
  // Try to find container using selectors
  container = findElement(config.buttonContainerSelectors);
  
  // If no container found, try parent of input
  if (!container) {
    container = inputElement.parentElement;
    console.log('QuantumPrompt: Using input parent as container:', container);
  }
  
  // If still no container, try grandparent
  if (!container) {
    container = inputElement.parentElement?.parentElement;
    console.log('QuantumPrompt: Using input grandparent as container:', container);
  }
  
  if (!container) {
    console.log('QuantumPrompt: No suitable container found');
    return;
  }
  
  // Create the enhance button
  const enhanceButton = document.createElement('button');
  enhanceButton.id = 'quantum-enhance-btn';
  enhanceButton.className = 'quantum-enhance-btn';
  enhanceButton.innerHTML = '✨ Enhance';
  enhanceButton.title = 'Enhance your prompt with QuantumPrompt';
  enhanceButton.style.position = 'absolute';
  enhanceButton.style.right = '10px';
  enhanceButton.style.bottom = '10px';
  enhanceButton.style.zIndex = '9999';
  
  // Add the button to the container
  container.appendChild(enhanceButton);
  
  // Make container position relative if it's not already
  const containerPosition = window.getComputedStyle(container).position;
  if (containerPosition === 'static') {
    container.style.position = 'relative';
  }
  
  console.log('QuantumPrompt: Button added to container:', container);
  
  // Add click event listener
  enhanceButton.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get the prompt text
    let promptText = '';
    if (inputElement.value !== undefined) {
      promptText = inputElement.value;
    } else if (inputElement.textContent !== undefined) {
      promptText = inputElement.textContent;
    } else if (inputElement.innerText !== undefined) {
      promptText = inputElement.innerText;
    }
    
    if (!promptText || !promptText.trim()) {
      alert('Please enter a prompt to enhance');
      return;
    }
    
    console.log('QuantumPrompt: Got prompt text:', promptText);
    
    enhanceButton.disabled = true;
    enhanceButton.innerHTML = '⏳ Enhancing...';
    
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
      enhanceButton.innerHTML = '✨ Enhance';
    }
  });
  
  console.log('QuantumPrompt: Enhancement button added successfully');
}

async function enhancePrompt(originalPrompt) {
  // Update this URL with your actual deployed AI service endpoint
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
const observer = new MutationObserver((mutations) => {
  injectEnhanceButton();
});

// Start observing the document
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Try periodically in case the UI is slow to load or changes
setInterval(injectEnhanceButton, 5000);

console.log('QuantumPrompt: Setup complete'); 