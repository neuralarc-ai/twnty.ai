export default function Footer() {
  return (
    <footer className="border-t border-black mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} twnty.ai. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="/about" className="text-sm text-gray-600 hover:text-black transition-colors">
              About
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}