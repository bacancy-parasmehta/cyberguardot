"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-900 p-8">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-300">
            {error.message}
          </pre>
          <button
            className="mt-6 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white"
            onClick={reset}
            type="button"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}