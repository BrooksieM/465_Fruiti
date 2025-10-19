import { Link } from "react-router-dom";
import { Search, Menu, ArrowLeft } from "lucide-react";

export default function Nutrition() {
  return (
    <div className="min-h-screen bg-lavender">
      <header className="relative">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="w-32 md:w-48 lg:w-[292px] h-auto flex-shrink-0">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/ca15b2de224c9753bf791bc806dd71f56c9ca800?width=584"
                alt="Fruiti"
                className="w-full h-auto object-contain"
              />
            </Link>

            <div className="flex-1 flex justify-center max-w-[500px] mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search Fruit"
                  className="w-full h-14 px-4 pr-12 rounded-full border border-[#D9D9D9] bg-white text-base font-normal text-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-black/20"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Search className="w-9 h-9 text-[#1E1E1E]" strokeWidth={2} />
                </button>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <button className="px-6 py-3 rounded-lg border border-[#767676] bg-[#E3E3E3] text-[#1E1E1E] text-base font-normal hover:bg-[#d0d0d0] transition-colors">
                Log In
              </button>
              <button className="px-6 py-3 rounded-lg border border-[#2C2C2C] bg-[#6750A4] text-[#F5F5F5] text-base font-normal hover:bg-[#5643a3] transition-colors">
                Sign Up
              </button>
            </div>

            <button className="lg:hidden p-4">
              <Menu className="w-10 h-10 text-[#49454F]" />
            </button>
          </div>
        </div>

        <nav className="container mx-auto px-4 mt-6">
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              to="/"
              className="px-4 py-2 rounded-lg text-[#1E1E1E] text-base font-normal hover:bg-[#E3E3E3] transition-colors"
            >
              Home
            </Link>
            <Link
              to="/become-seller"
              className="px-4 py-2 rounded-lg text-[#1E1E1E] text-base font-normal hover:bg-[#E3E3E3] transition-colors"
            >
              Become a Seller
            </Link>
            <Link
              to="/nutrition"
              className="px-4 py-2 rounded-lg bg-[#E3E3E3] text-[#1E1E1E] text-base font-normal hover:bg-[#d0d0d0] transition-colors"
            >
              Nutrition
            </Link>
            <Link
              to="/recipe"
              className="px-4 py-2 rounded-lg text-[#1E1E1E] text-base font-normal hover:bg-[#E3E3E3] transition-colors"
            >
              Recipe
            </Link>
            <Link
              to="/about"
              className="px-4 py-2 rounded-lg text-[#1E1E1E] text-base font-normal hover:bg-[#E3E3E3] transition-colors"
            >
              About Us
            </Link>
          </div>
        </nav>

        <div className="w-full h-3 bg-black mt-6"></div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-quattrocento text-5xl font-bold text-black mb-6">
            Nutrition
          </h1>
          <p className="text-xl text-black/70 mb-8">
            This page is coming soon. Continue prompting to add content here!
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#6750A4] text-white hover:bg-[#5643a3] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
