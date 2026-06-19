import React from 'react'

type State = { hasError: boolean }

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: any, info: any) {
    // log error to an external service if configured
    // console.error('ErrorBoundary caught', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
          <div className="max-w-lg rounded-xl border border-white/10 bg-[#0F0F11]/95 p-8 text-center">
            <h2 className="text-2xl font-semibold">Something went wrong</h2>
            <p className="mt-4 text-slate-300">An unexpected error occurred. Please refresh the page or try again later.</p>
          </div>
        </div>
      )
    }

    return this.props.children as any
  }
}
