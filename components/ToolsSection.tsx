import Link from "next/link";
import { Sparkles, Calculator, Coins, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const tools = [
  {
    id: "advisor",
    title: "AI Jewelry Advisor",
    description:
      "Let our intelligent advisor help you find the perfect piece based on your preferences, occasion, and budget.",
    icon: Sparkles,
    href: "/advisor",
    cta: "Get Recommendations",
  },
  {
    id: "zakat",
    title: "Zakat Calculator",
    description:
      "Calculate your annual zakat obligation on gold and jewelry holdings according to Islamic guidelines.",
    icon: Calculator,
    href: "/tools/zakat",
    cta: "Calculate Zakat",
  },
  {
    id: "sell",
    title: "Sell Gold Calculator",
    description:
      "Estimate the current market value of your gold jewelry based on weight, karat, and live gold prices.",
    icon: Coins,
    href: "/tools/sell",
    cta: "Estimate Value",
  },
];

export function ToolsSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-content mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2">
            Exclusive Features
          </p>
          <h2 className="font-luxury text-3xl md:text-4xl text-masa-dark mb-4">
            Smart Jewelry Tools
          </h2>
          <p className="text-masa-gray max-w-2xl mx-auto">
            Powerful tools designed to help you make informed decisions about your luxury jewelry
            investments.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <article
                key={tool.id}
                className="group relative bg-masa-light rounded-xl border border-primary/10 p-6 lg:p-8 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                {/* Icon */}
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-7 h-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="font-luxury text-xl text-masa-dark mb-3">{tool.title}</h3>
                <p className="text-masa-gray text-sm leading-relaxed mb-6">{tool.description}</p>

                {/* CTA */}
                <Link href={tool.href}>
                  <Button
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary hover:text-white group-hover:border-primary"
                  >
                    {tool.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
