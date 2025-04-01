document.addEventListener('DOMContentLoaded', () => {
  console.log('QuantumPrompt popup loaded');
  
  const promptInput = document.getElementById('prompt-input');
  const enhanceBtn = document.getElementById('enhance-btn');
  const loading = document.getElementById('loading');
  const result = document.getElementById('result');
  const enhancedText = document.getElementById('enhanced-text');
  const copyBtn = document.getElementById('copy-btn');
  
  // Enhance button click handler
  enhanceBtn.addEventListener('click', async () => {
    const promptText = promptInput.value.trim();
    
    if (!promptText) {
      alert('Please enter a prompt to enhance.');
      return;
    }
    
    try {
      // Show loading state
      enhanceBtn.disabled = true;
      loading.style.display = 'block';
      result.style.display = 'none';
      
      // Send message to background script to enhance the prompt
      chrome.runtime.sendMessage(
        { action: 'enhancePrompt', prompt: promptText },
        (response) => {
          if (response.success) {
            // Display the result
            enhancedText.textContent = response.enhancedPrompt;
            result.style.display = 'block';
          } else {
            console.error('Error from background script:', response.error);
            // Use fallback if provided
            if (response.fallbackPrompt) {
              enhancedText.textContent = response.fallbackPrompt;
              result.style.display = 'block';
            } else {
              alert('Failed to enhance prompt. Please try again.');
            }
          }
          
          // Hide loading state
          loading.style.display = 'none';
          enhanceBtn.disabled = false;
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to enhance prompt. Please try again.');
      loading.style.display = 'none';
      enhanceBtn.disabled = false;
    }
  });
  
  // Copy button click handler
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(enhancedText.textContent)
      .then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Copied!';
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy text:', err);
        alert('Failed to copy to clipboard. Please try again.');
      });
  });
}); 