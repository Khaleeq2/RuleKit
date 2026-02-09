interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
}

export function PasswordResetEmail({ name, resetUrl }: PasswordResetEmailProps) {
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', maxWidth: '560px', margin: '0 auto', padding: '40px 24px', color: '#1e293b' }}>
      <div style={{ marginBottom: '32px' }}>
        <strong style={{ fontSize: '20px', color: '#2b4c7e' }}>RuleKit</strong>
      </div>

      <h1 style={{ fontSize: '22px', fontWeight: 600, lineHeight: 1.3, margin: '0 0 16px' }}>
        Reset your password
      </h1>

      <p style={{ fontSize: '15px', lineHeight: 1.65, color: '#475569', margin: '0 0 20px' }}>
        {name ? `Hi ${name}, w` : 'W'}e received a request to reset your password. Click the button below to choose a new one.
      </p>

      <a
        href={resetUrl}
        style={{
          display: 'inline-block',
          backgroundColor: '#2b4c7e',
          color: '#ffffff',
          fontSize: '15px',
          fontWeight: 600,
          textDecoration: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          marginBottom: '24px',
        }}
      >
        Reset password
      </a>

      <p style={{ fontSize: '14px', lineHeight: 1.65, color: '#64748b', margin: '24px 0 0' }}>
        This link expires in 1 hour. If you didn&apos;t request a password reset, you can safely ignore this email — your account is secure.
      </p>

      <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '36px 0 20px' }} />

      <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
        You received this because a password reset was requested for this email on rulekit.io.
      </p>
    </div>
  );
}
