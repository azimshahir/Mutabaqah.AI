type AuthLayoutProps = {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">Mutabaqah.AI</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Shariah Governance Middleware
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
