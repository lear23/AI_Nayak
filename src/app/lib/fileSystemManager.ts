import fs from 'fs';
import path from 'path';

type FileSystemItemType = 'file' | 'directory';

class FileSystemManager {
  private basePath: string | null;

  constructor(basePath: string | null = null) {
    this.basePath = basePath;
  }

  setBasePath(newPath: string): boolean {
    if (fs.existsSync(newPath)) {
      this.basePath = newPath;
      return true;
    }
    return false;
  }

  private getFullPath(relativePath: string): string {
    if (!this.basePath) {
      throw new Error('Directorio base no establecido');
    }
    return path.resolve(this.basePath, relativePath);
  }

  crear(nombrePath: string, contenido: string = '', esCarpeta: boolean = false): string {
    const fullPath = this.getFullPath(nombrePath);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (esCarpeta) {
      fs.mkdirSync(fullPath, { recursive: true });
      return `Carpeta creada: ${fullPath}`;
    } else {
      fs.writeFileSync(fullPath, contenido, 'utf-8');
      return `Archivo creado: ${fullPath}`;
    }
  }

  modificar(nombrePath: string, nuevoContenido: string): string {
    const fullPath = this.getFullPath(nombrePath);
    fs.writeFileSync(fullPath, nuevoContenido, 'utf-8');
    return `Archivo modificado: ${fullPath}`;
  }

  borrar(nombrePath: string): string {
    const fullPath = this.getFullPath(nombrePath);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      return `Carpeta eliminada: ${fullPath}`;
    } else {
      fs.unlinkSync(fullPath);
      return `Archivo eliminado: ${fullPath}`;
    }
  }

  mover(origen: string, destino: string): string {
    const fullOrigen = this.getFullPath(origen);
    const fullDestino = this.getFullPath(destino);
    const destinoDir = path.dirname(fullDestino);

    if (!fs.existsSync(destinoDir)) {
      fs.mkdirSync(destinoDir, { recursive: true });
    }

    fs.renameSync(fullOrigen, fullDestino);
    return `Movido de ${fullOrigen} a ${fullDestino}`;
  }

  copiar(origen: string, destino: string): string {
    const fullOrigen = this.getFullPath(origen);
    const fullDestino = this.getFullPath(destino);
    const destinoDir = path.dirname(fullDestino);

    if (!fs.existsSync(destinoDir)) {
      fs.mkdirSync(destinoDir, { recursive: true });
    }

    const stats = fs.statSync(fullOrigen);
    if (stats.isDirectory()) {
      this.copiarCarpeta(fullOrigen, fullDestino);
      return `Carpeta copiada: ${fullDestino}`;
    } else {
      fs.copyFileSync(fullOrigen, fullDestino);
      return `Archivo copiado: ${fullDestino}`;
    }
  }

  private copiarCarpeta(origen: string, destino: string): void {
    fs.mkdirSync(destino, { recursive: true });
    fs.readdirSync(origen).forEach(item => {
      const src = path.join(origen, item);
      const dst = path.join(destino, item);
      const stats = fs.statSync(src);
      if (stats.isDirectory()) {
        this.copiarCarpeta(src, dst);
      } else {
        fs.copyFileSync(src, dst);
      }
    });
  }

  leer(nombrePath: string): string {
    const fullPath = this.getFullPath(nombrePath);
    return fs.readFileSync(fullPath, 'utf-8');
  }

  listar(carpetaPath: string = '.'): string {
    const fullPath = this.getFullPath(carpetaPath);
    const items = fs.readdirSync(fullPath);

    return items
      .map(item => {
        const itemPath = path.join(fullPath, item);
        const stats = fs.statSync(itemPath);
        const tipo: FileSystemItemType = stats.isDirectory() ? 'directory' : 'file';
        return `${tipo}: ${item}`;
      })
      .join('\n');
  }

  getSystemInfo(): string {
    if (!this.basePath) return 'No hay carpeta base establecida';
    const stats = fs.statSync(this.basePath);
    return `Base: ${this.basePath}\nÚltima modificación: ${stats.mtime}`;
  }
}

export default FileSystemManager;