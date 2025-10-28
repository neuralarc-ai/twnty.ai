export default function Footer() {
  return (
    <footer className="border-t border-black/20 mt-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-6 space-y-2">
          <p className="text-sm text-gray-700 font-serif tracking-[0.02em] leading-relaxed">
            © {new Date().getFullYear()} <span className="text-black font-semibold">twnty.ai</span> <span className="mx-2 text-gray-400">·</span> All Rights Reserved
          </p>
          <p className="text-xs text-gray-500 font-serif italic tracking-wide">
            A minimal blog for modern thinkers
          </p>
        </div>
      </div>
    </footer>
  );
}