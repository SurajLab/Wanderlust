import { Link } from 'react-router-dom'

export default function ErrorPage({ message = "Something went wrong!" }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <i className="fa-solid fa-triangle-exclamation text-primary text-5xl mb-4" />
      <h1 className="text-2xl font-bold mb-2">Oops!</h1>
      <p className="text-gray-500 mb-6 max-w-sm">{message}</p>
      <Link to="/listings" className="btn-primary">
        <i className="fa-solid fa-house mr-2" />Back to Home
      </Link>
    </div>
  )
}
