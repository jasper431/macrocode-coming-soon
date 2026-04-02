// 1. GLOBAL CONFIGURATION
const JSONBIN_CONFIG = {
    apiKey: '$2a$10$MvxMhqL6xp.y1XdutK0AKevd6FYKvJVryZQO0NApRbulAECDgitdm', 
    binId: '69ce80c0856a682189f2d203',                
};

let currentUnitData = null; // Stores the active JSON unit

// 2. THE LOADER (Fetches the Unit)
async function loadUnit() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_CONFIG.binId}/latest`, {
            headers: { 'X-Master-Key': JSONBIN_CONFIG.apiKey }
        });
        const data = await response.json();
        
        // Access the specific unit you want to load
        currentUnitData = data.record["basic i/o"]; 
        renderUI();
    } catch (err) {
        document.getElementById('feedback-text').innerText = "Error loading unit.";
    }
}

// 3. THE RENDERER (Puts JSON into HTML)
function renderUI() {
    if (!currentUnitData) return;
    
    document.querySelector('h1').innerText = currentUnitData.title;
    document.querySelector('.header-content p').innerText = currentUnitData.goal;
    
    // Load Scaffolding into the Editor
    const editor = document.getElementById('editor');
    editor.innerText = currentUnitData.scaff.join('\n');
}

// 4. THE RUNNER (Pyodide Logic)
async function runPython() {
    const code = document.getElementById('editor').innerText;
    const consoleElement = document.getElementById('console');
    consoleElement.innerText = "Running...";

    try {
        let pyodide = await loadPyodide();
        // Redirect Python print() to your console div
        pyodide.runPython(`
            import sys
            import io
            sys.stdout = io.String()
        `);
        await pyodide.runPythonAsync(code);
        const output = pyodide.runPython("sys.stdout.getvalue()");
        consoleElement.innerText = output || ">>> Execution complete (no output).";
        
        // TRIGGER AI FEEDBACK HERE (Next Step)
        generateAIFeedback(code); 
    } catch (err) {
        consoleElement.innerText = `Python Error: ${err}`;
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', loadUnit);
document.getElementById('run-btn').addEventListener('click', runPython);
