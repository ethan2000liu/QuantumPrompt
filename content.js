console.log('QuantumPrompt: Extension loaded');

// Configuration for different AI platforms with more specific selectors
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

// Create the enhance button element
function createEnhanceButton() {
  const enhanceButton = document.createElement('button');
  enhanceButton.id = 'quantum-enhance-btn';
  enhanceButton.className = 'quantum-enhance-btn';
  enhanceButton.innerHTML = '✨ Enhance';
  enhanceButton.title = 'Enhance your prompt with QuantumPrompt';
  
  // Style the button
  enhanceButton.style.position = 'absolute';
  enhanceButton.style.zIndex = '9999';
  enhanceButton.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  enhanceButton.style.opacity = '0';
  enhanceButton.style.transition = 'opacity 0.2s ease-in-out';
  enhanceButton.style.pointerEvents = 'none'; // Initially not clickable
  
  return enhanceButton;
}

// Function to position the button relative to the input element
function positionButton(button, inputElement) {
  const rect = inputElement.getBoundingClientRect();
  
  // Position in the top-right corner of the input
  button.style.top = `${rect.top + window.scrollY - 40}px`;
  button.style.left = `${rect.right + window.scrollX - 100}px`;
}

// Function to handle input element hover
function setupHoverBehavior(inputElement) {
  // Check if we already set up hover for this element
  if (inputElement.dataset.quantumPromptHover === 'true') {
    return;
  }
  
  // Mark this element as having hover behavior set up
  inputElement.dataset.quantumPromptHover = 'true';
  
  // Create the button if it doesn't exist
  let enhanceButton = document.getElementById('quantum-enhance-btn');
  if (!enhanceButton) {
    enhanceButton = createEnhanceButton();
    document.body.appendChild(enhanceButton);
    
    // Add click event listener to the button
    enhanceButton.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Get the active input element
      const activeInput = document.querySelector('[data-quantum-prompt-active="true"]');
      if (!activeInput) {
        console.error('QuantumPrompt: No active input found');
        return;
      }
      
      // Get the prompt text
      let promptText = '';
      if (activeInput.value !== undefined && activeInput.value !== null) {
        promptText = activeInput.value;
      } else if (activeInput.textContent !== undefined && activeInput.textContent !== null) {
        promptText = activeInput.textContent;
      } else if (activeInput.innerText !== undefined && activeInput.innerText !== null) {
        promptText = activeInput.innerText;
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
        if (activeInput.value !== undefined) {
          activeInput.value = enhancedPrompt;
        } else if (activeInput.textContent !== undefined) {
          activeInput.textContent = enhancedPrompt;
        } else if (activeInput.innerText !== undefined) {
          activeInput.innerText = enhancedPrompt;
        }
        
        // Trigger input event to make sure the AI platform recognizes the change
        activeInput.dispatchEvent(new Event('input', { bubbles: true }));
        activeInput.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Focus the input element
        activeInput.focus();
        
        console.log('QuantumPrompt: Prompt enhanced successfully');
      } catch (error) {
        console.error('QuantumPrompt: Error enhancing prompt:', error);
        alert('Failed to enhance prompt. Please try again.');
      } finally {
        enhanceButton.disabled = false;
        enhanceButton.innerHTML = '✨ Enhance';
      }
    });
  }
  
  // Add mouseenter event to show the button
  inputElement.addEventListener('mouseenter', () => {
    // Mark this input as active
    inputElement.dataset.quantumPromptActive = 'true';
    
    // Position the button relative to this input
    positionButton(enhanceButton, inputElement);
    
    // Make button visible and clickable
    enhanceButton.style.opacity = '1';
    enhanceButton.style.pointerEvents = 'auto';
  });
  
  // Add mouseleave event to hide the button
  inputElement.addEventListener('mouseleave', (e) => {
    // Check if we're moving to the button itself
    const toElement = e.relatedTarget;
    if (toElement && (toElement.id === 'quantum-enhance-btn' || toElement.closest('#quantum-enhance-btn'))) {
      return; // Don't hide if moving to the button
    }
    
    // Remove active status
    inputElement.dataset.quantumPromptActive = 'false';
    
    // Hide button and make it non-clickable
    enhanceButton.style.opacity = '0';
    enhanceButton.style.pointerEvents = 'none';
  });
  
  // Add mouseleave event to the button to hide it when mouse leaves
  enhanceButton.addEventListener('mouseleave', (e) => {
    // Check if we're moving back to the input
    const toElement = e.relatedTarget;
    if (toElement && toElement.dataset && toElement.dataset.quantumPromptActive === 'true') {
      return; // Don't hide if moving back to the active input
    }
    
    // Hide button and make it non-clickable
    enhanceButton.style.opacity = '0';
    enhanceButton.style.pointerEvents = 'none';
  });
  
  console.log('QuantumPrompt: Hover behavior set up for input element');
}

// Function to find input elements and set up hover behavior
function setupInputElements() {
  if (!currentPlatform) {
    console.log('QuantumPrompt: Not on a supported platform');
    return;
  }
  
  const config = PLATFORMS[currentPlatform];
  
  // Find all matching input elements
  config.inputSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      setupHoverBehavior(element);
    });
  });
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

// Try to set up input elements immediately
setupInputElements();

// Try again after a short delay
setTimeout(setupInputElements, 1000);

// Try again after the page has fully loaded
window.addEventListener('load', () => {
  console.log('QuantumPrompt: Page loaded');
  setTimeout(setupInputElements, 1000);
  setTimeout(setupInputElements, 3000);
});

// Set up a mutation observer to detect when new input elements are added
const observer = new MutationObserver((mutations) => {
  setupInputElements();
});

// Start observing the document
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Try periodically in case the UI is slow to load or changes
setInterval(setupInputElements, 5000);

console.log('QuantumPrompt: Setup complete');
