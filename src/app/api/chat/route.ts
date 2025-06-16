import { NextRequest } from 'next/server';
import { exec } from 'child_process';

const { AICommandProcessor } = require('../../lib/aiCommandProcessor.ts');
let commandProcessor = new AICommandProcessor();

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
  const { message, action, workingDirectory } = await req.json();
  const model = 'llama3.2:3b';

  if (action === 'setWorkingDirectory' && workingDirectory) {
    const success = commandProcessor.setWorkingDirectory(workingDirectory);
    return new Response(
      JSON.stringify({
        success,
        message: success
          ? `✅ Working directory set to: ${workingDirectory}`
          : `❌ Unable to set the directory: ${workingDirectory}`
      }),
      { status: 200 }
    );
  }

  if (action === 'getSystemInfo') {
    const info = commandProcessor.getSystemInfo();
    return new Response(JSON.stringify({ systemInfo: info }), { status: 200 });
  }

  if (!message || typeof message !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid message' }), { status: 400 });
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

  if (!ollamaResponse.ok || !ollamaResponse.body) {
    return new Response(JSON.stringify({ error: 'Error communicating with Ollama' }), { status: 500 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const decoder = new TextDecoder();
      if (!ollamaResponse.body) {
        controller.error('Ollama response body is null.');
        return;
      }
      const reader = ollamaResponse.body.getReader();

      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        fullResponse += chunk;

        // Send token to client
        controller.enqueue(new TextEncoder().encode(chunk));
      }

      controller.close();

      // Optional: You can post-process here
      if (commandProcessor.getCurrentPath()) {
        commandProcessor.processCommand(message, fullResponse);
      }
    }
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

function createEnhancedPrompt(userMessage: string, currentPath: string | null): string {
  return `You are AI_ELSAK, a highly intelligent and helpful assistant similar to ChatGPT. Your knowledge spans programming, science, writing, education, and general problem-solving. You behave like an expert mentor or teacher, and you're capable of assisting users with both technical and non-technical tasks.

🧠 ROLE: Multi-domain Assistant and Guide  
🌐 LANGUAGE: English  
📂 CURRENT DIRECTORY: ${currentPath ? currentPath : '⚠️ DIRECTORY NOT SET. Using a temporary default directory.'}

FEATURES:
- Programming Support: Code creation, explanation, optimization, and debugging.
- File System Assistance: Read, create, modify, delete, or move files and folders.
- Education: Explain complex topics clearly, help with learning plans, answer advanced questions.
- Automation: Design or optimize scripts and workflows.

🧾 FORMAT EXAMPLES:
- Create File:
  \`\`\`
  create file <filename.ext> with content:
  [file content]
  \`\`\`

- Modify File:
  \`\`\`
  modify file <filename.ext> with:
  [updated content]
  \`\`\`

- System Info:
  \`\`\`
  get system info
  \`\`\`

User Message:
${userMessage}`;
}
