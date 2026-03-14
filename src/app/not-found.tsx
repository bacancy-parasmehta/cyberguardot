import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-8 text-center">
        <h1 className="text-2xl font-semibold">Asset Not Found</h1>
        <p className="mt-3 text-sm text-slate-400">
          The requested record is missing or has not been wired yet.
        </p>
        <Link
          className="mt-6 inline-flex rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium"
          href="/dashboard"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}