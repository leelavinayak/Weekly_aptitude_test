const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Returns a set of mock questions when the AI service is unavailable.
 * Now expanded with specialized templates for popular topics.
 */
const generateMockQuestions = (language, numQuestions, difficulty) => {
  console.log(`[MOCK] Generating ${numQuestions} fallback questions for "${language}" at ${difficulty} level...`);
  
  const normalizedTopic = language.toLowerCase();
  
  // Specialized Question Pools
  const pools = {
    c: [
        { q: "What is the correct syntax to declare a pointer in C?", o: ["int *p;", "int p*;", "int &p;", "ptr p;"], a: "int *p;" },
        { q: "Which function is used to allocate memory dynamically in C?", o: ["malloc()", "alloc()", "new()", "memalloc()"], a: "malloc()" },
        { q: "What is the size of 'int' data type in C (usually)?", o: ["2 or 4 bytes", "1 byte", "8 bytes", "Varies by compiler"], a: "2 or 4 bytes" },
        { q: "Which header file is required for printf() function?", o: ["stdio.h", "conio.h", "stdlib.h", "math.h"], a: "stdio.h" },
        { q: "What is a 'NULL' pointer in C?", o: ["A pointer pointing to nothing", "A pointer with value 0", "An uninitialized pointer", "A pointer to a constant"], a: "A pointer with value 0" },
        { q: "Which operator is used to get the address of a variable?", o: ["&", "*", "&&", "@"], a: "&" },
        { q: "What is the result of 5 / 2 in integer division in C?", o: ["2", "2.5", "3", "0"], a: "2" },
        { q: "Keyword used to define a structure in C?", o: ["struct", "define", "union", "class"], a: "struct" },
        { q: "Standard return type of main() in C?", o: ["int", "void", "float", "char"], a: "int" },
        { q: "Which loop is guaranteed to execute at least once?", o: ["do-while", "while", "for", "none"], a: "do-while" }
    ],
    python: [
        { q: "Which keyword is used to create a function in Python?", o: ["def", "func", "function", "define"], a: "def" },
        { q: "What is the correct way to create a list in Python?", o: ["[]", "{}", "()", "<>"], a: "[]" },
        { q: "How do you start a comment in Python?", o: ["#", "//", "/*", "--"], a: "#" },
        { q: "Which of these is a mutable data type?", o: ["list", "tuple", "string", "int"], a: "list" },
        { q: "How do you check the length of a string 's'?", o: ["len(s)", "s.length()", "length(s)", "s.size()"], a: "len(s)" },
        { q: "Which operator is used for power (exponentiation)?", o: ["**", "^", "^^", "pow"], a: "**" },
        { q: "What is the output of bool([])?", o: ["False", "True", "None", "Error"], a: "False" },
        { q: "How do you import a module 'math'?", o: ["import math", "include math", "require math", "use math"], a: "import math" },
        { q: "Python list method to add an element at the end?", o: ["append()", "add()", "insert()", "push()"], a: "append()" },
        { q: "Keyword used for 'else if' in Python?", o: ["elif", "elseif", "elsif", "else if"], a: "elif" }
    ],
    java: [
        { q: "Which keyword is used to inherit a class in Java?", o: ["extends", "implements", "inherits", "using"], a: "extends" },
        { q: "What is the entry point of a Java program?", o: ["main() method", "init() method", "start() method", "None"], a: "main() method" },
        { q: "Which of these is NOT a primitive data type in Java?", o: ["String", "int", "boolean", "double"], a: "String" },
        { q: "What is the default value of an int variable?", o: ["0", "null", "undefined", "1"], a: "0" },
        { q: "Which package contains the Scanner class?", o: ["java.util", "java.lang", "java.io", "java.net"], a: "java.util" },
        { q: "Keyword to create an object in Java?", o: ["new", "create", "alloc", "make"], a: "new" },
        { q: "Can a class implement multiple interfaces?", o: ["Yes", "No", "Only two", "Depends on JDK"], a: "Yes" },
        { q: "Which access modifier makes a member visible only within its class?", o: ["private", "public", "protected", "default"], a: "private" },
        { q: "What does JVM stand for?", o: ["Java Virtual Machine", "Java Vital Model", "Joint Virtual Machine", "Java Variable Manager"], a: "Java Virtual Machine" },
        { q: "Which keyword is used to handle exceptions?", o: ["try", "catch", "throw", "All of these"], a: "All of these" }
    ],
    javascript: [
        { q: "What is the correct way to declare a constant in JS?", o: ["const", "let", "var", "constant"], a: "const" },
        { q: "Which symbol is used for template literals?", o: ["Backticks", "Single quotes", "Double quotes", "Parentheses"], a: "Backticks" },
        { q: "What is 'NaN' in JavaScript?", o: ["Not a Number", "Not a Null", "New and Now", "Negative and Null"], a: "Not a Number" },
        { q: "Which method joins two or more arrays?", o: ["concat()", "join()", "push()", "merge()"], a: "concat()" },
        { q: "Result of '2' + 2 in JS?", o: ["'22'", "4", "NaN", "Error"], a: "'22'" },
        { q: "Which keyword refers to the current object?", o: ["this", "self", "me", "current"], a: "this" },
        { q: "Arrow function syntax?", o: ["() => {}", "func => {}", "function()", "{} => ()"], a: "() => {}" },
        { q: "Which method removes the last element of an array?", o: ["pop()", "shift()", "remove()", "last()"], a: "pop()" },
        { q: "Equality operator that checks value and type?", o: ["===", "==", "=", "==!"], a: "===" },
        { q: "What is the DOM?", o: ["Document Object Model", "Data Object Model", "Digital Office Model", "None"], a: "Document Object Model" }
    ],
    react: [
        { q: "Which hook is used for side effects in React?", o: ["useEffect", "useState", "useContext", "useMemo"], a: "useEffect" },
        { q: "What is the virtual DOM?", o: ["A lightweight copy of the real DOM", "A direct manipulation of browser HTML", "A CSS styling engine", "A server-side rendering tool"], a: "A lightweight copy of the real DOM" },
        { q: "How do you pass data from parent to child in React?", o: ["Props", "State", "Context", "Redux"], a: "Props" },
        { q: "What is the purpose of 'key' prop in lists?", o: ["Help identify changed items", "Style the item", "Store the index", "Bind event handlers"], a: "Help identify changed items" }
    ],
    node: [
        { q: "Which object is used to access command line arguments in Node?", o: ["process.argv", "sys.args", "os.params", "cmd.line"], a: "process.argv" },
        { q: "What is the package manager for Node.js?", o: ["npm", "pip", "maven", "gem"], a: "npm" },
        { q: "Which module is used to create a web server?", o: ["http", "fs", "path", "url"], a: "http" },
        { q: "What is the default behavior of Node.js?", o: ["Single-threaded and Non-blocking", "Multi-threaded and Blocking", "Single-threaded and Blocking", "None of these"], a: "Single-threaded and Non-blocking" }
    ],
    sql: [
        { q: "Which command is used to fetch data from a table?", o: ["SELECT", "GET", "FETCH", "EXTRACT"], a: "SELECT" },
        { q: "What does SQL stand for?", o: ["Structured Query Language", "Strong Question Language", "Simple Query List", "None"], a: "Structured Query Language" },
        { q: "Keyword used to remove duplicates in a result set?", o: ["DISTINCT", "UNIQUE", "DIFFERENT", "SINGLE"], a: "DISTINCT" },
        { q: "Which clause is used to filter group results?", o: ["HAVING", "WHERE", "FILTER", "GROUP BY"], a: "HAVING" }
    ]
  };

  const generalTemplates = [
    { q: "What is a core architectural principle of ${language}?", o: ["Modularity", "Monolithic structure", "Linear execution", "No abstraction"], a: "Modularity" },
    { q: "Which of these is a valid syntax convention in ${language}?", o: ["Indentation and clarity", "No whitespace", "Obfuscation", "Redundancy"], a: "Indentation and clarity" },
    { q: "How does ${language} typically handle error management?", o: ["Exception handling", "Ignoring crashes", "Kernel panic", "None"], a: "Exception handling" },
    { q: "What is the typical use case for ${language} in modern industry?", o: ["Scalable systems", "One-off scripts", "Legacy maintenance", "Manual documentation"], a: "Scalable systems" },
    { q: "Which component is essential for running code written in ${language}?", o: ["Compiler or Runtime", "Graphics card", "Word processor", "Printer"], a: "Compiler or Runtime" }
  ];

  // Pick the pool
  let activePool = generalTemplates;
  for (const key in pools) {
    if (normalizedTopic.includes(key)) {
      activePool = pools[key];
      break;
    }
  }

  // Shuffle the pool for variety
  const shuffled = [...activePool].sort(() => 0.5 - Math.random());
  
  const result = [];
  for (let i = 0; i < numQuestions; i++) {
    // For general templates, we need to inject the language name
    const item = shuffled[i % shuffled.length];
    result.push({
      question: item.q.includes("${language}") ? item.q.replace(/\$\{language\}/g, language) : item.q,
      options: [...item.o],
      correctAnswer: item.a
    });
  }
  
  // If we need more than pool size, just add generic ones to avoid exact duplicates
  if (result.length < numQuestions) {
      for(let i = result.length; i < numQuestions; i++) {
          result.push({
            question: `Advanced concept #${i+1} in ${language} relates to...?`,
            options: ["Optimized performance", "Legacy support", "New features", "Cross-platform compatibility"],
            correctAnswer: "Optimized performance"
          });
      }
  }

  return result;
};

