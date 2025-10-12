// OpenAI API Configuration Template
// Copy this file to js/config.js and add your actual API key

const OPENAI_CONFIG = {
  // Replace with your actual OpenAI API key from https://platform.openai.com/api-keys
  API_KEY: 'your_openai_api_key_here',
  MODEL: 'gpt-3.5-turbo',
  MAX_TOKENS: 500,
  TEMPERATURE: 0.7
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OPENAI_CONFIG;
} else if (typeof window !== 'undefined') {
  window.OPENAI_CONFIG = OPENAI_CONFIG;
}

// Instructions:
// 1. Copy this file: cp js/config.template.js js/config.js
// 2. Replace 'your_openai_api_key_here' with your actual OpenAI API key
// 3. The config.js file is already in .gitignore for security
