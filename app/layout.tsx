export const metadata = {
  title: 'Resume Tailor',
  description: 'Tailor your resume to job descriptions',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Inter, system-ui, Arial, sans-serif', maxWidth: 900, margin: '0 auto', padding: 24 }}>
        <header style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0 }}>Resume Tailor</h1>
          <p style={{ color: '#555', marginTop: 8 }}>Paste a job link and upload your DOCX resume.</p>
        </header>
        {children}
      </body>
    </html>
  );
}
