import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch, faCog, faGem } from "@fortawesome/free-solid-svg-icons"

export default function HeaderSection() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
      <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={faGem} className="w-5 h-5" />
        <span className="text-sm tracking-wider">FRAGMENTS</span>
      </div>
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search your fragments"
            className="pl-10 bg-gray-900 border border-gray-700 text-white placeholder-gray-400 rounded-md w-full py-2"
          />
        </div>
      </div>
      <button className="text-gray-400 hover:text-white bg-transparent border-none p-2 rounded">
        <FontAwesomeIcon icon={faCog} className="w-5 h-5" />
      </button>
    </header>
  )
}