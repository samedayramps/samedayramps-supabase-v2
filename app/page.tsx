import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
          <div />
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-foreground">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-foreground hover:bg-foreground/80">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3">
        <main className="flex-1 flex flex-col gap-6 text-center">
          <h1 className="text-6xl font-bold">Same Day Ramps</h1>
          <p className="text-2xl text-muted-foreground">
            Streamline your ramp installation management with our comprehensive solution
          </p>
          <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
          
          <div className="flex flex-col gap-8 text-foreground">
            <h2 className="text-3xl font-bold">Key Features</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2 p-4 border rounded-lg">
                <h3 className="text-xl font-semibold">Lead Management</h3>
                <p className="text-muted-foreground">Track and manage leads efficiently from initial contact to conversion</p>
              </div>
              <div className="flex flex-col gap-2 p-4 border rounded-lg">
                <h3 className="text-xl font-semibold">Quote Generation</h3>
                <p className="text-muted-foreground">Create professional quotes quickly with our automated system</p>
              </div>
              <div className="flex flex-col gap-2 p-4 border rounded-lg">
                <h3 className="text-xl font-semibold">Installation Tracking</h3>
                <p className="text-muted-foreground">Monitor installation progress and manage schedules effectively</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 items-center">
            <Link href="/sign-up">
              <Button size="lg" className="bg-foreground hover:bg-foreground/80">
                Get Started
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              No credit card required
            </p>
          </div>
        </main>
      </div>

      <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
        <p className="text-muted-foreground">
          Powered by Same Day Ramps © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
