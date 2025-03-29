import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with the provided API key
// The key is now directly configured in the .env file as requested by the user
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyBCRFeajPCYmA5VZ5M2cL43ZpH80tHTqZs';

// Check if API key is available and log a debug message about initialization
console.log('Gemini API initializing with key available:', !!apiKey);

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function generateCodeSuggestion(prompt: string, code: string): Promise<string> {
  try {
    if (!apiKey) {
      return 'API key is not configured. Please set VITE_GEMINI_API_KEY in your environment variables.';
    }

    // Extract filename from code context if available
    const filenameMatch = code.match(/Currently open file: (.*?)\n/);
    const filename = filenameMatch ? filenameMatch[1] : "unknown file";
    
    // Check if this is a contextual code question
    const isCodeSpecificQuestion = code.includes("Currently open file:") && code.trim() !== "No file is currently open";
    
    // Create a clean prompt with proper context
    let promptWithContext = '';
    
    if (isCodeSpecificQuestion) {
      promptWithContext = `
You are an expert programmer and coding assistant in VS Code. 
The user is asking about this file: ${filename}

USER QUESTION:
${prompt}

CURRENT FILE CONTENT:
\`\`\`
${code.replace(/Currently open file: .*?\n\n/, '')}
\`\`\`

Provide a detailed, accurate, and helpful response based on the file content. 
If providing code suggestions, ensure they are compatible with the existing code structure and patterns.
Your response should be well-formatted with markdown for code blocks, lists, and emphasis where appropriate.
`;
    } else {
      promptWithContext = `
You are an expert programmer and coding assistant in VS Code.

USER QUESTION:
${prompt}

Provide a detailed, accurate, and helpful response. 
If providing code suggestions, use appropriate code blocks with markdown formatting.
Your response should be well-formatted with markdown for code blocks, lists, and emphasis where appropriate.
`;
    }

    const result = await model.generateContent(promptWithContext);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating code suggestion:', error);
    return 'Sorry, I encountered an error while generating a suggestion. Please check your API key configuration.';
  }
}

export async function analyzeFile(filename: string, content: string, focus?: string): Promise<string> {
  try {
    if (!apiKey) {
      return 'API key is not configured. Please set VITE_GEMINI_API_KEY in your environment variables.';
    }
    
    const focusPrompt = focus ? `\n\nSpecific focus: ${focus}` : '';
    const result = await model.generateContent(`
      Analyze the following file: ${filename}
      
      File content:
      ${content}
      ${focusPrompt}
      
      Please provide a concise summary of what this code does and any potential issues.
    `);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing file:', error);
    return 'Sorry, I encountered an error while analyzing the file.';
  }
}

export async function modifyFileContent(filename: string, content: string, instructions: string): Promise<string> {
  try {
    if (!apiKey) {
      return 'API key is not configured. Please set VITE_GEMINI_API_KEY in your environment variables.';
    }
    
    const result = await model.generateContent(`
      You are an expert code editor. I need you to modify the following file: ${filename}
      Based on these instructions: ${instructions}
      
      Current file content:
      ${content}
      
      Please ONLY return the complete modified code with no explanations or markdown code blocks.
      Your response must be ONLY the new content for the file, nothing else.
    `);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error modifying file:', error);
    return 'Sorry, I encountered an error while modifying the file.';
  }
}

export async function extractStructuredCode(message: string): Promise<{ filename: string | null; code: string | null }> {
  try {
    if (!apiKey) {
      return { filename: null, code: null };
    }
    
    const result = await model.generateContent(`
      Analyze this user message: "${message}"
      
      If it contains instructions to modify a file, extract:
      1. The exact filename to modify (if mentioned)
      2. Only the code portion (if present), without any markdown backticks or explanations
      
      Return ONLY a valid JSON object in this exact format:
      {
        "filename": "the filename mentioned or null if none",
        "code": "the extracted code or null if no code is present"
      }
      
      Do not include any explanation, just return the JSON.
    `);
    
    const response = await result.response;
    const text = response.text().trim();
    
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', text, parseError);
      return { filename: null, code: null };
    }
  } catch (error) {
    console.error('Error extracting structured code:', error);
    return { filename: null, code: null };
  }
}