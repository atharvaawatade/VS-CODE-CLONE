import { create } from 'zustand';

export interface Tab {
  id: string;
  filename: string;
  content: string;
  language: string;
}

interface EditorStore {
  tabs: Tab[];
  activeTab: string | null;
  addTab: (tab: Tab) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabContent: (id: string, content: string) => void;
}

const getLanguageFromFilename = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
      return 'javascript';
    case 'css':
      return 'css';
    case 'html':
      return 'html';
    case 'json':
      return 'json';
    case 'py':
      return 'python';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'jsx':
      return 'javascript';
    case 'md':
      return 'markdown';
    default:
      return 'plaintext';
  }
};

export const getMockContent = (filename: string): string => {
  switch (filename) {
    case 'main.js':
      return `// main.js - Enhanced and Well-Structured

(function() { // Wrap in an Immediately Invoked Function Expression (IIFE) for scope

  // 1. Strict Mode: Enforces cleaner code and prevents some common errors.
  "use strict";

  // 2. DOM Content Loaded Event: Ensures code runs after the DOM is ready.
  document.addEventListener("DOMContentLoaded", function() {

    console.log("DOM fully loaded and parsed");

    // Counter functionality
    const decrementBtn = document.getElementById('decrementBtn');
    const incrementBtn = document.getElementById('incrementBtn');
    const counterValue = document.getElementById('counterValue');
    
    let count = 0;
    
    if (incrementBtn && decrementBtn && counterValue) {
      incrementBtn.addEventListener('click', function() {
        count++;
        counterValue.textContent = count;
      });
      
      decrementBtn.addEventListener('click', function() {
        count--;
        counterValue.textContent = count;
      });
    }
    
    // Form handling
    const demoForm = document.getElementById('demoForm');
    const formResponse = document.getElementById('formResponse');
    
    if (demoForm && formResponse) {
      demoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        if (!name || !email || !message) {
          formResponse.textContent = 'Please fill out all fields.';
          formResponse.className = 'error';
        } else {
          formResponse.textContent = \`Thank you, \${name}! Your message has been received.\`;
          formResponse.className = 'success';
          demoForm.reset();
        }
        
        formResponse.classList.remove('hidden');
      });
    }

  }); // End DOMContentLoaded listener

})(); // End IIFE`;
    case 'styles.css':
      return `/* Main styles - Modern and Responsive */

/* Base styles */
:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --accent-color: #e74c3c;
  --text-color: #333;
  --light-text: #f5f5f5;
  --background: #f8f9fa;
  --card-bg: #fff;
  --border-color: #ddd;
  --success: #2ecc71;
  --error: #e74c3c;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  background-color: var(--background);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-template-areas:
    "header header"
    "nav nav"
    "main aside"
    "footer footer";
  gap: 20px;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  margin-bottom: 0.5em;
  font-weight: 600;
  line-height: 1.3;
}

h1 {
  font-size: 2.5rem;
  color: var(--primary-color);
}

h2 {
  font-size: 2rem;
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 0.3em;
  margin-bottom: 1em;
}

h3 {
  font-size: 1.5rem;
  color: var(--primary-color);
}

p {
  margin-bottom: 1em;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 1.5em;
}

/* Header */
header {
  grid-area: header;
  text-align: center;
  padding: 2rem 0;
}

/* Navigation */
nav {
  grid-area: nav;
  background-color: var(--primary-color);
  border-radius: 8px;
  padding: 0.5rem;
  margin-bottom: 1rem;
}

nav ul {
  display: flex;
  justify-content: center;
  list-style: none;
}

nav li {
  margin: 0 10px;
}

nav a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

nav a:hover, nav a.active {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Main content */
main {
  grid-area: main;
}

section {
  margin-bottom: 2rem;
}

/* Cards */
.card {
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

/* Counter */
.counter-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
  gap: 1rem;
}

.counter-container button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.counter-container button:hover {
  background-color: #2980b9;
}

#counterValue {
  font-size: 2rem;
  min-width: 60px;
  text-align: center;
}

/* Form */
.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #2980b9;
}

#formResponse {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 4px;
}

#formResponse.success {
  background-color: rgba(46, 204, 113, 0.2);
  border: 1px solid var(--success);
  color: var(--success);
}

#formResponse.error {
  background-color: rgba(231, 76, 60, 0.2);
  border: 1px solid var(--error);
  color: var(--error);
}

.hidden {
  display: none;
}

/* Aside */
aside {
  grid-area: aside;
}

#updates {
  list-style-position: inside;
  padding-left: 1rem;
}

#updates li {
  margin-bottom: 0.5rem;
  position: relative;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-around;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--primary-color);
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

/* Footer */
footer {
  grid-area: footer;
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.social-links a {
  margin-left: 1rem;
  color: var(--primary-color);
  text-decoration: none;
}

.social-links a:hover {
  text-decoration: underline;
}

/* Responsive styles */
@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "nav"
      "main"
      "aside"
      "footer";
  }
  
  nav ul {
    flex-direction: column;
    align-items: center;
  }
  
  nav li {
    margin: 5px 0;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 2rem;
  }
  
  h2 {
    font-size: 1.5rem;
  }
  
  .card {
    padding: 1rem;
  }
}`;
    case 'index.html':
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interactive Demo Page</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <header>
      <h1>Welcome to My Interactive Page</h1>
      <p class="subtitle">This is a demo of HTML, CSS and JavaScript integration</p>
    </header>

    <nav>
      <ul>
        <li><a href="#home" class="active">Home</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#services">Services</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>

    <main>
      <section id="home">
        <h2>Interactive Elements</h2>
        
        <div class="card">
          <h3>Counter Demo</h3>
          <p>Click the buttons to increase or decrease the counter:</p>
          <div class="counter-container">
            <button id="decrementBtn">-</button>
            <span id="counterValue">0</span>
            <button id="incrementBtn">+</button>
          </div>
        </div>
        
        <div class="card">
          <h3>Form Demo</h3>
          <form id="demoForm">
            <div class="form-group">
              <label for="name">Name:</label>
              <input type="text" id="name" placeholder="Enter your name">
            </div>
            <div class="form-group">
              <label for="email">Email:</label>
              <input type="email" id="email" placeholder="Enter your email">
            </div>
            <div class="form-group">
              <label for="message">Message:</label>
              <textarea id="message" placeholder="Type your message"></textarea>
            </div>
            <button type="submit" id="submitBtn">Submit</button>
          </form>
          <div id="formResponse" class="hidden"></div>
        </div>
      </section>
    </main>

    <aside>
      <div class="card">
        <h3>Recent Updates</h3>
        <ul id="updates">
          <li>Feature X launched</li>
          <li>New design implemented</li>
          <li>Mobile support added</li>
        </ul>
      </div>
      
      <div class="card">
        <h3>Quick Stats</h3>
        <div class="stats">
          <div class="stat">
            <span class="stat-value">250+</span>
            <span class="stat-label">Users</span>
          </div>
          <div class="stat">
            <span class="stat-value">15k</span>
            <span class="stat-label">Downloads</span>
          </div>
          <div class="stat">
            <span class="stat-value">95%</span>
            <span class="stat-label">Satisfaction</span>
          </div>
        </div>
      </div>
    </aside>

    <footer>
      <p>&copy; 2023 Interactive Demo. All rights reserved.</p>
      <div class="social-links">
        <a href="#" title="Twitter">Twitter</a>
        <a href="#" title="GitHub">GitHub</a>
        <a href="#" title="LinkedIn">LinkedIn</a>
      </div>
    </footer>
  </div>

  <script src="main.js"></script>
</body>
</html>`;
    case 'config.json':
      return `{
  "name": "my-app",
  "version": "1.0.0",
  "description": "A simple web application",
  "author": "Web IDE User",
  "settings": {
    "theme": "dark",
    "fontSize": 14,
    "autoSave": true,
    "tabSize": 2
  },
  "dependencies": {
    "lodash": "^4.17.21",
    "axios": "^1.3.4"
  }
}`;
    case 'users.json':
      return `[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "user"
  },
  {
    "id": 3,
    "name": "Bob Johnson",
    "email": "bob@example.com",
    "role": "user"
  }
]`;
    default:
      return `// ${filename}\n`;
  }
};

export const useEditorStore = create<EditorStore>((set) => ({
  tabs: [],
  activeTab: null,
  addTab: (tab) => set((state) => ({
    tabs: [...state.tabs, tab],
    activeTab: tab.id,
  })),
  closeTab: (id) => set((state) => {
    const newTabs = state.tabs.filter((tab) => tab.id !== id);
    return {
      tabs: newTabs,
      activeTab: state.activeTab === id
        ? newTabs.length > 0
          ? newTabs[newTabs.length - 1].id
          : null
        : state.activeTab,
    };
  }),
  setActiveTab: (id) => set({ activeTab: id }),
  updateTabContent: (id, content) => set((state) => ({
    tabs: state.tabs.map((tab) =>
      tab.id === id ? { ...tab, content } : tab
    ),
  })),
}));

export { getLanguageFromFilename };