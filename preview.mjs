// Optional managed-preview bridge. Normal laptop startup is python app.py.
import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
const managed = '/opt/codex/runtimes/codex-primary-runtime/dependencies/python/bin/python3';
const python = process.env.CODEX_PRIMARY_RUNTIME_PYTHON || (existsSync(managed) ? managed : (process.platform === 'win32' ? 'python' : 'python3'));
const child = spawn(python, ['app.py', ...process.argv.slice(2)], {stdio:'inherit'});
child.on('exit',code=>process.exit(code ?? 1));
child.on('error',error=>{console.error(error.message);process.exit(1);});
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>child.kill(signal));