/**
 * Generates quiz questions using Google Gemini with automatic retries and failover.
 * Added gemini-1.5-flash as a fallback retry step.
 */
const generateQuizQuestions = async (language, numQuestions, difficulty = 'medium') => {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Rotation strategy: trying different models to bypass specific model quotas
  const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.0-flash-lite"];

  const difficultyMap = {
    easy:   'basic, beginner-friendly concepts — simple and straightforward',
    medium: 'intermediate level — requires practical understanding',
    hard:   'advanced, expert-level — complex edge cases and deep knowledge',
    mixed:  'a mix of easy, medium and hard questions across all difficulty levels'
  };
  const difficultyDescription = difficultyMap[difficulty] || difficultyMap.medium;

  const sessionSeed = Math.floor(Math.random() * 1000000);
    
    const prompt = `
    You are a professional instructor. Generate ${numQuestions} specialized multiple choice questions for a certification-level quiz on "${language}".
    
    Difficulty Level: ${difficulty.toUpperCase()} (${difficultyDescription}).
    Session Unique ID: ${sessionSeed} (Ensure these questions are fresh and not identical to previous typical sets).
    
    GUIDELINES:
    1. TOPIC RELEVANCE: Questions must be strictly focused on "${language}". Avoid generic filler questions. Focus on core syntax, architectural patterns, common pitfalls, and advanced features specific to "${language}".
    2. NOVELTY: Explore various sub-topics within "${language}". Do not just stick to the most common introductory concepts.
    3. TECHNICAL ACCURACY: Ensure every question has exactly one undeniably correct answer among the 4 options.
    4. QUESTION VARIETY: Include a mix of conceptual questions, code-snippet analysis (if applicable), and real-world implementation scenarios.
    5. DATA FORMAT: Return a raw JSON array only. Each object must have: "question", "options" (array of 4 strings), and "correctAnswer" (matching the exact string in options).
    
    STRICT CONSTRAINTS:
    - NO markdown formatting (no \`\`\`json).
    - NO preamble, no post-text, no greetings.
    - JSON MUST BE PARSABLE.
  `;

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const maxAttempts = models.length;
  let lastError;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const currentModelName = models[attempt];
    try {
      console.log(`[Attempt ${attempt + 1}/${maxAttempts}] Generating quiz using ${currentModelName} for "${language}" (${difficulty})...`);
      
      if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey === '') {
        throw new Error('GEMINI_API_KEY is not configured properly');
      }

      const model = genAI.getGenerativeModel({ model: currentModelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      
      // Clean potential JSON markdown
      if (text.includes('```')) {
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      }

      let parsedData;
      try {
        parsedData = JSON.parse(text);
      } catch (e) {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          throw e;
        }
      }

      if (!Array.isArray(parsedData)) {
        throw new Error('AI response is not an array format');
      }
      
      console.log(`Successfully generated and parsed questions via ${currentModelName}!`);
      return parsedData;

    } catch (error) {
      lastError = error;
      const isQuotaError = error.message.includes('429') || error.message.includes('quota') || error.message.includes('limit');
      const isOverloaded = error.message.includes('503') || error.message.includes('demand') || error.message.includes('overloaded');
      
      console.warn(`Attempt with ${currentModelName} failed: ${error.message}`);

      if ((isQuotaError || isOverloaded) && (attempt < maxAttempts - 1)) {
        console.warn(`Retry logic: Switching to backup model...`);
        // Wait a bit before trying the next model
        await sleep(2000);
        continue;
      }

      // If it's the last attempt and we still have a quota error, trigger failover
      if (isQuotaError || isOverloaded || !apiKey) {
        console.warn('!!! FAILOVER: All AI Service options exhausted. Switching to High-Quality Mock Generator !!!');
        return generateMockQuestions(language, numQuestions, difficulty);
      }

      if (error.message.includes('SAFETY')) {
        throw new Error('The topic requested was blocked by AI safety filters. Please try another topic.');
      }
      
      // For non-quota/overload errors, don't retry, just throw or failover
      console.warn('!!! FAILOVER: Non-retryable error encountered. Switching to Mock Generator !!!');
      return generateMockQuestions(language, numQuestions, difficulty);
    }
  }

  // Final fallback
  return generateMockQuestions(language, numQuestions, difficulty);
};

module.exports = { generateQuizQuestions };
