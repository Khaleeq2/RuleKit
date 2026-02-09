interface ContactConfirmationEmailProps {
  name: string;
}

export function ContactConfirmationEmail({ name }: ContactConfirmationEmailProps) {
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', maxWidth: '560px', margin: '0 auto', padding: '40px 24px', color: '#1e293b' }}>
      <div style={{ marginBottom: '32px' }}>
        <strong style={{ fontSize: '20px', color: '#2b4c7e' }}>RuleKit</strong>
      </div>

      <h1 style={{ fontSize: '22px', fontWeight: 600, lineHeight: 1.3, margin: '0 0 16px' }}>
        We got your message{name ? `, ${name}` : ''}
      </h1>

      <p style={{ fontSize: '15px', lineHeight: 1.65, color: '#475569', margin: '0 0 20px' }}>
        Thanks for reaching out. A real person on our team will read your message and get back to you within one business day.
      </p>

      <p style={{ fontSize: '15px', lineHeight: 1.65, color: '#475569', margin: '0 0 24px' }}>
        In the meantime, you can explore the product or check out our documentation:
      </p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <a
          href="https://rulekit.io/home"
          style={{
            display: 'inline-block',
            backgroundColor: '#2b4c7e',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
          }}
        >
          Open RuleKit
        </a>
        <a
          href="https://rulekit.io/developers/quickstart"
          style={{
            display: 'inline-block',
            backgroundColor: '#f1f5f9',
            color: '#1e293b',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
          }}
        >
          Developer docs
        </a>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '36px 0 20px' }} />

      <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
        You received this because you submitted a contact form on rulekit.io. No further emails will be sent unless you sign up.
      </p>
    </div>
  );
}
