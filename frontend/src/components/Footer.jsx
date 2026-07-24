export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col items-center gap-3">
        <div className="flex gap-4 text-xl text-gray-500">
          <i className="fa-brands fa-square-facebook hover:text-gray-700 cursor-pointer transition-colors" />
          <i className="fa-brands fa-square-instagram hover:text-gray-700 cursor-pointer transition-colors" />
          <i className="fa-brands fa-square-x-twitter hover:text-gray-700 cursor-pointer transition-colors" />
          <i className="fa-brands fa-square-linkedin hover:text-gray-700 cursor-pointer transition-colors" />
        </div>
        <p className="text-sm text-gray-500">&copy; WanderLust privated Limited.</p>
        <div className="flex gap-8 text-sm text-gray-500">
          <a href="/privacy" className="hover:underline">Privacy</a>
          <a href="/terms" className="hover:underline">Terms</a>
        </div>
      </div>
    </footer>
  )
}
