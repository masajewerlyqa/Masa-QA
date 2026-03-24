"use client";

import { useState } from "react";
import { Coins, Info, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/components/LanguageProvider";

const GOLD_KARATS = [
  { value: "24", label: "24K (99.9% Pure)", purity: 0.999, buybackRate: 0.98 },
  { value: "22", label: "22K (91.7% Pure)", purity: 0.917, buybackRate: 0.95 },
  { value: "21", label: "21K (87.5% Pure)", purity: 0.875, buybackRate: 0.93 },
  { value: "18", label: "18K (75% Pure)", purity: 0.75, buybackRate: 0.90 },
  { value: "14", label: "14K (58.3% Pure)", purity: 0.583, buybackRate: 0.85 },
  { value: "10", label: "10K (41.7% Pure)", purity: 0.417, buybackRate: 0.80 },
];

function getKaratLabel(label: string, isArabic: boolean): string {
  if (!isArabic) return label;
  const map: Record<string, string> = {
    "24K (99.9% Pure)": "24 قيراط (نقاء 99.9%)",
    "22K (91.7% Pure)": "22 قيراط (نقاء 91.7%)",
    "21K (87.5% Pure)": "21 قيراط (نقاء 87.5%)",
    "18K (75% Pure)": "18 قيراط (نقاء 75%)",
    "14K (58.3% Pure)": "14 قيراط (نقاء 58.3%)",
    "10K (41.7% Pure)": "10 قيراط (نقاء 41.7%)",
  };
  return map[label] ?? label;
}

const DEFAULT_GOLD_PRICE_QAR = 272.5; // QAR per gram fallback

function formatQAR(amount: number): string {
  return `ر.ق ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

type SellGoldCalculatorClientProps = {
  latestGoldPriceQAR?: number;
};

export function SellGoldCalculatorClient({ latestGoldPriceQAR = DEFAULT_GOLD_PRICE_QAR }: SellGoldCalculatorClientProps) {
  const { isArabic } = useLanguage();
  const [weight, setWeight] = useState("");
  const [karat, setKarat] = useState("22");
  const [goldPrice, setGoldPrice] = useState(latestGoldPriceQAR.toFixed(2));
  const [result, setResult] = useState<{
    pureGold: number;
    marketValue: number;
    estimatedOffer: number;
    buybackRate: number;
  } | null>(null);

  const calculate = () => {
    const weightNum = parseFloat(weight) || 0;
    const priceNum = parseFloat(goldPrice) || latestGoldPriceQAR;
    const karatInfo = GOLD_KARATS.find((k) => k.value === karat);
    const purity = karatInfo?.purity || 0.917;
    const buybackRate = karatInfo?.buybackRate || 0.95;

    const pureGold = weightNum * purity;
    const marketValue = pureGold * priceNum;
    const estimatedOffer = marketValue * buybackRate;

    setResult({
      pureGold: Math.round(pureGold * 100) / 100,
      marketValue: Math.round(marketValue * 100) / 100,
      estimatedOffer: Math.round(estimatedOffer * 100) / 100,
      buybackRate: Math.round(buybackRate * 100),
    });
  };

  const reset = () => {
    setWeight("");
    setKarat("22");
    setGoldPrice(latestGoldPriceQAR.toFixed(2));
    setResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-primary/10">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Coins className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="font-luxury text-2xl">{isArabic ? "قدّر قيمة ذهبك" : "Estimate Your Gold Value"}</CardTitle>
          <CardDescription className="text-masa-gray">
            {isArabic ? "أدخل بيانات الذهب للحصول على تقدير فوري" : "Enter your gold details to get an instant valuation estimate"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Gold Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight">{isArabic ? "وزن الذهب (غرام)" : "Gold Weight (grams)"}</Label>
              <Input
                id="weight"
                type="number"
                placeholder={isArabic ? "أدخل الوزن بالغرام" : "Enter weight in grams"}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="bg-masa-light"
                min="0"
                step="0.01"
              />
            </div>

            {/* Gold Karat */}
            <div className="space-y-2">
              <Label htmlFor="karat">{isArabic ? "عيار الذهب / النقاء" : "Gold Karat / Purity"}</Label>
              <Select value={karat} onValueChange={setKarat}>
                <SelectTrigger id="karat" className="bg-masa-light">
                  <SelectValue placeholder={isArabic ? "اختر العيار" : "Select karat"} />
                </SelectTrigger>
                <SelectContent>
                  {GOLD_KARATS.map((k) => (
                    <SelectItem key={k.value} value={k.value}>
                      {getKaratLabel(k.label, isArabic)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Gold Price */}
            <div className="space-y-2">
              <Label htmlFor="price">{isArabic ? "سعر الذهب الحالي (ر.ق لكل غرام)" : "Current Gold Price (QAR per gram)"}</Label>
              <Input
                id="price"
                type="number"
                placeholder={isArabic ? "سعر الذهب الحالي" : "Current gold price"}
                value={goldPrice}
                onChange={(e) => setGoldPrice(e.target.value)}
                className="bg-masa-light"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-masa-gray flex items-center gap-1">
                <Info className="w-3 h-3" />
                {isArabic ? "تم ضبطه على أحدث سعر من صفحة أسعار السوق" : "Defaulted to the latest Market Prices gold rate"}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <Button onClick={calculate} className="flex-1 h-12">
                <Coins className={`w-5 h-5 ${isArabic ? "ml-2" : "mr-2"}`} />
                {isArabic ? "احسب القيمة" : "Calculate Value"}
              </Button>
              <Button variant="outline" onClick={reset}>
                {isArabic ? "إعادة ضبط" : "Reset"}
              </Button>
            </div>

            {/* Results */}
            {result && (
              <div className="mt-8 p-6 bg-masa-light rounded-xl space-y-4">
                <h3 className="font-luxury text-lg text-center mb-4">{isArabic ? "نتائج التقييم" : "Valuation Results"}</h3>

                <div className="grid grid-cols-2 gap-4">
                  <ResultItem
                    label={isArabic ? "محتوى الذهب الخالص" : "Pure Gold Content"}
                    value={`${result.pureGold} g`}
                    icon={null}
                  />
                  <ResultItem
                    label={isArabic ? "القيمة السوقية" : "Market Value"}
                    value={formatQAR(result.marketValue)}
                    icon={<TrendingUp className="w-4 h-4 text-green-600" />}
                  />
                </div>

                <div className="pt-4 border-t border-primary/10">
                  <div className="text-center bg-white rounded-xl p-6">
                    <p className="text-sm text-masa-gray mb-1">
                      {isArabic ? `العرض التقديري (${result.buybackRate}% من السوق)` : `Estimated Offer (${result.buybackRate}% of market)`}
                    </p>
                    <p className="text-4xl font-luxury text-primary mb-2">
                      {formatQAR(result.estimatedOffer)}
                    </p>
                    <p className="text-xs text-masa-gray">
                      {isArabic ? "قد تختلف العروض الفعلية حسب التاجر وظروف السوق" : "Actual offers may vary based on dealer and market conditions"}
                    </p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-white rounded-lg p-4 text-sm">
                  <h4 className="font-medium text-masa-dark mb-3">{isArabic ? "تفصيل السعر" : "Price Breakdown"}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-masa-gray">{isArabic ? "الوزن الإجمالي" : "Total Weight"}</span>
                      <span>{weight} g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-masa-gray">{isArabic ? `الذهب الخالص (${karat}K)` : `Pure Gold (${karat}K)`}</span>
                      <span>{result.pureGold} g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-masa-gray">{isArabic ? "سعر الذهب" : "Gold Price"}</span>
                      <span>{formatQAR(Number(goldPrice) || 0)}/g</span>
                    </div>
                    <div className="flex justify-between border-t border-primary/10 pt-2">
                      <span className="text-masa-gray">{isArabic ? "القيمة السوقية" : "Market Value"}</span>
                      <span className="font-medium">{formatQAR(result.marketValue)}</span>
                    </div>
                    <div className="flex justify-between text-primary">
                      <span>{isArabic ? "تقديرك" : "Your Estimate"}</span>
                      <span className="font-medium">{formatQAR(result.estimatedOffer)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ResultItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="text-center p-3 bg-white rounded-lg">
      <p className="text-xs text-masa-gray mb-1">{label}</p>
      <div className="flex items-center justify-center gap-1">
        {icon}
        <span className="font-medium text-masa-dark">{value}</span>
      </div>
    </div>
  );
}
