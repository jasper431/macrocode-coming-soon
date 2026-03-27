// Load the Pyodide environment from a CDN
async function main() {
    const consoleWindow = document.getElementById("console");
    const feedbackText = document.getElementById("feedback-text");
    const runBtn = document.getElementById("run-btn");
    const editor = document.getElementById("editor");

    feedbackText.innerHTML = "<strong>System:</strong> Loading Python...";
    
    // Initialize Pyodide
    let pyodide = await loadPyodide();
    
    feedbackText.innerHTML = "<strong>System:</strong> Python Ready.";

    runBtn.addEventListener("click", async () => {
        const code = editor.innerText;
        consoleWindow.innerText = ">>> Executing...\n";

        try {
            // Redirect Python's stdout (print statements) to a string
            await pyodide.runPythonAsync(`
                import sys
                import io
                sys.stdout = io.StringIO()
            `);

            // Run the user's code
            await pyodide.runPythonAsync(code);

            // Retrieve the captured output
            const output = await pyodide.runPythonAsync("sys.stdout.getvalue()");
            
            consoleWindow.innerText = output || ">>> Code executed (no output).";
            feedbackText.innerHTML = "<strong>System Feedback:</strong> Success.";
        } catch (err) {
            consoleWindow.innerText = `>>> ERROR:\n${err}`;
            feedbackText.innerHTML = "<strong>System Feedback:</strong> Check syntax.";
        }
    });
}

main();
