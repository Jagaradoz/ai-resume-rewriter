import { Navbar } from "@/shared/layout/navbar";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center">
        <h1 className="text-4xl font-bold">AI Resume Rewriter</h1>
        <p className="mt-4 text-muted-foreground">
          Transform your resume bullets into impact-driven statements.
        </p>
      </main>
    </div>
  )
}
