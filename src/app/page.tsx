import Header from "../components/Header";
import Footer from "../components/Footer";
import Image from "next/image";
import Link from "next/link";


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Tools</h1>
          <CardsGrid />
        </div>
      </main>
      <Footer />
    </div>
  );
}

const CardsGrid = () => {
  const tools = [
    {
      title: "Chord Progression Generator",
      description:
        "Generate, visualize, and play jazz/blues chord progressions. Includes keyboard visual, metronome, and scale recommendations.",
      href: "/tools/progressions",
      screenshots: {
        dark: "/tools/progressions-dark.png",
        light: "/tools/progressions-light.png",
      },
      alt: "Chord Progression Generator Screenshot",
    },
  ];

  return (
    <div className="flex flex-wrap gap-8 w-full">
      {tools.map((tool, idx) => (
        <Link href={tool.href} className="group" key={tool.title}>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden flex flex-col items-center transition hover:shadow-lg max-w-[320px] w-full mx-auto">
            <div className="w-full flex justify-center mb-4">
              <div className="relative w-[320px] h-[180px]">
                <Image
                  src={tool.screenshots.dark}
                  alt={tool.alt}
                  fill
                  className="hidden dark:block rounded object-cover"
                  priority
                  sizes="320px"
                />
                <Image
                  src={tool.screenshots.light}
                  alt={tool.alt}
                  fill
                  className="block dark:hidden rounded object-cover"
                  priority
                  sizes="320px"
                />
              </div>
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2 text-center">
                {tool.title}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-center text-base">
                {tool.description}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
