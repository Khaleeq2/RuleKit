interface ContactSubmissionEmailProps {
  name: string;
  email: string;
  message: string;
}

export function ContactSubmissionEmail({ name, email, message }: ContactSubmissionEmailProps) {
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', maxWidth: '560px', margin: '0 auto', padding: '40px 24px', color: '#1e293b' }}>
      <div style={{ marginBottom: '32px' }}>
        <strong style={{ fontSize: '20px', color: '#2b4c7e' }}>RuleKit</strong>
        <span style={{ fontSize: '14px', color: '#94a3b8', marginLeft: '8px' }}>Contact Form</span>
      </div>

      <h1 style={{ fontSize: '22px', fontWeight: 600, lineHeight: 1.3, margin: '0 0 20px' }}>
        New contact submission
      </h1>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
        <tbody>
          <tr>
            <td style={{ padding: '8px 0', fontSize: '14px', color: '#94a3b8', width: '80px', verticalAlign: 'top' }}>Name</td>
            <td style={{ padding: '8px 0', fontSize: '15px', color: '#1e293b' }}>{name}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 0', fontSize: '14px', color: '#94a3b8', verticalAlign: 'top' }}>Email</td>
            <td style={{ padding: '8px 0', fontSize: '15px', color: '#1e293b' }}>
              <a href={`mailto:${email}`} style={{ color: '#2b4c7e', textDecoration: 'none' }}>{email}</a>
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '16px 20px', marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 8px', fontWeight: 600 }}>Message</p>
        <p style={{ fontSize: '15px', lineHeight: 1.65, color: '#334155', margin: 0, whiteSpace: 'pre-wrap' }}>{message}</p>
      </div>

      <a
        href={`mailto:${email}`}
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
        Reply to {name}
      </a>
    </div>
  );
}
