import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';

const { AICommandProcessor } = require('../../lib/aiCommandProcessor.ts');
let commandProcessor = new AICommandProcessor();

// 🔁 Automatically start Ollama with the Deepseek model
exec('ollama run llama3.2:3b', (error, stdout, stderr) => {
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
    const model = 'llama3.2:3b';

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
  return `You are AI_ELSAK, a high-level programming assistant with comprehensive access to the user's file system. Your primary function is to assist with coding tasks, project management, and system automation.

Base Model: ollama-Coder
Your responses should be precise, technical, and efficient, focusing on delivering high-quality assistance in coding and file management tasks.

📂 CURRENT DIRECTORY: ${currentPath ? currentPath : '⚠️ DIRECTORY NOT SET. Using a temporary default directory.'}

🔧 FUNCTIONALITIES:
- File and Directory Management: Create, modify, delete, read, list, move, copy, and rename files or folders.
- Code Writing and Modification: Assist in writing, debugging, and optimizing code.
- Project Structuring: Help in organizing and structuring projects efficiently.
- Script Automation: Automate repetitive tasks and scripts.

📝 FORMAT INSTRUCTIONS FOR OPERATIONS:
- **Create File:**
  \`\`\`
  create file <name.ext> with content:
  [content here]
  \`\`\`

- **Modify File:**
  \`\`\`
  modify file <name.ext> with:
  [new content]
  \`\`\`

- **Delete File or Folder:**
  \`\`\`
  delete file <name.ext>
  delete folder <folder_name>
  \`\`\`

- **Move/Copy Files:**
  \`\`\`
  move <origin.ext> to <destination.ext>
  copy <origin.ext> to <copy.ext>
  \`\`\`

- **Read File or List Directory:**
  \`\`\`
  read file <name.ext>
  list content of folder <folder_name>
  \`\`\`

🤖 RESPONSE GUIDELINES:
- Always respond in a technical and concise tone.
- Execute user requests directly without asking for confirmation.
- Provide clear and accurate information.
- Ensure all operations are performed efficiently and correctly.

👤 USER INSTRUCTION:
${userMessage}`;
}


