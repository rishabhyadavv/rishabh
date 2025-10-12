// AI-Powered Learning Chatbot for Rishabh's Portfolio
class AIChatbot {
  constructor() {
    this.conversationHistory = [];
    this.isAIEnabled = true;
    this.openAIKey = null;
    this.learningMemory = this.loadLearningMemory();
    this.userPreferences = this.loadUserPreferences();
    this.knowledgeBase = this.loadKnowledgeBase();
    this.responseQuality = this.loadResponseQuality();
    this.initializeElements();
    this.setupEventListeners();
    this.checkOpenAIKey();
  }

  // Learning and Memory System
  loadLearningMemory() {
    const saved = localStorage.getItem('chatbot_learning_memory');
    return saved ? JSON.parse(saved) : {
      totalInteractions: 0,
      userQuestions: [],
      successfulResponses: [],
      failedResponses: [],
      learningPatterns: {},
      lastUpdated: new Date().toISOString()
    };
  }

  saveLearningMemory() {
    this.learningMemory.lastUpdated = new Date().toISOString();
    localStorage.setItem('chatbot_learning_memory', JSON.stringify(this.learningMemory));
  }

  loadUserPreferences() {
    const saved = localStorage.getItem('chatbot_user_preferences');
    if (saved) {
      return JSON.parse(saved);
    }
    
    // Detect device language for initial preference
    const deviceLanguage = navigator.language || navigator.languages?.[0] || 'en';
    const languageCode = deviceLanguage.toLowerCase().split('-')[0];
    const preferredLanguage = languageCode === 'de' ? 'de' : 'en';
    
    return {
      preferredLanguage: preferredLanguage,
      responseStyle: 'professional',
      detailLevel: 'medium',
      topics: [],
      interactionCount: 0
    };
  }

  saveUserPreferences() {
    localStorage.setItem('chatbot_user_preferences', JSON.stringify(this.userPreferences));
  }

  loadKnowledgeBase() {
    const saved = localStorage.getItem('chatbot_knowledge_base');
    return saved ? JSON.parse(saved) : {
      customFacts: {},
      userCorrections: {},
      newInformation: {},
      topicExpertise: {},
      lastUpdated: new Date().toISOString()
    };
  }

  saveKnowledgeBase() {
    this.knowledgeBase.lastUpdated = new Date().toISOString();
    localStorage.setItem('chatbot_knowledge_base', JSON.stringify(this.knowledgeBase));
  }

  loadResponseQuality() {
    const saved = localStorage.getItem('chatbot_response_quality');
    return saved ? JSON.parse(saved) : {
      responseRatings: {},
      improvementSuggestions: {},
      successfulPatterns: {},
      failedPatterns: {},
      averageRating: 0,
      totalRatings: 0
    };
  }

  saveResponseQuality() {
    localStorage.setItem('chatbot_response_quality', JSON.stringify(this.responseQuality));
  }

  // Learning Methods
  learnFromInteraction(userMessage, botResponse, wasSuccessful = true) {
    console.log('🧠 Learning from interaction:', { userMessage, wasSuccessful });
    
    this.learningMemory.totalInteractions++;
    this.learningMemory.userQuestions.push({
      question: userMessage,
      timestamp: new Date().toISOString(),
      wasSuccessful
    });

    if (wasSuccessful) {
      this.learningMemory.successfulResponses.push({
        question: userMessage,
        response: botResponse,
        timestamp: new Date().toISOString()
      });
    } else {
      this.learningMemory.failedResponses.push({
        question: userMessage,
        response: botResponse,
        timestamp: new Date().toISOString()
      });
    }

    this.extractLearningPatterns(userMessage, botResponse, wasSuccessful);
    this.saveLearningMemory();
  }

