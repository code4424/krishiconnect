import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">Krishi Connect</h1>
        <p className="text-gray-600 mb-8">
          The ultimate agricultural services and e-commerce platform. Connecting farmers with service providers and high-quality products.
        </p>
        <div className="flex flex-col gap-4">
          <Link
            to="/auth/login"
            className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/auth/register"
            className="w-full py-3 px-4 bg-white text-primary border-2 border-primary rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  )
}
