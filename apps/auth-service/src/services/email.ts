import nodemailer from 'nodemailer'
import { logger } from '@algoarena/logger'

const isDev = process.env['NODE_ENV'] !== 'production'
const hasSmtp = !!(process.env['SMTP_USER'] && process.env['SMTP_PASS'])

// In dev without SMTP configured: use Ethereal (auto-provisioned catch-all account)
// In dev with SMTP configured, or in production: use real SMTP
let transporterPromise: Promise<nodemailer.Transporter> | null = null

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporterPromise) return transporterPromise

  transporterPromise = (async () => {
    if (isDev && !hasSmtp) {
      const testAccount = await nodemailer.createTestAccount()
      logger.info(
        { user: testAccount.user, pass: testAccount.pass, web: 'https://ethereal.email' },
        'Using Ethereal test email account — view sent emails at https://ethereal.email'
      )
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: { user: testAccount.user, pass: testAccount.pass },
      })
    }

    return nodemailer.createTransport({
      host: process.env['SMTP_HOST'] ?? 'smtp.mailtrap.io',
      port: parseInt(process.env['SMTP_PORT'] ?? '587'),
      auth: {
        user: process.env['SMTP_USER'],
        pass: process.env['SMTP_PASS'],
      },
    })
  })()

  return transporterPromise
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'
  const verifyUrl = `${appUrl}/verify-email?token=${token}`

  const transporter = await getTransporter()
  const info = await transporter.sendMail({
    from: process.env['EMAIL_FROM'] ?? 'AlgoArena <noreply@algoarena.dev>',
    to,
    subject: 'Verify your AlgoArena account',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
        <h2 style="color:#2563eb">Welcome to AlgoArena!</h2>
        <p>Click the button below to verify your email address and activate your account.</p>
        <a href="${verifyUrl}"
           style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Verify Email
        </a>
        <p style="color:#6b7280;font-size:14px">
          Or copy this link: <a href="${verifyUrl}">${verifyUrl}</a>
        </p>
        <p style="color:#6b7280;font-size:14px">This link expires in 24 hours.</p>
      </div>
    `,
    text: `Verify your AlgoArena account:\n\n${verifyUrl}\n\nThis link expires in 24 hours.`,
  })

  // In dev, log the Ethereal preview URL so the user can see the email without a real inbox
  if (isDev && !hasSmtp) {
    const previewUrl = nodemailer.getTestMessageUrl(info)
    logger.info({ to, previewUrl }, '📧 Verification email sent — preview at URL above')
    // Also print to stdout so it's impossible to miss
    console.log(`\n\x1b[33m📧 VERIFICATION EMAIL for ${to}\x1b[0m`)
    console.log(`\x1b[36m   Preview: ${previewUrl}\x1b[0m\n`)
  }
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'
  const resetUrl = `${appUrl}/reset-password?token=${token}`

  const transporter = await getTransporter()
  const info = await transporter.sendMail({
    from: process.env['EMAIL_FROM'] ?? 'AlgoArena <noreply@algoarena.dev>',
    to,
    subject: 'Reset your AlgoArena password',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
        <h2 style="color:#2563eb">Password Reset</h2>
        <p>Click the button below to reset your password. This link expires in 15 minutes.</p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Reset Password
        </a>
        <p style="color:#6b7280;font-size:14px">If you didn't request this, ignore this email.</p>
      </div>
    `,
    text: `Reset your password:\n\n${resetUrl}\n\nExpires in 15 minutes.`,
  })

  if (isDev && !hasSmtp) {
    const previewUrl = nodemailer.getTestMessageUrl(info)
    console.log(`\n\x1b[33m📧 PASSWORD RESET EMAIL for ${to}\x1b[0m`)
    console.log(`\x1b[36m   Preview: ${previewUrl}\x1b[0m\n`)
  }
}