  extractLearningPatterns(userMessage, botResponse, wasSuccessful) {
    const message = userMessage.toLowerCase();
    
    // Learn about user interests
    if (message.includes('project') || message.includes('app')) {
      this.learningMemory.learningPatterns.projectInterest = 
        (this.learningMemory.learningPatterns.projectInterest || 0) + 1;
    }
    
    if (message.includes('experience') || message.includes('career')) {
      this.learningMemory.learningPatterns.experienceInterest = 
        (this.learningMemory.learningPatterns.experienceInterest || 0) + 1;
    }
    
    if (message.includes('skill') || message.includes('technology')) {
      this.learningMemory.learningPatterns.skillInterest = 
        (this.learningMemory.learningPatterns.skillInterest || 0) + 1;
    }

    // Learn response preferences
    if (wasSuccessful) {
      if (botResponse.length > 200) {
        this.learningMemory.learningPatterns.prefersDetailedResponses = 
          (this.learningMemory.learningPatterns.prefersDetailedResponses || 0) + 1;
      }
      
      if (botResponse.includes('Rishabh')) {
        this.learningMemory.learningPatterns.prefersPersonalContext = 
          (this.learningMemory.learningPatterns.prefersPersonalContext || 0) + 1;
      }
    }
  }

  adaptResponseStyle(userMessage) {
    const patterns = this.learningMemory.learningPatterns;
    let adaptedContext = '';

    // Adapt based on user interests
    if (patterns.projectInterest > patterns.experienceInterest) {
      adaptedContext += 'Focus on projects and technical achievements. ';
    }
    
    if (patterns.experienceInterest > patterns.projectInterest) {
      adaptedContext += 'Focus on career progression and leadership experience. ';
    }

    // Adapt response detail level
    if (patterns.prefersDetailedResponses > 2) {
      adaptedContext += 'Provide detailed, comprehensive responses. ';
    } else {
      adaptedContext += 'Keep responses concise but informative. ';
    }

    // Adapt personalization
    if (patterns.prefersPersonalContext > 1) {
      adaptedContext += 'Include personal context and specific examples. ';
    }

    return adaptedContext;
  }

  addUserCorrection(originalQuestion, correction, correctInformation) {
    console.log('📝 User correction received:', { originalQuestion, correction, correctInformation });
    
    this.knowledgeBase.userCorrections[originalQuestion] = {
      correction: correction,
      correctInformation: correctInformation,
      timestamp: new Date().toISOString()
    };

    this.knowledgeBase.customFacts[correction] = correctInformation;
    this.saveKnowledgeBase();
  }

  rateResponse(responseId, rating, feedback = '') {
    console.log('⭐ Response rated:', { responseId, rating, feedback });
    
    this.responseQuality.responseRatings[responseId] = {
      rating: rating,
      feedback: feedback,
      timestamp: new Date().toISOString()
    };

    this.responseQuality.totalRatings++;
    const totalScore = Object.values(this.responseQuality.responseRatings)
      .reduce((sum, r) => sum + r.rating, 0);
    this.responseQuality.averageRating = totalScore / this.responseQuality.totalRatings;

    this.saveResponseQuality();
  }

  getPersonalizedResponse(userMessage, baseResponse) {
    const adaptedStyle = this.adaptResponseStyle(userMessage);
    const userCorrections = this.knowledgeBase.userCorrections;
    
    let personalizedResponse = baseResponse;
    Object.keys(userCorrections).forEach(question => {
      if (userMessage.toLowerCase().includes(question.toLowerCase())) {
        const correction = userCorrections[question];
        personalizedResponse += `\n\nNote: ${correction.correctInformation}`;
      }
    });

    if (adaptedStyle.includes('detailed')) {
      personalizedResponse = this.enhanceResponseDetail(personalizedResponse);
    }

    return personalizedResponse;
  }

  enhanceResponseDetail(response) {
    const patterns = this.learningMemory.learningPatterns;
    
    if (patterns.projectInterest > 2) {
      response += '\n\nWould you like to know more about any specific project or technology?';
    }
    
    if (patterns.experienceInterest > 2) {
      response += '\n\nI can provide more details about Rishabh\'s career progression or leadership experience.';
    }

    return response;
  }

