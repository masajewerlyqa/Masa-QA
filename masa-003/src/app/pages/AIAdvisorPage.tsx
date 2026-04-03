import { useState } from "react";
import { Sparkles, Send, Heart, DollarSign, Calendar } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ProductCard } from "../components/ProductCard";
import { DiamondPattern } from "../components/DiamondPattern";
import { Slider } from "../components/ui/slider";

export function AIAdvisorPage() {
  const [budget, setBudget] = useState([10000]);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your MASA AI Jewelry Advisor. I'm here to help you find the perfect piece of jewelry. What occasion are you shopping for?",
    },
  ]);

  const suggestions = [
    "I'm looking for an engagement ring",
    "Need a gift for an anniversary",
    "Want to invest in luxury jewelry",
    "Looking for everyday elegant pieces",
  ];

  const recommendedProducts = [
    {
      id: "ai-1",
      image: "https://images.unsplash.com/photo-1742240439165-60790db1ee93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      title: "Classic Solitaire Diamond Ring",
      brand: "Tiffany & Co",
      price: 9500,
      category: "Ring",
      metal: "Platinum",
      isFeatured: true,
    },
    {
      id: "ai-2",
      image: "https://images.unsplash.com/photo-1767921482419-d2d255b5b700?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      title: "Elegant Gold Pendant",
      brand: "Cartier",
      price: 7200,
      category: "Necklace",
      metal: "18K Gold",
    },
    {
      id: "ai-3",
      image: "https://images.unsplash.com/photo-1769078595478-5f756986b818?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      title: "Diamond Halo Earrings",
      brand: "Harry Winston",
      price: 12800,
      category: "Earrings",
      metal: "White Gold",
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-[#531C24] to-[#8B3940] rounded-2xl p-12 mb-12 overflow-hidden text-white">
        <DiamondPattern className="opacity-10" />
        <div className="relative z-10">
          <Badge className="mb-4 bg-[#D4AF37] text-white">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered
          </Badge>
          <h1 className="text-5xl mb-4" style={{ fontFamily: 'var(--font-luxury)' }}>
            AI Jewelry Advisor
          </h1>
          <p className="text-xl text-[#E7D8C3] max-w-2xl" style={{ fontFamily: 'var(--font-ui)' }}>
            Get personalized jewelry recommendations based on your style, occasion, and budget. Our AI understands your preferences and finds the perfect pieces for you.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Chat Interface */}
        <div className="col-span-2">
          <Card className="border-none shadow-lg">
            <CardContent className="p-0">
              {/* Messages */}
              <div className="h-[500px] overflow-y-auto p-6 space-y-4" style={{ fontFamily: 'var(--font-ui)' }}>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                        msg.role === "user"
                          ? "bg-[#531C24] text-white"
                          : "bg-[#F7F3EE] text-[#1A1A1A]"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                          <span className="text-xs text-[#635C5C]">MASA AI</span>
                        </div>
                      )}
                      <p className="leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Suggestions */}
              <div className="px-6 pb-4">
                <div className="text-xs text-[#635C5C] mb-3">Quick suggestions:</div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="text-xs border-[#531C24]/20 hover:bg-[#F7F3EE]"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="border-t border-[#531C24]/10 p-6">
                <div className="flex gap-3">
                  <Input
                    placeholder="Describe what you're looking for..."
                    className="flex-1 bg-[#F7F3EE] border-none"
                  />
                  <Button className="bg-[#531C24] hover:bg-[#531C24]/90">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preferences Sidebar */}
        <div className="space-y-6">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg mb-6 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
                Your Preferences
              </h3>

              <div className="space-y-6" style={{ fontFamily: 'var(--font-ui)' }}>
                {/* Budget */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-4 h-4 text-[#531C24]" />
                    <span className="text-sm">Budget Range</span>
                  </div>
                  <Slider
                    min={1000}
                    max={100000}
                    step={1000}
                    value={budget}
                    onValueChange={setBudget}
                    className="mb-2"
                  />
                  <div className="text-sm text-[#635C5C]">
                    Up to ${budget[0].toLocaleString()}
                  </div>
                </div>

                {/* Occasion */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-[#531C24]" />
                    <span className="text-sm">Occasion</span>
                  </div>
                  <div className="space-y-2">
                    {["Engagement", "Anniversary", "Birthday", "Investment"].map((occasion) => (
                      <Button
                        key={occasion}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-left"
                      >
                        {occasion}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Style */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-4 h-4 text-[#531C24]" />
                    <span className="text-sm">Style Preference</span>
                  </div>
                  <div className="space-y-2">
                    {["Classic", "Modern", "Vintage", "Bold"].map((style) => (
                      <Button
                        key={style}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-left"
                      >
                        {style}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-[#531C24] to-[#8B3940] text-white">
            <CardContent className="p-6">
              <Sparkles className="w-8 h-8 mb-4" />
              <h4 className="text-lg mb-2" style={{ fontFamily: 'var(--font-luxury)' }}>
                Premium AI Features
              </h4>
              <p className="text-sm text-[#E7D8C3] mb-4" style={{ fontFamily: 'var(--font-ui)' }}>
                Unlock advanced style matching, investment analysis, and virtual try-on features.
              </p>
              <Button className="w-full bg-white text-[#531C24] hover:bg-[#E7D8C3]">
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="mt-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl mb-2 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
              AI Recommended For You
            </h2>
            <p className="text-[#635C5C]" style={{ fontFamily: 'var(--font-ui)' }}>
              Based on your conversation and preferences
            </p>
          </div>
          <Badge className="bg-[#D4AF37] text-white">
            <Sparkles className="w-3 h-3 mr-1" />
            95% Match
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {recommendedProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </div>
  );
}
