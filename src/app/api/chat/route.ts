import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';

const { AICommandProcessor } = require('../../lib/aiCommandProcessor.ts');
let commandProcessor = new AICommandProcessor();

// 🔁 Automatically start Ollama with the Deepseek model
exec('ollama run deepseek-coder-v2:16b', (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Error starting Ollama: ${error.message}`);
    return;
  }
  if (stderr) {
    console.warn(`⚠️ Ollama stderr: ${stderr}`);
  }
  console.log(`✅ Ollama started:\n${stdout}`);
});

export async function POST(req: NextRequest) {
  try {
    const { message, action, workingDirectory } = await req.json();
    const model = 'deepseek-coder-v2:16b';

    if (action === 'setWorkingDirectory' && workingDirectory) {
      const success = commandProcessor.setWorkingDirectory(workingDirectory);
      return NextResponse.json({
        success,
        message: success
          ? `✅ Working directory set to: ${workingDirectory}`
          : `❌ Unable to set the directory: ${workingDirectory}`
      });
    }

    if (action === 'getSystemInfo') {
      const info = commandProcessor.getSystemInfo();
      return NextResponse.json({ systemInfo: info });
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    const enhancedPrompt = createEnhancedPrompt(message, commandProcessor.getCurrentPath());

    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: enhancedPrompt,
        stream: false,
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error('Error communicating with Ollama');
    }

    const data = await ollamaResponse.json();
    const aiResponse = data.response;

    let fileOperationResult = '';
    if (commandProcessor.getCurrentPath()) {
      fileOperationResult = commandProcessor.processCommand(message, aiResponse);
    }

    return NextResponse.json({
      response: aiResponse,
      fileOperationResult,
      currentDirectory: commandProcessor.getCurrentPath()
    });

  } catch (error) {
    console.error('❌ Error in the backend:', error);
    return NextResponse.json({ error: 'There was a problem processing the request' }, { status: 500 });
  }
}

function createEnhancedPrompt(userMessage: string, currentPath: string | null): string {
  return `You are AI_ELSAK, an expert programming assistant with full access to the user's file system.

Your base model is ollama-Coder, so your responses should focus on tasks such as writing code, modifying files, structuring projects, and automating scripts. Be direct, technical, and efficient.

${currentPath ? `📁 CURRENT DIRECTORY: ${currentPath}` : '⚠️ DIRECTORY NOT SET. A temporary default directory will be used.'}

FUNCTIONALITIES YOU CAN EXECUTE:
- Create/modify/delete files or folders
- Read or list files and directories
- Move, copy, or rename elements

FORMAT INSTRUCTIONS FOR OPERATIONS:
- **CREATE FILE:**  
  create file name.ext with the content:  
  [content here]

- **MODIFY FILE:**  
  modify file.ext with:  
  [new content]

- **DELETE FILE OR FOLDER:**  
  delete file.ext  
  delete folder_name

- **MOVE/COPY FILES:**  
  move origin.ext to destination.ext  
  copy origin.ext to copy.ext

- **READ FILE OR LIST DIRECTORY:**  
  read file.ext  
  list content of folder_name

RESPOND ALWAYS IN A TECHNICAL AND CONCISE TONE.
DO NOT ask for confirmation: execute what the user requests directly.

USER INSTRUCTION:
${userMessage}`;
}