  initializeElements() {
    this.chatbotToggle = document.getElementById('chatbot-toggle');
    this.chatbotContainer = document.getElementById('chatbot-container');
    this.chatbotClose = document.getElementById('chatbot-close');
    this.chatbotInput = document.getElementById('chatbot-input');
    this.chatbotSend = document.getElementById('chatbot-send');
    this.chatbotMessages = document.getElementById('chatbot-messages');
    this.typingIndicator = document.getElementById('typing-indicator');
  }

  setupEventListeners() {
    if (this.chatbotToggle && this.chatbotContainer) {
      this.chatbotToggle.addEventListener('click', () => {
        this.chatbotContainer.classList.toggle('active');
        if (this.chatbotContainer.classList.contains('active')) {
          this.chatbotInput.focus();
        }
      });

      this.chatbotClose.addEventListener('click', () => {
        this.chatbotContainer.classList.remove('active');
      });

      this.chatbotSend.addEventListener('click', () => {
        this.sendAIMessage();
      });

      this.chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.sendAIMessage();
        }
      });

      // Listen for language changes to update chatbot placeholder
      this.observeLanguageChanges();
    }
  }

  observeLanguageChanges() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-language') {
          this.updateChatbotLanguage();
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-language']
    });
  }

  updateChatbotLanguage() {
    const currentLang = document.body.getAttribute('data-language') || 'en';
    if (this.chatbotInput) {
      const placeholder = this.chatbotInput.getAttribute(`data-${currentLang}-placeholder`);
      if (placeholder) {
        this.chatbotInput.placeholder = placeholder;
      }
    }
  }

  checkOpenAIKey() {
    this.openAIKey = localStorage.getItem('openai_api_key') || 
                     (typeof OPENAI_CONFIG !== 'undefined' ? OPENAI_CONFIG.API_KEY : null);
    
    console.log('🔑 OpenAI Key Check:', {
      hasLocalStorageKey: !!localStorage.getItem('openai_api_key'),
      hasConfigKey: !!(typeof OPENAI_CONFIG !== 'undefined' && OPENAI_CONFIG.API_KEY),
      keyLength: this.openAIKey ? this.openAIKey.length : 0,
      keyPrefix: this.openAIKey ? this.openAIKey.substring(0, 10) + '...' : 'none'
    });
    
    if (!this.openAIKey) {
      console.log('⚠️ No OpenAI key found, showing fallback mode');
      this.showAPIKeyPrompt();
    } else {
      console.log('✅ OpenAI key found, API mode enabled');
    }
  }


  async sendAIMessage() {
    const message = this.chatbotInput.value.trim();
    if (!message) return;

    // Add user message
    this.addMessage(message, 'user');
    this.chatbotInput.value = '';
    
    // Show typing indicator
    this.showTypingIndicator();

    try {
      let response;
      if (this.isAIEnabled) {
        response = await this.getAIResponse(message);
      } else {
        response = this.generateFallbackResponse(message);
      }
      
      // Personalize response based on learning
      response = this.getPersonalizedResponse(message, response);
      
      // Hide typing indicator
      this.hideTypingIndicator();
      
      // Add AI response
      this.addMessage(response, 'bot');
      
      // Learn from this interaction
      this.learnFromInteraction(message, response, true);
      
      // Store in conversation history
      this.conversationHistory.push({ role: 'user', content: message });
      this.conversationHistory.push({ role: 'assistant', content: response });
      
    } catch (error) {
      console.error('AI Error:', error);
      this.hideTypingIndicator();
      
      // Learn from failed interaction
      this.learnFromInteraction(message, error.message, false);
      
      // Show user-friendly error message for quota issues
      if (error.message.includes('QUOTA_EXCEEDED')) {
        const currentLang = document.body.getAttribute('data-language') || 'en';
        const quotaMessage = currentLang === 'en' 
          ? "⚠️ OpenAI API quota exceeded. Please check your billing details at https://platform.openai.com/account/billing. Falling back to intelligent responses."
          : "⚠️ OpenAI API-Quota überschritten. Bitte überprüfen Sie Ihre Abrechnungsdetails unter https://platform.openai.com/account/billing. Wechsle zu intelligenten Antworten.";
        this.addMessage(quotaMessage, 'bot');
        return;
      }
      
      // Fallback to local knowledge base for other errors
      const fallbackResponse = this.generateFallbackResponse(message);
      this.addMessage(fallbackResponse, 'bot');
    }
  }

  async getAIResponse(userMessage) {
    const currentLang = document.body.getAttribute('data-language') || 'en';
    
    console.log('🤖 AI Response Request:', {
      message: userMessage,
      language: currentLang,
      hasOpenAIKey: !!this.openAIKey,
      conversationHistoryLength: this.conversationHistory.length,
      learningPatterns: this.learningMemory.learningPatterns
    });
    
    // Try OpenAI API first if key is available
    if (this.openAIKey) {
      try {
        console.log('🚀 Attempting OpenAI API call...');
        const response = await this.getOpenAIResponse(userMessage, currentLang);
        console.log('✅ OpenAI API success:', response.substring(0, 100) + '...');
        return response;
      } catch (error) {
        console.warn('❌ OpenAI API failed, falling back to intelligent responses:', error.message);
        // Fall through to fallback
      }
    }
    
    // Fallback to intelligent mock responses
    console.log('🔄 Using fallback responses');
    return await this.mockAIResponse(userMessage, currentLang);
  }

  async getOpenAIResponse(userMessage, currentLang) {
    const portfolioContext = {
      en: `You are an AI assistant for Rishabh Yadav, a Lead Mobile Developer with 13+ years of experience. Here's his background:

CURRENT ROLE: Lead Mobile Developer at BurdaVerlag (Hubert Burda Media), Munich, Germany
- Leading a team of 10 developers
- Managing three flagship apps: Focus+ (News), EinfachBacken (Baking), Mein schöner Garten (Plant Care)
- March 2025 - Present

PREVIOUS EXPERIENCE:
- Mobile App Architect at European Computer Telecoms (April 2019 - Nov 2024)
- Technical Lead at Publicis Sapient (August 2015 - April 2019)

KEY ACHIEVEMENTS:
- 4.5+ App Store ratings across projects
- McDonald's app ranked #1 in Germany
- 30% efficiency boost through CI/CD optimization
- 100% on-time project delivery
- Managed teams of 10+ developers

TECHNICAL SKILLS: React Native, iOS (Swift/Objective-C), Android (Kotlin), JavaScript/TypeScript, React/Angular, Node.js, Clean Architecture, Mobile Strategy, Team Leadership, CI/CD Pipelines, GitLab/GitHub, Fastlane, Bitrise, EAS, Jest, Detox, Appium, Test-Driven Development, Agile Leadership, Cross-functional Collaboration

CONTACT: rrishuyadav@gmail.com, LinkedIn: https://www.linkedin.com/in/rrishuyadav
AVAILABILITY: Available for remote work, open to relocation, seeking full-time positions

Respond naturally and helpfully to questions about Rishabh's work, experience, and skills. Keep responses concise but informative.`,

      de: `Sie sind ein KI-Assistent für Rishabh Yadav, einen Lead Mobile Developer mit 13+ Jahren Erfahrung. Hier ist sein Hintergrund:

AKTUELLE ROLLE: Lead Mobile Developer bei BurdaVerlag (Hubert Burda Media), München, Deutschland
- Leitet ein Team von 10 Entwicklern
- Verwaltet drei Flaggschiff-Apps: Focus+ (Nachrichten), EinfachBacken (Backen), Mein schöner Garten (Pflanzenpflege)
- März 2025 - Gegenwart

VORHERIGE ERFAHRUNG:
- Mobile App Architect bei European Computer Telecoms (April 2019 - Nov 2024)
- Technical Lead bei Publicis Sapient (August 2015 - April 2019)

WICHTIGE ERFOLGE:
- 4.5+ App Store-Bewertungen über Projekte hinweg
- McDonald's-App rangierte #1 in Deutschland
- 30% Effizienzsteigerung durch CI/CD-Optimierung
- 100% pünktliche Projektlieferung
- Führte Teams mit 10+ Entwicklern

TECHNISCHE FÄHIGKEITEN: React Native, iOS (Swift/Objective-C), Android (Kotlin), JavaScript/TypeScript, React/Angular, Node.js, Clean Architecture, Mobile-Strategie, Teamführung, CI/CD-Pipelines, GitLab/GitHub, Fastlane, Bitrise, EAS, Jest, Detox, Appium, Test-Driven Development, Agile Leadership, Cross-functional Collaboration

KONTAKT: rrishuyadav@gmail.com, LinkedIn: https://www.linkedin.com/in/rrishuyadav
VERFÜGBARKEIT: Verfügbar für Remote-Arbeit, offen für Umzug, sucht Vollzeitstellen

Antworten Sie natürlich und hilfreich auf Fragen über Rishabhs Arbeit, Erfahrung und Fähigkeiten. Halten Sie Antworten prägnant aber informativ.`
    };

    const messages = [
      { role: 'system', content: portfolioContext[currentLang] },
      ...this.conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: userMessage }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API Error:', errorData);
      
      if (errorData.error) {
        if (errorData.error.code === 'insufficient_quota') {
          throw new Error('QUOTA_EXCEEDED: OpenAI API quota exceeded. Please check your billing details.');
        } else if (errorData.error.code === 'invalid_api_key') {
          throw new Error('INVALID_KEY: OpenAI API key is invalid or expired.');
        } else if (errorData.error.code === 'rate_limit_exceeded') {
          throw new Error('RATE_LIMIT: OpenAI API rate limit exceeded. Please try again later.');
        }
      }
      
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Enhanced Mock AI Response (fallback when OpenAI is not available)
  async mockAIResponse(userMessage, currentLang) {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const message = userMessage.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hallo')) {
      return currentLang === 'en' 
        ? "Hello! I'm Rishabh's AI assistant. I'd be happy to help you learn about his mobile development expertise, current projects at BurdaVerlag, or answer any questions about his work. What would you like to know?"
        : "Hallo! Ich bin Rishabhs KI-Assistent. Ich helfe Ihnen gerne dabei, mehr über seine Mobile-Entwicklungsexpertise, aktuelle Projekte bei BurdaVerlag zu erfahren oder Fragen über seine Arbeit zu beantworten. Was möchten Sie wissen?";
    }
    
    if (message.includes('current') || message.includes('company') || message.includes('aktuell') || message.includes('unternehmen')) {
      return currentLang === 'en'
        ? "Rishabh is currently a Lead Mobile Developer at BurdaVerlag (Hubert Burda Media) in Munich, Germany. He's been in this role since March 2025, leading a team of 10 developers across three flagship mobile applications: Focus+ (news), EinfachBacken (baking), and Mein schöner Garten (gardening). This role allows him to combine his technical expertise with team leadership skills."
        : "Rishabh ist derzeit Lead Mobile Developer bei BurdaVerlag (Hubert Burda Media) in München, Deutschland. Er ist seit März 2025 in dieser Rolle und leitet ein Team von 10 Entwicklern für drei Flaggschiff-Mobile-Anwendungen: Focus+ (Nachrichten), EinfachBacken (Backen) und Mein schöner Garten (Garten). Diese Rolle ermöglicht es ihm, seine technische Expertise mit Teamführungskompetenzen zu verbinden.";
    }
    
    if (message.includes('experience') || message.includes('erfahrung')) {
      return currentLang === 'en'
        ? "Rishabh brings 13+ years of mobile development experience to the table. His career progression shows strong technical leadership: starting as Technical Lead at Publicis Sapient (2015-2019), advancing to Mobile App Architect at European Computer Telecoms (2019-2024), and now leading mobile strategy at BurdaVerlag. He's consistently managed large teams and delivered high-quality applications with excellent App Store ratings."
        : "Rishabh bringt 13+ Jahre Mobile-Entwicklungserfahrung mit. Seine Karriereentwicklung zeigt starke technische Führung: Beginn als Technical Lead bei Publicis Sapient (2015-2019), Weiterentwicklung zum Mobile App Architect bei European Computer Telecoms (2019-2024) und jetzt Leitung der Mobile-Strategie bei BurdaVerlag. Er hat konsequent große Teams geführt und hochwertige Anwendungen mit ausgezeichneten App Store-Bewertungen geliefert.";
    }
    
    if (message.includes('project') || message.includes('projekt') || message.includes('app')) {
      return currentLang === 'en'
        ? "Rishabh has worked on several impressive projects! At BurdaVerlag, he's leading development of three flagship apps: Focus+ (a news app with real-time feeds and subscriptions), EinfachBacken (a baking platform with step-by-step guides), and Mein schöner Garten (Germany's leading gardening app). Previously, he delivered the McDonald's app that ranked #1 in Germany, and created a low-code mobile platform that streamlined app development for multiple clients."
        : "Rishabh hat an mehreren beeindruckenden Projekten gearbeitet! Bei BurdaVerlag leitet er die Entwicklung von drei Flaggschiff-Apps: Focus+ (eine Nachrichten-App mit Echtzeit-Feeds und Abonnements), EinfachBacken (eine Backplattform mit Schritt-für-Schritt-Anleitungen) und Mein schöner Garten (Deutschlands führende Garten-App). Zuvor lieferte er die McDonald's-App, die in Deutschland #1 wurde, und erstellte eine Low-Code-Mobile-Plattform, die die App-Entwicklung für mehrere Kunden optimierte.";
    }
    
    if (message.includes('skill') || message.includes('fähigkeit') || message.includes('technology')) {
      return currentLang === 'en'
        ? "Rishabh's technical expertise spans the full mobile development stack. He's proficient in React Native, native iOS (Swift/Objective-C), and Android (Kotlin) development. His skills also include JavaScript/TypeScript, React/Angular, Node.js, and he excels in Clean Architecture principles. Beyond technical skills, he's experienced in Mobile Strategy, Team Leadership, CI/CD Pipelines, and Agile methodologies. He's particularly strong in performance optimization and scalable architecture design."
        : "Rishabhs technische Expertise umfasst den gesamten Mobile-Entwicklungsstack. Er ist versiert in React Native, nativer iOS- (Swift/Objective-C) und Android-Entwicklung (Kotlin). Seine Fähigkeiten umfassen auch JavaScript/TypeScript, React/Angular, Node.js, und er ist erfahren in Clean Architecture-Prinzipien. Über technische Fähigkeiten hinaus ist er erfahren in Mobile-Strategie, Teamführung, CI/CD-Pipelines und agilen Methoden. Er ist besonders stark in Leistungsoptimierung und skalierbarer Architektur-Design.";
    }
    
    if (message.includes('team') || message.includes('lead') || message.includes('manage')) {
      return currentLang === 'en'
        ? "Rishabh is an experienced team leader who currently manages 10 developers at BurdaVerlag. His leadership style focuses on collaboration, mentoring, and maintaining high-quality delivery standards. He has a proven track record of managing cross-functional teams of 10+ developers, achieving 100% on-time project delivery, and boosting team efficiency by 30% through process optimization. His approach combines technical expertise with strong people management skills."
        : "Rishabh ist ein erfahrener Teamleiter, der derzeit 10 Entwickler bei BurdaVerlag führt. Sein Führungsstil konzentriert sich auf Zusammenarbeit, Mentoring und Aufrechterhaltung hoher Qualitätsstandards. Er hat eine nachgewiesene Erfolgsbilanz bei der Führung multidisziplinärer Teams mit 10+ Entwicklern, erreichte 100% pünktliche Projektlieferung und steigerte die Teameffizienz um 30% durch Prozessoptimierung. Sein Ansatz kombiniert technische Expertise mit starken Menschenführungskompetenzen.";
    }
    
    if (message.includes('contact') || message.includes('kontakt') || message.includes('email')) {
      return currentLang === 'en'
        ? "You can reach Rishabh directly via email at rrishuyadav@gmail.com or connect with him on LinkedIn at https://www.linkedin.com/in/rrishuyadav. He's actively seeking new opportunities and is available for remote work, open to relocation, and interested in full-time positions as a Lead Mobile Developer or Mobile Architect. He's always happy to discuss potential collaborations or career opportunities."
        : "Sie können Rishabh direkt per E-Mail unter rrishuyadav@gmail.com erreichen oder sich mit ihm auf LinkedIn unter https://www.linkedin.com/in/rrishuyadav verbinden. Er sucht aktiv nach neuen Möglichkeiten und ist verfügbar für Remote-Arbeit, offen für Umzug und interessiert an Vollzeitstellen als Lead Mobile Developer oder Mobile Architect. Er freut sich immer über Gespräche über potenzielle Zusammenarbeiten oder Karrieremöglichkeiten.";
    }
    
    // Default intelligent response
    return currentLang === 'en'
      ? "That's an interesting question! Based on Rishabh's extensive background in mobile development and team leadership, I can provide detailed insights about his technical expertise, project management approach, or career achievements. Could you be more specific about what aspect of his work you'd like to explore?"
      : "Das ist eine interessante Frage! Basierend auf Rishabhs umfangreichem Hintergrund in der Mobile-Entwicklung und Teamführung kann ich detaillierte Einblicke in seine technische Expertise, Projektmanagement-Ansatz oder Karriereerfolge geben. Könnten Sie spezifischer sein, welchen Aspekt seiner Arbeit Sie erkunden möchten?";
  }

  generateFallbackResponse(userMessage) {
    const currentLang = document.body.getAttribute('data-language') || 'en';
    const message = userMessage.toLowerCase();
    
    if (message.includes('experience') || message.includes('erfahrung')) {
      return currentLang === 'en' 
        ? "Rishabh has 13+ years of experience in mobile development. He's currently a Lead Mobile Developer at BurdaVerlag, leading a team of 10 developers on three flagship apps: Focus+ (News), EinfachBacken (Baking), and Mein schöner Garten (Plant Care)."
        : "Rishabh hat 13+ Jahre Erfahrung in der Mobile-Entwicklung. Er ist derzeit Lead Mobile Developer bei BurdaVerlag und leitet ein Team von 10 Entwicklern bei drei Flaggschiff-Apps: Focus+ (Nachrichten), EinfachBacken (Backen) und Mein schöner Garten (Pflanzenpflege).";
    }
    
    return currentLang === 'en' 
      ? "I can help you learn about Rishabh's experience, projects, skills, team leadership, achievements, contact information, current company, or availability. What would you like to know more about?"
      : "Ich kann Ihnen helfen, mehr über Rishabhs Erfahrung, Projekte, Fähigkeiten, Teamführung, Erfolge, Kontaktinformationen, aktuelles Unternehmen oder Verfügbarkeit zu erfahren. Worüber möchten Sie mehr wissen?";
  }

  addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${sender}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const p = document.createElement('p');
    p.textContent = text;
    contentDiv.appendChild(p);
    messageDiv.appendChild(contentDiv);
    
    this.chatbotMessages.appendChild(messageDiv);
    this.chatbotMessages.scrollTop = this.chatbotMessages.scrollHeight;
  }

  showTypingIndicator() {
    if (this.typingIndicator) {
      this.typingIndicator.style.display = 'flex';
    }
  }

  hideTypingIndicator() {
    if (this.typingIndicator) {
      this.typingIndicator.style.display = 'none';
    }
  }

}

// Initialize AI Chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  window.aiChatbot = new AIChatbot();
});