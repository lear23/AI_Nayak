import FileSystemManager from "./fileSystemManager";


type Command =
  | { type: 'crear'; params: [string, string, boolean] } // nombre, contenido, esCarpeta
  | { type: 'modificar'; params: [string, string] }
  | { type: 'borrar'; params: [string] }
  | { type: 'mover'; params: [string, string] }
  | { type: 'copiar'; params: [string, string] }
  | { type: 'leer'; params: [string] }
  | { type: 'listar'; params: [string] };

export class AICommandProcessor {
  private fsManager: FileSystemManager;
  private currentPath: string | null = null;

  constructor() {
    this.fsManager = new FileSystemManager();
  }

  setWorkingDirectory(path: string): boolean {
    const success = this.fsManager.setBasePath(path);
    if (success) this.currentPath = path;
    return success;
  }

  getCurrentPath(): string | null {
    return this.currentPath;
  }

  getSystemInfo(): string {
    return this.fsManager.getSystemInfo();
  }

  processCommand(userInput: string, aiResponse: string): string {
    if (!this.currentPath) {
      return '⚠️ Debes establecer un directorio de trabajo antes de ejecutar comandos.';
    }

    try {
      const commands = this.parseAIResponse(aiResponse);
      if (!commands.length) return '🤖 No se detectaron comandos válidos.';

      const results = commands.map(cmd => this.executeCommand(cmd));
      return results.join('\n\n');
    } catch (err) {
      return `❌ Error procesando comandos: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  private parseAIResponse(response: string): Command[] {
    const commands: Command[] = [];

    // Regex simplificados y más precisos
    const patterns = {
      crearArchivo: /crear\s+archivo\s+([^\s]+)\s+con\s+el\s+contenido:?\s*\n?([\s\S]*?)(?=\n\n|$)/gi,
      crearCarpeta: /crear\s+carpeta\s+([^\s\n]+)/gi,
      modificar: /modificar\s+([^\s]+)\s+con:?\s*\n?([\s\S]*?)(?=\n\n|$)/gi,
      borrar: /borrar\s+([^\s\n]+)/gi,
      mover: /mover\s+([^\s]+)\s+a\s+([^\s\n]+)/gi,
      copiar: /copiar\s+([^\s]+)\s+a\s+([^\s\n]+)/gi,
      leer: /leer\s+([^\s\n]+)/gi,
      listar: /listar\s+contenido\s+de\s+([^\s\n]*)/gi,
    };

    let match: RegExpExecArray | null;

    while ((match = patterns.crearArchivo.exec(response))) {
      commands.push({ type: 'crear', params: [match[1].trim(), match[2].trim(), false] });
    }
    while ((match = patterns.crearCarpeta.exec(response))) {
      commands.push({ type: 'crear', params: [match[1].trim(), '', true] });
    }
    while ((match = patterns.modificar.exec(response))) {
      commands.push({ type: 'modificar', params: [match[1].trim(), match[2].trim()] });
    }
    while ((match = patterns.borrar.exec(response))) {
      commands.push({ type: 'borrar', params: [match[1].trim()] });
    }
    while ((match = patterns.mover.exec(response))) {
      commands.push({ type: 'mover', params: [match[1].trim(), match[2].trim()] });
    }
    while ((match = patterns.copiar.exec(response))) {
      commands.push({ type: 'copiar', params: [match[1].trim(), match[2].trim()] });
    }
    while ((match = patterns.leer.exec(response))) {
      commands.push({ type: 'leer', params: [match[1].trim()] });
    }
    while ((match = patterns.listar.exec(response))) {
      commands.push({ type: 'listar', params: [match[1] ? match[1].trim() : '.'] });
    }

    return commands;
  }

  private executeCommand(command: Command): string {
    const { type, params } = command;

    switch (type) {
      case 'crear':
        return this.fsManager.crear(...params);
      case 'modificar':
        return this.fsManager.modificar(...params);
      case 'borrar':
        return this.fsManager.borrar(...params);
      case 'mover':
        return this.fsManager.mover(...params);
      case 'copiar':
        return this.fsManager.copiar(...params);
      case 'leer':
        return this.fsManager.leer(...params);
      case 'listar':
        return this.fsManager.listar(...params);
      default:
        return `❌ Comando desconocido: ${type}`;
    }
  }
}
