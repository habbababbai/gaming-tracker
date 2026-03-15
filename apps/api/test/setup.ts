import 'dotenv/config';
import { execSync } from 'child_process';
import { resolve } from 'path';

if (process.env['DATABASE_URL']) {
  try {
    execSync('bunx prisma migrate deploy', {
      cwd: resolve(__dirname, '..'),
      stdio: 'pipe',
    });
  } catch {
    // Migrations may already be applied or DB not reachable in some envs
  }
}
