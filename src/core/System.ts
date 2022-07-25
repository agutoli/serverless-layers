import { execSync } from 'child_process';

export class System {
  static exec(cmd: string, cwd = process.cwd()): string {
    return execSync(cmd, {
      cwd,
      env: process.env,
      maxBuffer: 1024 * 1024 * 500
    }).toString();
  }
}
