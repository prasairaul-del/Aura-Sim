import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
          <div className="glass-card p-8 max-w-lg text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-400">Something went wrong</h2>
            <p className="text-white/60 mb-6 text-sm">
              The simulation encountered an unexpected error. Please try refreshing the page.
            </p>
            <pre className="text-left text-xs bg-white/5 p-4 rounded-lg mb-6 overflow-auto max-h-40 text-red-300">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-emerald-500 text-onyx-950 rounded-full font-bold text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
