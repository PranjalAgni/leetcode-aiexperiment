import { execFile, spawn } from 'child_process'
import { writeFile, mkdir, rm } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { promisify } from 'util'
import { randomUUID } from 'crypto'

const execFileAsync = promisify(execFile)

interface RunOptions {
  language: string
  code: string
  stdin: string
  timeLimitMs: number
}

interface RunResult {
  stdout: string
  stderr: string
  exitCode: number
  timedOut: boolean
  runtimeMs: number
}

const LANG_CONFIG: Record<string, { file: string; compile?: string[]; run: string[] }> = {
  python3:    { file: 'solution.py',   run: ['python3', 'solution.py'] },
  javascript: { file: 'solution.js',   run: ['node', 'solution.js'] },
  typescript: { file: 'solution.ts',   run: ['npx', 'ts-node', '--skip-project', 'solution.ts'] },
  java:       { file: 'Solution.java', compile: ['javac', 'Solution.java'], run: ['java', '-Xmx256m', 'Solution'] },
  cpp17:      { file: 'solution.cpp',  compile: ['g++', '-O2', '-std=c++17', '-o', 'solution', 'solution.cpp'], run: ['./solution'] },
  go:         { file: 'solution.go',   run: ['go', 'run', 'solution.go'] },
  rust:       { file: 'solution.rs',   compile: ['rustc', '-O', '-o', 'solution', 'solution.rs'], run: ['./solution'] },
  ruby:       { file: 'solution.rb',   run: ['ruby', 'solution.rb'] },
}

export async function runCode(opts: RunOptions): Promise<RunResult> {
  const cfg = LANG_CONFIG[opts.language]
  if (!cfg) {
    return { stdout: '', stderr: `Unsupported language: ${opts.language}`, exitCode: 1, timedOut: false, runtimeMs: 0 }
  }

  const workDir = join(tmpdir(), `algoarena-${randomUUID()}`)
  await mkdir(workDir, { recursive: true })

  try {
    await writeFile(join(workDir, cfg.file), opts.code, 'utf8')

    // Compile step (synchronous, no stdin needed)
    if (cfg.compile) {
      try {
        await execFileAsync(cfg.compile[0]!, cfg.compile.slice(1), {
          cwd: workDir,
          timeout: 20000,
        })
      } catch (err: unknown) {
        const e = err as { stdout?: string; stderr?: string; code?: string; cmd?: string }
        const msg = e.code === 'ENOENT'
          ? `Runtime not available: '${cfg.compile![0]}' is not installed on this server.`
          : (e.stderr ?? e.stdout ?? String(err))
        return { stdout: '', stderr: msg, exitCode: 1, timedOut: false, runtimeMs: 0 }
      }
    }

    // Run with piped stdin (promisify execFile doesn't support stdin pipe)
    return await runWithStdin(cfg.run[0]!, cfg.run.slice(1), workDir, opts.stdin, opts.timeLimitMs + 2000)
  } finally {
    await rm(workDir, { recursive: true, force: true })
  }
}

function runWithStdin(cmd: string, args: string[], cwd: string, stdin: string, timeoutMs: number): Promise<RunResult> {
  return new Promise((resolve) => {
    const start = Date.now()
    const child = spawn(cmd, args, { cwd, stdio: ['pipe', 'pipe', 'pipe'] })

    let stdout = ''
    let stderr = ''
    let timedOut = false

    const timer = setTimeout(() => {
      timedOut = true
      child.kill('SIGTERM')
    }, timeoutMs)

    child.stdout.on('data', (chunk: Buffer) => { stdout += chunk.toString() })
    child.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString() })

    child.on('close', (code) => {
      clearTimeout(timer)
      resolve({
        stdout,
        stderr,
        exitCode: code ?? 1,
        timedOut,
        runtimeMs: Date.now() - start,
      })
    })

    child.on('error', (err: NodeJS.ErrnoException) => {
      clearTimeout(timer)
      const msg = err.code === 'ENOENT'
        ? `Runtime not available: '${cmd}' is not installed on this server.`
        : err.message
      resolve({ stdout: '', stderr: msg, exitCode: 1, timedOut: false, runtimeMs: Date.now() - start })
    })

    // Write stdin and close it so the process knows EOF
    child.stdin.write(stdin, () => child.stdin.end())
  })
}
