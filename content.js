console.log('QuantumPrompt: Extension loaded');

// Configuration for Gemini platform
const PLATFORM_CONFIG = {
  inputSelectors: [
    'textarea[aria-label="Response input"]',
    'textarea[placeholder="Enter a prompt"]',
    'textarea[aria-label="Input"]',
    'textarea.message-input',
    '[contenteditable="true"]',
    'div[role="textbox"]',
    'textarea'
  ]
};

// Cooldown configuration
const COOLDOWN_CONFIG = {
  durationMs: 5000, // 5 seconds cooldown
  lastUsedTime: 0
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

// Position the button relative to the input element
function positionButton(button, inputElement) {
  const rect = inputElement.getBoundingClientRect();
  
  // Position the button near the top-right of the input
  button.style.top = `${rect.top + 10}px`;
  button.style.left = `${rect.right - button.offsetWidth - 10}px`;
}

// Check if the button is on cooldown
function isOnCooldown() {
  const now = Date.now();
  const timeSinceLastUse = now - COOLDOWN_CONFIG.lastUsedTime;
  return timeSinceLastUse < COOLDOWN_CONFIG.durationMs;
}

// Start the cooldown timer
function startCooldown() {
  COOLDOWN_CONFIG.lastUsedTime = Date.now();
}

// Get remaining cooldown time in seconds
function getRemainingCooldownSeconds() {
  const now = Date.now();
  const timeSinceLastUse = now - COOLDOWN_CONFIG.lastUsedTime;
  const remainingMs = Math.max(0, COOLDOWN_CONFIG.durationMs - timeSinceLastUse);
  return Math.ceil(remainingMs / 1000);
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
      
      // Check if the button is on cooldown
      if (isOnCooldown()) {
        const remainingSeconds = getRemainingCooldownSeconds();
        alert(`Please wait ${remainingSeconds} seconds before enhancing again.`);
        return;
      }
      
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
      } else if (activeInput.textContent) {
        promptText = activeInput.textContent;
      }
      
      if (!promptText.trim()) {
        console.error('QuantumPrompt: No prompt text found');
        return;
      }
      
      // Disable the button and show loading state
      enhanceButton.disabled = true;
      enhanceButton.innerHTML = '⏳ Enhancing...';
      
      try {
        // Start the cooldown
        startCooldown();
        
        // Enhance the prompt
        const enhancedPrompt = await enhancePrompt(promptText);
        
        // Update the input with the enhanced prompt
        if (activeInput.value !== undefined && activeInput.value !== null) {
          activeInput.value = enhancedPrompt;
          // Trigger input event to notify the application
          activeInput.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (activeInput.textContent !== undefined) {
          activeInput.textContent = enhancedPrompt;
          // Trigger input event to notify the application
          activeInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
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
    
    // Update button appearance based on cooldown status
    if (isOnCooldown()) {
      const remainingSeconds = getRemainingCooldownSeconds();
      enhanceButton.innerHTML = `⏳ ${remainingSeconds}s`;
      enhanceButton.style.opacity = '0.7';
    } else {
      enhanceButton.innerHTML = '✨ Enhance';
      enhanceButton.style.opacity = '1';
    }
    
    // Make button visible and clickable
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
}

// Function to find input elements and set up hover behavior
function setupInputElements() {
  // Find all matching input elements
  PLATFORM_CONFIG.inputSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      setupHoverBehavior(element);
    });
  });
}

async function enhancePrompt(originalPrompt) {
  console.log('QuantumPrompt: Enhancing prompt:', originalPrompt);
  
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: 'enhancePrompt', prompt: originalPrompt },
      (response) => {
        if (response.success) {
          resolve(response.enhancedPrompt);
        } else {
          console.error('Error from background script:', response.error);
          // Use fallback if provided
          if (response.fallbackPrompt) {
            resolve(response.fallbackPrompt);
          } else {
            reject(new Error(response.error || 'Unknown error'));
          }
        }
      }
    );
  });
}

// Try to set up input elements immediately
setupInputElements();

// Try again after a short delay
setTimeout(setupInputElements, 1000);

// Try again after the page has fully loaded
window.addEventListener('load', () => {
  console.log('QuantumPrompt: Page loaded');
  setTimeout(setupInputElements, 1000);
});

// Set up a mutation observer to detect when new input elements are added
const observer = new MutationObserver(() => {
  setupInputElements();
});

// Start observing the document
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Update cooldown timer display every second
setInterval(() => {
  const enhanceButton = document.getElementById('quantum-enhance-btn');
  if (enhanceButton && isOnCooldown() && enhanceButton.style.opacity !== '0') {
    const remainingSeconds = getRemainingCooldownSeconds();
    enhanceButton.innerHTML = `⏳ ${remainingSeconds}s`;
  } else if (enhanceButton && !isOnCooldown() && enhanceButton.innerHTML.includes('s')) {
    enhanceButton.innerHTML = '✨ Enhance';
  }
}, 1000);

console.log('QuantumPrompt: Setup complete');
