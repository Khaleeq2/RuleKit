interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', maxWidth: '560px', margin: '0 auto', padding: '40px 24px', color: '#1e293b' }}>
      <div style={{ marginBottom: '32px' }}>
        <strong style={{ fontSize: '20px', color: '#2b4c7e' }}>RuleKit</strong>
      </div>

      <h1 style={{ fontSize: '24px', fontWeight: 600, lineHeight: 1.3, margin: '0 0 16px' }}>
        Welcome to RuleKit{name ? `, ${name}` : ''}
      </h1>

      <p style={{ fontSize: '15px', lineHeight: 1.65, color: '#475569', margin: '0 0 20px' }}>
        Your account is ready. You can now create rules in plain English, upload any content, and get instant verdicts backed by evidence.
      </p>

      <p style={{ fontSize: '15px', lineHeight: 1.65, color: '#475569', margin: '0 0 24px' }}>
        Here&apos;s how to get your first result in under 2 minutes:
      </p>

      <ol style={{ fontSize: '15px', lineHeight: 1.8, color: '#475569', margin: '0 0 28px', paddingLeft: '20px' }}>
        <li><strong>Write a rule</strong> — describe what you want to check, in your own words.</li>
        <li><strong>Upload content</strong> — drop a PDF, paste a URL, or send text.</li>
        <li><strong>Get a verdict</strong> — pass or fail, with the exact evidence that triggered it.</li>
      </ol>

      <a
        href="https://rulekit.io/home"
        style={{
          display: 'inline-block',
          backgroundColor: '#2b4c7e',
          color: '#ffffff',
          fontSize: '15px',
          fontWeight: 600,
          textDecoration: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
        }}
      >
        Open RuleKit →
      </a>

      <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '36px 0 20px' }} />

      <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
        You received this because you signed up for RuleKit. If this wasn&apos;t you, you can ignore this email.
      </p>
    </div>
  );
}
