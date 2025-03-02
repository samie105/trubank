import Image from "next/image";
import Link from "next/link";
import { FeaturedArticlesCarousel } from "./slides";
import { Newsletter } from "./Newletter";

interface Article {
  id: number;
  title: string;
  category: string;
  date: string;
  image: string;
  slug: string;
  author: string;
}

const articles: Article[] = [
  {
    id: 1,
    title: "The Future of Digital Banking: Trends To Watch in 2024",
    category: "Technology",
    date: "January 15, 2024",
    image: "/assets/Resources-blog/future-trend-digital-banking.png",
    slug: "future-of-digital-banking-2024",
    author: "Samuel Chukwuemeka",
  },
  {
    id: 2,
    title: "The Evolution Of Cybersecurity In Modern Banking",
    category: "Security",
    date: "January 12, 2024",
    image: "/assets/Resources-blog/cybersec-blog.jpg",
    slug: "cybersecurity-modern-banking",
    author: "Samuel Chukwuemeka",
  },
  {
    id: 3,
    title: "How To Choose The Right Account Type",
    category: "Guide",
    date: "January 10, 2024",
    image: "/assets/Resources-blog/right-account-type.jpg",
    slug: "choose-right-account-type",
    author: "Samuel Chukwuemeka",
  },
  {
    id: 4,
    title: "10 Tips For Managing Your Digital Payments",
    category: "Tips",
    date: "January 8, 2024",
    image: "/assets/Resources-blog/managing-digital-payments.jpg",
    slug: "managing-digital-payments",
    author: "Samuel Chukwuemeka",
  },
  {
    id: 5,
    title: "Understanding Blockchain In Banking",
    category: "Technology",
    date: "January 5, 2024",
    image: "/assets/Resources-blog/future-trend-digital-banking.png",
    slug: "blockchain-in-banking",
    author: "Samuel Chukwuemeka",
  },
  {
    id: 6,
    title: "Mobile Banking Security Best Practices",
    category: "Security",
    date: "January 3, 2024",
    image: "/assets/Resources-blog/cybersec-blog.jpg",
    slug: "mobile-banking-security",
    author: "Samuel Chukwuemeka",
  },
];

export default function BlogPage() {
  const featuredArticles = articles.slice(0, 3); // Use the first 3 articles as featured
  const otherArticles = articles.slice(3);

  return (
    <main className="min-h-screen p-8">
      {/* Featured Articles Carousel */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl">
          <FeaturedArticlesCarousel articles={featuredArticles} />
        </div>
      </section>

      {/* All Stories */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-gray-800">All Stories</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {otherArticles.map((article) => (
              <Link
                key={article.id}
                href={`#`}
                className="group block overflow-hidden rounded-lg"
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <Image
                    src={article.image || "/placeholder.svg"}
                    alt={article.title}
                    width={600}
                    height={338}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{article.category}</span>
                    <span>•</span>
                    <span>{article.date}</span>
                    <span>•</span>
                    <span>{article.author}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-gray-600 group-hover:text-primary">
                    {article.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />
    </main>
  );
}
