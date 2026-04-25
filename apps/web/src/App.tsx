import type { CaseType, DiagnosisStatus } from '@diagnova/shared-types';

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>DiagNova</h1>
        <p>AI-Powered Medical Diagnostics</p>
      </header>
      <main className="main">
        <p>Welcome to DiagNova. The frontend is ready for development.</p>
        <p>
          Shared types are available:{' '}
          <code>CaseType</code>, <code>DiagnosisStatus</code>, and more from{' '}
          <code>@diagnova/shared-types</code>.
        </p>
      </main>
    </div>
  );
}

export default App;

// Re-export shared types for convenience in components
export type { CaseType, DiagnosisStatus };
