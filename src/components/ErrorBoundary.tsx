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
          <div className="bg-card border p-8 max-w-lg text-center rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-red-500">Something went wrong</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              The simulation encountered an unexpected error. Please try refreshing the page.
            </p>
            <pre className="text-left text-xs bg-muted p-4 rounded-md mb-6 overflow-auto max-h-40 text-red-500">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-emerald-500 text-white rounded-md font-bold text-xs hover:bg-emerald-600 transition-colors"
            >
              Reload application
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
