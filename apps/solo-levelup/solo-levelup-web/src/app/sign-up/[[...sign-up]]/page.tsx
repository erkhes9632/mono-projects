import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-zinc-100 antialiased">
      <main className="mx-auto max-w-sm text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Sign Up
        </h1>
        <div className="mt-6">
          <SignUp />
        </div>
      </main>
    </div>
  );
}
