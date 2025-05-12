document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    // --- Get all necessary DOM elements ---
    const textModelSelect = document.getElementById('text-model');
    const systemPromptTextarea = document.getElementById('system-prompt');
    const temperatureSlider = document.getElementById('temperature');
    const temperatureValueSpan = document.getElementById('temperature-value');
    const conversationHistoryCheckbox = document.getElementById('conversation-history');

    const backendEndpointInput = document.getElementById('backend-endpoint');
    const corsDomainsInput = document.getElementById('cors-domains');
    const generateBtn = document.getElementById('generate-btn');

    // Output elements
    const pythonOutput = document.getElementById('python-output');
    const javascriptOutput = document.getElementById('javascript-output');
    const envOutput = document.getElementById('env-output');
    const requirementsOutput = document.getElementById('requirements-output');

    // Tab switching elements
    const tabConfigurator = document.getElementById('tab-configurator');
    const tabInstructions = document.getElementById('tab-instructions');
    const configuratorContentDiv = document.getElementById('configurator-content');
    const instructionsPanel = document.getElementById('instructions-panel');

    // New element
    const maxOutputTokensInput = document.getElementById('max-output-tokens');

    // --- Initial UI Setup ---
    if (temperatureSlider && temperatureValueSpan) {
        temperatureSlider.addEventListener('input', (event) => {
            temperatureValueSpan.textContent = event.target.value;
        });
    } else {
        console.error("Temperature slider or value span not found");
    }

    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            const corsDomainsInput = document.getElementById('cors-domains');
            const corsDomains = corsDomainsInput.value.trim();
            
            if (!corsDomains) {
                alert('Please enter at least one domain for CORS configuration (e.g., https://your-university.qualtrics.com). This is required for your API to work with Qualtrics.');
                corsDomainsInput.focus();
                return;
            }
            
            // Check if domains have proper format
            const domainsArray = corsDomains.split(',').map(d => d.trim());
            const invalidDomains = domainsArray.filter(d => !d.startsWith('http://') && !d.startsWith('https://'));
            
            if (invalidDomains.length > 0) {
                alert(`The following domains are missing the required protocol (http:// or https://): ${invalidDomains.join(', ')}\n\nPlease include the full domain with protocol.`);
                corsDomainsInput.focus();
                return;
            }
            
            // Continue with code generation
            const config = gatherConfig();
            generateAndDisplaySnippets(config);
        });
    } else {
        console.error("Generate button not found");
    }

    // Simple tab switching (replace your existing tab code with this)
    const tabs = {
        config: document.getElementById('tab-configurator'),
        instructions: document.getElementById('tab-instructions')
    };
    
    const panels = {
        config: document.getElementById('configurator-content'),
        instructions: document.getElementById('instructions-panel')
    };
    
    if (tabs.config && tabs.instructions && panels.config && panels.instructions) {
        tabs.config.onclick = function() {
            tabs.config.classList.add('active');
            tabs.instructions.classList.remove('active');
            panels.config.style.display = 'flex';
            panels.instructions.style.display = 'none';
        };
        
        tabs.instructions.onclick = function() {
            tabs.instructions.classList.add('active');
            tabs.config.classList.remove('active');
            panels.config.style.display = 'none';
            panels.instructions.style.display = 'block';
        };
    }

    // Help Text Toggle Functionality (using buttons)
    console.log("Setting up help toggles...");
    const helpPairs = [
        ['show-cors-help', 'hide-cors-help', 'cors-help-text'],
        ['show-endpoint-help', 'hide-endpoint-help', 'endpoint-help-text'],
        ['show-temperature-help', 'hide-temperature-help', 'temperature-help-text'],
        ['show-prompt-help', 'hide-prompt-help', 'prompt-help-text'],
        ['show-tokens-help', 'hide-tokens-help', 'tokens-help-text']
    ];

    helpPairs.forEach(function(pair) {
        const showBtnId = pair[0];
        const hideBtnId = pair[1];
        const helpTextId = pair[2];

        const showBtn = document.getElementById(showBtnId);
        const hideBtn = document.getElementById(hideBtnId);
        const helpText = document.getElementById(helpTextId);

        // console.log(`Processing pair: ${showBtnId}, ${hideBtnId}, ${helpTextId}`);

        if (showBtn && hideBtn && helpText) {
            // console.log(`Elements found for ${showBtnId}`);
            showBtn.addEventListener('click', function() {
                // console.log(`${showBtnId} clicked`);
                helpText.style.display = 'block';
                showBtn.style.display = 'none';
            });

            hideBtn.addEventListener('click', function() {
                // console.log(`${hideBtnId} clicked`);
                helpText.style.display = 'none';
                showBtn.style.display = 'inline-block'; // Use 'inline-block' for buttons
            });
        } else {
            console.error(`Help toggle elements not found for one or more IDs in pair: ${showBtnId}, ${hideBtnId}, ${helpTextId}. ShowBtn: ${showBtn}, HideBtn: ${hideBtn}, HelpText: ${helpText}`);
        }
    });

    function gatherConfig() {
        // Ensure the input element exists before trying to read its value
        const maxTokensValue = maxOutputTokensInput ? parseInt(maxOutputTokensInput.value, 10) : 500; // Default to 500 if not found or invalid

        const config = {
            taskType: 'text-generation',
            backendEndpoint: backendEndpointInput ? backendEndpointInput.value.trim() || '/api/generate' : '/api/generate',
            textModel: "gemini-2.0-flash",
            systemPrompt: systemPromptTextarea ? systemPromptTextarea.value.trim() : '',
            temperature: temperatureSlider ? parseFloat(temperatureSlider.value) : 0.7,
            maxOutputTokens: !isNaN(maxTokensValue) && maxTokensValue > 0 ? maxTokensValue : 500, // Validate and use default if needed
            conversationHistory: true,
            modelProvider: "google",
            corsDomains: corsDomainsInput ? corsDomainsInput.value.trim() : '',
        };
        return config;
    }

    function generateAndDisplaySnippets(config) {
        const generatedPython = generatePythonCode(config); // Store in variable
        console.log("--- Generated Python Code (from script.js) ---"); // Log marker
        console.log(generatedPython); // Log the generated code directly
        console.log("--- End Generated Python Code ---");
        if(pythonOutput) pythonOutput.textContent = generatedPython; // Display it
        if(javascriptOutput) javascriptOutput.textContent = generateJavaScriptCode(config);
        if(envOutput) envOutput.textContent = generateEnvFile(config);
        if(requirementsOutput) requirementsOutput.textContent = generateRequirementsFile(config);
    }

    // --- Snippet Generation Functions (Keep them as they were, ensure they are complete) ---

    function generatePythonCode(config) {
        const backendRoute = config.backendEndpoint;
        // Escape backticks and other special chars for JS template literal AND Python f-string
        const escapedSystemPrompt = config.systemPrompt
                                      .replace(/\\/g, '\\\\\\\\') // Escape backslashes first
                                      .replace(/`/g, '\\`')      // Escape backticks for JS
                                      .replace(/'/g, "\\'")      // Escape single quotes for Python
                                      .replace(/"/g, '\\"')      // Escape double quotes for Python
                                      .replace(/\\n/g, '\\\\n');   // Escape newlines for Python string

        // Create an array of normalized domains without trailing slashes
        const corsDomains = [];
        config.corsDomains.split(',')
            .map(domain => domain.trim())
            .filter(domain => domain.length > 0 && (domain.startsWith('http://') || domain.startsWith('https://')))
            .forEach(domain => {
                if (domain.endsWith('/')) {
                    corsDomains.push(domain.slice(0, -1));
                } else {
                    corsDomains.push(domain);
                }
            });

        // Format domains as Python list string for CORS
        const pythonListDomains = JSON.stringify(corsDomains);

        // CORS setup string
        let corsSetup;
        if (corsDomains.length > 0) {
            corsSetup = `
# CORS configuration for specific domains
CORS(app, resources={r"${backendRoute}": {
    "origins": ${pythonListDomains},
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
    "supports_credentials": True
}})`;
        } else {
            corsSetup = `
# WARNING: CORS is set to allow all origins - this is NOT recommended for production
CORS(app) # Allows all origins by default
print("⚠️ WARNING: CORS is configured to allow all origins. Update origins for production!")`;
        }

        const primaryOrigin = corsDomains.length > 0 ? corsDomains[0] : '*'; // For OPTIONS header

        // Use JS Template Literal + Python f-string for the main code
        // Escape `${...}` within the Python f-string using `\\${...}` for JS
        return `import os
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from dotenv import load_dotenv
# Use the new recommended library import style
from google import genai
from google.genai import types
import traceback # For detailed error logging

# --- Environment Setup ---
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, '.env')
print(f"Looking for .env at: {env_path}")
load_dotenv(dotenv_path=env_path, verbose=True) # Load .env file explicitly

gemini_api_key = os.getenv('GEMINI_API_KEY')
if not gemini_api_key:
    print("ERROR: GEMINI_API_KEY not found in environment variables or .env file.")
    # Optionally raise an error or exit if the key is essential at startup
else:
    print(f"Gemini API Key loaded successfully (first 5 chars: {gemini_api_key[:5]}...).")

# --- Flask App Initialization ---
app = Flask(__name__)
${corsSetup} # Insert CORS setup string

# --- Gemini Client Initialization (Using google-genai style) ---
client = None
try:
    if not gemini_api_key:
        raise EnvironmentError("GEMINI_API_KEY is not set. Cannot initialize client.")
    # Use genai.Client as per the new library
    client = genai.Client(api_key=gemini_api_key)
    print("Gemini client initialized successfully (using google-genai client).")
except Exception as e:
    print(f"FATAL: Gemini Configuration Error - {e}")
    print("Please ensure your GEMINI_API_KEY is correct and you have the necessary permissions.")
    # client remains None

# --- API Endpoints ---

# Optional explicit handler for preflight requests (adjust origin as needed)
@app.route('${backendRoute}', methods=['OPTIONS'])
def options_handler():
    response = jsonify({})
    # Use the primary domain from config or '*'
    response.headers.add('Access-Control-Allow-Origin', '${primaryOrigin}')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

@app.route('${backendRoute}', methods=['POST'])
def generate_endpoint():
    if client is None:
        return jsonify({"error": "Gemini client not initialized due to configuration error."}), 503 # Service Unavailable

    # Ensure request is JSON
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 415

    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is empty or not valid JSON"}), 400

    user_prompt = data.get('prompt')
    conversation_history = data.get('history', []) # Expects a list of {'role': ..., 'parts': [{'text': ...}]}

    if not user_prompt:
        return jsonify({"error": "Required field 'prompt' is missing"}), 400

    # Validate conversation history format (basic check)
    if not isinstance(conversation_history, list):
         print(f"Warning: Received history is not a list: {type(conversation_history)}. Ignoring history.")
         conversation_history = []
         # Or: return jsonify({"error": "Field 'history' must be a list"}), 400

    # --- Prepare API Call ---
    try:
        # Combine history and current prompt
        # Ensure history format matches API expectations [{role: 'user'/'model', parts: [{text: ...}]}]
        contents_for_api = []
        for entry in conversation_history:
             # Add validation for history entry structure
             if isinstance(entry, dict) and 'role' in entry and 'parts' in entry and isinstance(entry['parts'], list):
                  # Ensure parts are correctly formatted
                  valid_parts = []
                  for part in entry['parts']:
                      if isinstance(part, dict) and 'text' in part:
                          valid_parts.append(part)
                      else:
                           print(f"Warning: Skipping invalid part in history entry: {part}")
                  if valid_parts:
                      entry['parts'] = valid_parts # Use only valid parts
                      contents_for_api.append(entry)
                  else:
                       print(f"Warning: Skipping history entry with no valid parts: {entry}")
             else:
                  print(f"Warning: Skipping invalid history entry format: {entry}")

        contents_for_api.append({"role": "user", "parts": [{"text": user_prompt}]})

        # --- Prepare Generation Config --- 
        # Directly use interpolated values from JS config object
        gen_config_params = {
            "temperature": ${config.temperature},
            "max_output_tokens": ${config.maxOutputTokens}
            # Add other params like top_p, top_k from config if needed
        }
        system_instruction_text = '''${escapedSystemPrompt}''' # Get escaped text
        if system_instruction_text:
             # Add system instruction to the dictionary *if* the JS variable had text
             gen_config_params["system_instruction"] = system_instruction_text
             print("Adding system_instruction to GenerationConfig params.")
             
        # Create the config object directly using the dictionary
        generation_config = types.GenerateContentConfig(**gen_config_params)

        # --- Model Selection --- 
        # Directly use interpolated value from JS config object
        model_name_from_config = "${config.textModel}"
        
        print(f"Using model: {model_name_from_config}")
        print(f"Calling Gemini with config: {{generation_config}}") # Use {{}} for Python f-string literal brace
        # print(f"Contents being sent: {{contents_for_api}}") # DEBUG

        # --- Call Gemini API (Non-Streaming using client.models) ---
        response = client.models.generate_content(
            model=model_name_from_config, # Pass model name here
            contents=contents_for_api,
            config=generation_config # Use 'config' keyword argument
        )

        # --- Process Response ---
        generated_text = ""
        # Standard response handling for generate_content
        try:
            generated_text = response.text
        except Exception as e:
            print(f"Could not directly access response.text: {e}")
            # Fallback or detailed error checking based on response structure
            try:
                if response.parts:
                    generated_text = "\\n".join(part.text for part in response.parts if hasattr(part, 'text'))
                elif response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
                    generated_text = "\\n".join(part.text for part in response.candidates[0].content.parts if hasattr(part, 'text'))
                else:
                     generated_text = "[No text found in response]"

                # Check finish reason and safety ratings if text extraction failed or is suspect
                if response.candidates:
                     finish_reason = response.candidates[0].finish_reason
                     print(f"Finish Reason: {finish_reason}")
                     if finish_reason != 'STOP':
                          generated_text += f"\\n[Generation stopped: {finish_reason}]"

                     safety_ratings = response.candidates[0].safety_ratings
                     print(f"Safety Ratings: {safety_ratings}")
                     for rating in safety_ratings:
                          if rating.probability != 'NEGLIGIBLE':
                               generated_text += f"\\n[Safety Issue: {rating.category} - {rating.probability}]"
                if hasattr(response, 'prompt_feedback'):
                     print(f"Prompt Feedback: {response.prompt_feedback}")

            except Exception as fallback_e:
                 print(f"Error during fallback response processing: {fallback_e}")
                 generated_text = "[Error processing response details]"


        return jsonify({"generated_text": generated_text})

    except Exception as e:
        print(f"Error during content generation: {e}")
        print(traceback.format_exc()) # Print full traceback for debugging
        error_message = f"Failed to generate content: {str(e)}"
        status_code = 500
        # Use types.BlockedPromptException etc. if available
        try:
            if isinstance(e, types.BlockedPromptException):
                 error_message = "Prompt blocked due to safety settings."
                 status_code = 400
            elif isinstance(e, types.StopCandidateException):
                  error_message = "Generation stopped unexpectedly."
                  status_code = 500
            # Add checks for other specific exceptions from google.genai if needed
        except AttributeError:
            print("Note: Specific google.genai exception types not found, using generic handling.")

        if "API key not valid" in str(e) or "PermissionDenied" in str(e):
              error_message = "Authentication error: Invalid or missing API Key / Permissions issue."
              status_code = 401

        return jsonify({"error": error_message}), status_code


@app.route('/cors-test', methods=['GET', 'OPTIONS'])
def cors_test():
    """Test endpoint to verify CORS."""
    return jsonify({
        "cors_status": "success",
        "message": "If you see this, CORS might be configured correctly FROM THE BACKEND.",
        "configured_origins_for_api": ${pythonListDomains} if ${pythonListDomains} else ["* (Default/Not Specified)"],
        "request_origin": request.headers.get('Origin', 'Not provided')
    })

# --- Run Flask App ---
if __name__ == "__main__":
    # Default port is 5001, can be overridden by environment variable PORT
    port = int(os.environ.get('PORT', 5001))
    # Use debug=False for production environments
    # Use host='0.0.0.0' to be accessible externally (e.g., in containers)
    app.run(host='0.0.0.0', port=port, debug=True) # Set debug=False for production
`;
    }

    function generateJavaScriptCode(config) {
        var backendRoute = config.backendEndpoint;

        // --- Non-Streaming Fetch Code (Using Template Literal) ---
        const nonStreamingCode = `
        fetch(backendUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: userInput, history: getHistoryForAPI() })
        })
        .then(response => { // Use arrow function for brevity
            return response.json().then(data => { // Expect JSON
                if (!response.ok) {
                    // Throw an error with the message from JSON if available
                    throw new Error(data.error || \`Server error: \${response.status}\`);
                }
                return data; // Pass the parsed JSON data
            });
        })
        .then(data => { // Use arrow function for brevity
            const generatedText = data.generated_text || "";

            // Display the full response
            responseArea.innerHTML = ""; // Clear previous response/status
            const textLines = generatedText.split("\\n");
            textLines.forEach(line => { // Use forEach for cleaner iteration
                 const p = document.createElement("p");
                 p.textContent = line || "\\u00A0"; // Preserve empty lines
                 p.style.margin = "0 0 0.5em 0";
                 responseArea.appendChild(p);
            });
            responseArea.style.color = "#333"; // Reset color

            // Update conversation history
            conversationHistory.push(
                 {"role": "user", "parts": [{"text": userInput}]},
                 {"role": "model", "parts": [{"text": generatedText}]}
             );
            updateEmbeddedData();
        })
        .catch(error => { // Use arrow function for brevity
            console.error("GenAI Interaction Fetch Error:", error);
            // Use backticks for the error message string as well, escape inner html if needed
            responseArea.innerHTML = \`<strong style='color:red;'>Error:</strong> \${error.message}\`;
            responseArea.style.color = "red";
            // Optionally update history with error, or clear last user input if needed
        })
        .finally(() => { // Use arrow function for brevity
            submitGenAIButton.disabled = false;
            submitGenAIButton.innerText = "Generate Response";
        });
        `; // End of template literal for nonStreamingCode


        // The complete script, using template literal for the whole thing
        return `// Qualtrics JavaScript for Google Gemini 2.0 Interaction (Non-Streaming)
Qualtrics.SurveyEngine.addOnload(function() {
    const questionContainer = this.questionContainer; // Use const
    const questionId = this.questionId; // Use const

    // --- UI Elements ---
    const mainDiv = document.createElement('div'); // Use const
    mainDiv.id = \`genai-interaction-\${questionId}\`; // Use template literal
    mainDiv.style.cssText = 'padding:15px; border:1px solid #eee; border-radius:5px; background-color:#fdfdfd;';

    const promptLabel = document.createElement('label'); // Use const
    promptLabel.htmlFor = \`userInput-\${questionId}\`; // Use template literal
    promptLabel.innerText = 'Your Prompt:';
    promptLabel.style.cssText = 'display:block; margin-bottom:5px; font-weight:bold;';

    const userInputArea = document.createElement('textarea'); // Use const
    userInputArea.id = \`userInput-\${questionId}\`; // Use template literal
    userInputArea.rows = 4;
    userInputArea.style.cssText = 'width:calc(100% - 22px); padding:10px; margin-bottom:10px; border:1px solid #ccc; border-radius:4px; font-size:1em; box-sizing: border-box;';
    userInputArea.setAttribute('placeholder', 'Enter your prompt here...');

    const submitGenAIButton = document.createElement('button'); // Use const
    submitGenAIButton.id = \`submitGenAI-\${questionId}\`; // Use template literal
    submitGenAIButton.type = 'button';
    submitGenAIButton.innerText = 'Generate Response';
    submitGenAIButton.className = 'NextButton Button'; // Ensure this class exists in Qualtrics themes

    const responseAreaLabel = document.createElement('label'); // Use const
    responseAreaLabel.style.cssText = 'display:block; margin-top:20px; margin-bottom:5px; font-weight:bold;';
    responseAreaLabel.innerText = 'AI Response:';

    const responseArea = document.createElement('div'); // Use const
    responseArea.id = \`aiResponseArea-\${questionId}\`; // Use template literal
    responseArea.style.cssText = 'margin-top:5px; padding:15px; border:1px dashed #ccc; min-height:60px; background-color:#f9f9f9; border-radius:4px; line-height:1.5; word-wrap: break-word; white-space: pre-wrap;'; // Added white-space: pre-wrap
    responseArea.innerHTML = '<i>AI response will appear here...</i>';

    mainDiv.appendChild(promptLabel);
    mainDiv.appendChild(userInputArea);
    mainDiv.appendChild(submitGenAIButton);
    mainDiv.appendChild(responseAreaLabel);
    mainDiv.appendChild(responseArea);
    questionContainer.appendChild(mainDiv);

    // --- Conversation History Management (Always Enabled) ---
    let conversationHistory = []; // Use let as it's reassigned potentially by loading saved state (though not implemented here)

    function updateEmbeddedData() {
        Qualtrics.SurveyEngine.setEmbeddedData('genAI_fullHistory', JSON.stringify(conversationHistory));
        if (conversationHistory.length > 0) {
            let lastResponse = ''; // Use let
            // Find last model response more efficiently
            const lastModelMessage = conversationHistory.slice().reverse().find(entry => entry.role === 'model');
            if (lastModelMessage && lastModelMessage.parts && lastModelMessage.parts.length > 0) {
                lastResponse = lastModelMessage.parts[0].text;
            }
            Qualtrics.SurveyEngine.setEmbeddedData('genAI_lastResponse', lastResponse);
        } else {
             Qualtrics.SurveyEngine.setEmbeddedData('genAI_lastResponse', ''); // Clear if history is empty
        }
    }

    function getHistoryForAPI() {
        // Return a deep copy to avoid modifications affecting the original
        // Consider limiting history length if it grows too large
        return JSON.parse(JSON.stringify(conversationHistory));
    }

    // --- Button Click Handler ---
    submitGenAIButton.onclick = function() { // Keep as function or use arrow () => { ... }
        const userInput = userInputArea.value.trim(); // Use const
        if (!userInput) {
            alert('Please enter a prompt.');
            return;
        }

        submitGenAIButton.disabled = true;
        submitGenAIButton.innerText = 'Processing...';
        responseArea.innerHTML = '<i>Contacting AI service... please wait.</i>';
        responseArea.style.color = '#555';

        // IMPORTANT: Replace with your deployed backend URL
        const backendBaseUrl = 'YOUR_BACKEND_URL_HERE'; // Use const
        const backendUrl = backendBaseUrl + '${backendRoute}'; // Use const and template literal part

        // --- Fetch Call (using the nonStreamingCode variable) ---
        ${nonStreamingCode}
    };

    // Initial update in case there's pre-existing data (though unlikely here)
    updateEmbeddedData();
});
`; // End of template literal for the return statement
    }

    function generateEnvFile(config) {
        return `# Environment variables for your Google Gemini 2.0 application
# IMPORTANT: Add this .env file to your .gitignore to prevent committing secrets!

FLASK_APP=app.py
FLASK_DEBUG=True # Set to False for production

# Many cloud platforms set their own PORT - locally you can specify a custom port
# PORT=5000  # Uncomment this line to set a custom port for local development

# For Google Gemini 2.0, install with: pip install google-genai
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
`.trim();
    }

    function generateRequirementsFile(config) {
        return `flask
flask-cors
python-dotenv
google-genai
gunicorn`.trim();
    }

    // --- Copy Button Functionality ---
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const codeElement = document.getElementById(targetId);
            if (!codeElement) {
                console.error("Copy target not found:", targetId);
                return;
            }

            const textToCopy = codeElement.textContent;
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                button.disabled = true;
                setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy to clipboard: ', err);
                alert('Failed to copy. Please select and copy manually.');
            });
        });
    });

}); // End of DOMContentLoaded