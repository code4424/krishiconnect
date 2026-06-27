import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import React from 'react'

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Uncaught error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center p-8">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-gray-500">An unexpected error occurred. Please try reloading the page.</p>
          <button
            className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 transition-opacity"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export const Route = createRootRoute({
  component: () => (
    <>
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
      <Toaster position="top-right" richColors closeButton />
    </>
  ),
})
