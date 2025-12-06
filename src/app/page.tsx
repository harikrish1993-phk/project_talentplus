import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold">TalentPulse AI</h1>
          <div className="flex gap-4">
            <Link href="/login">
              <button className="px-4 py-2 rounded hover:bg-gray-100">Login</button>
            </Link>
            <Link href="/register">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-5xl font-bold">
            AI-Powered Smart and Quick Recruitment ATS.
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            Built for modern consultancies. Powered by AI.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg">
                Start Free Trial
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-lg">
                View Demo
              </button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto text-center text-sm text-gray-500">
          © 2025 TalentPulse AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}