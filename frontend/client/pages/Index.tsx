import { Link } from "react-router-dom";
import { Search, Menu } from "lucide-react";

export default function Index() {
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
              className="px-4 py-2 rounded-lg bg-[#E3E3E3] text-[#1E1E1E] text-base font-normal hover:bg-[#d0d0d0] transition-colors"
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
              className="px-4 py-2 rounded-lg text-[#1E1E1E] text-base font-normal hover:bg-[#E3E3E3] transition-colors"
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

      <main className="container mx-auto px-4 py-8">
        <h1 className="font-quattrocento text-4xl md:text-5xl font-bold text-black leading-tight mb-12">
          Articles about Season Fruits
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <article className="group cursor-pointer">
            <div className="relative overflow-hidden rounded-[49px] border-[3px] border-black mb-4 aspect-[370/244]">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/534af3a02e3bf07290cfa0585204a216b16ad509?width=740"
                alt="Citrus Fruits"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <h2 className="font-quattrocento text-2xl font-bold text-black leading-tight">
              Citrus Fruits: Benefits
            </h2>
          </article>

          <article className="group cursor-pointer">
            <div className="relative overflow-hidden rounded-[49px] border-[3px] border-black mb-4 aspect-[370/244]">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/12158077f467481b417bb183b1b9f5ad68f59c1b?width=740"
                alt="Berries"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <h2 className="font-quattrocento text-2xl font-bold text-black leading-tight">
              Berries: Benefits
            </h2>
          </article>

          <article className="group cursor-pointer">
            <div className="relative overflow-hidden rounded-[49px] border-[3px] border-black mb-4 aspect-[370/244]">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/ca2b69b6a433113d87cd9e0031ee7d3591abdd25?width=740"
                alt="Mangoes"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <h2 className="font-quattrocento text-2xl font-bold text-black leading-tight">
              Mangoes: Benefits
            </h2>
          </article>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <article className="group cursor-pointer lg:max-w-[500px]">
            <div className="relative overflow-hidden rounded-[49px] border-[3px] border-black mb-4">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/cbceeee75bd088efc4658fe40995dad6a67670c5?width=1000"
                alt="Seasonal Recipes"
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <h2 className="font-quattrocento text-2xl font-bold text-black leading-tight">
              Seasonal Recipes
            </h2>
          </article>

          <div className="relative flex items-center justify-center lg:justify-start">
            <div className="relative w-full max-w-[500px] lg:max-w-[654px] aspect-square">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/f87f17bdf5b6e57e77f8ee7edf76e9e30588bb28?width=1308"
                alt="Did you know border"
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center p-12 md:p-16 lg:p-20">
                <div className="text-center max-w-[368px]">
                  <h3 className="font-quattrocento text-xl md:text-2xl lg:text-[32px] font-bold text-black leading-[1.25] mb-3 lg:mb-6">
                    DID YOU KNOW?
                  </h3>
                  <p className="font-quattrocento text-lg md:text-xl lg:text-[32px] font-bold text-black leading-[1.25]">
                    Chimps consume equivalent of a beer a day in alcohol from
                    fermented fruit
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
