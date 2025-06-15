import fs from 'fs';
import path from 'path';

type FileSystemItemType = 'file' | 'directory';

class FileSystemManager {
  private basePath: string | null;

  constructor(basePath: string | null = null) {
    this.basePath = basePath;
  }

  setBasePath(newPath: string): boolean {
    if (!newPath || typeof newPath !== 'string') return false;
    const resolved = path.resolve(newPath);
    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
      this.basePath = resolved;
      return true;
    }
    return false;
  }

  private getFullPath(relativePath: string): string {
    if (!this.basePath) throw new Error('Base path is not set.');
    const target = path.resolve(this.basePath, relativePath);
    if (!target.startsWith(this.basePath)) {
      throw new Error('Access outside of base path is not allowed.');
    }
    return target;
  }

  create(relativePath: string, content: string = '', isFolder: boolean = false): string {
    const fullPath = this.getFullPath(relativePath);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (isFolder) {
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        return `✅ Folder created: ${fullPath}`;
      }
      return `⚠️ Folder already exists: ${fullPath}`;
    } else {
      fs.writeFileSync(fullPath, content, 'utf-8');
      return `✅ File created: ${fullPath}`;
    }
  }

  modify(relativePath: string, newContent: string): string {
    const fullPath = this.getFullPath(relativePath);
    if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
      throw new Error(`Cannot modify non-existent or invalid file: ${fullPath}`);
    }
    fs.writeFileSync(fullPath, newContent, 'utf-8');
    return `✏️ File modified: ${fullPath}`;
  }

  delete(relativePath: string): string {
    const fullPath = this.getFullPath(relativePath);
    if (!fs.existsSync(fullPath)) {
      return `⚠️ Path does not exist: ${fullPath}`;
    }

    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      return `🗑️ Folder deleted: ${fullPath}`;
    } else {
      fs.unlinkSync(fullPath);
      return `🗑️ File deleted: ${fullPath}`;
    }
  }

  move(origin: string, destination: string): string {
    const src = this.getFullPath(origin);
    const dst = this.getFullPath(destination);
    const dstDir = path.dirname(dst);

    if (!fs.existsSync(src)) {
      throw new Error(`Origin does not exist: ${src}`);
    }

    if (!fs.existsSync(dstDir)) {
      fs.mkdirSync(dstDir, { recursive: true });
    }

    fs.renameSync(src, dst);
    return `📁 Moved: ${src} → ${dst}`;
  }

  copy(origin: string, destination: string): string {
    const src = this.getFullPath(origin);
    const dst = this.getFullPath(destination);
    const dstDir = path.dirname(dst);

    if (!fs.existsSync(src)) {
      throw new Error(`Origin does not exist: ${src}`);
    }

    if (!fs.existsSync(dstDir)) {
      fs.mkdirSync(dstDir, { recursive: true });
    }

    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
      this.copyDirectory(src, dst);
      return `📂 Folder copied to: ${dst}`;
    } else {
      fs.copyFileSync(src, dst);
      return `📄 File copied to: ${dst}`;
    }
  }

  private copyDirectory(src: string, dst: string): void {
    fs.mkdirSync(dst, { recursive: true });
    fs.readdirSync(src).forEach(item => {
      const srcItem = path.join(src, item);
      const dstItem = path.join(dst, item);
      const stats = fs.statSync(srcItem);

      if (stats.isDirectory()) {
        this.copyDirectory(srcItem, dstItem);
      } else {
        fs.copyFileSync(srcItem, dstItem);
      }
    });
  }

  read(relativePath: string): string {
    const fullPath = this.getFullPath(relativePath);
    if (!fs.existsSync(fullPath)) throw new Error(`File not found: ${fullPath}`);
    return fs.readFileSync(fullPath, 'utf-8');
  }

  list(relativePath: string = '.'): string {
    const dirPath = this.getFullPath(relativePath);
    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
      throw new Error(`Invalid directory: ${dirPath}`);
    }

    const items = fs.readdirSync(dirPath);
    return items
      .map(item => {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        const type: FileSystemItemType = stats.isDirectory() ? 'directory' : 'file';
        return `${type}: ${item}`;
      })
      .join('\n');
  }

  getSystemInfo(): string {
    if (!this.basePath) return '⚠️ Base path is not set.';
    const stats = fs.statSync(this.basePath);
    return `📌 Base Path: ${this.basePath}\n🕓 Last Modified: ${stats.mtime}`;
  }
}

export default FileSystemManager;
