"use client";

import { useState, useEffect } from "react";
import { Calculator, Info } from "lucide-react";
import { goldPricePerGramAtPurity } from "@/lib/tools/gold-karat-price";
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
  { value: "24", label: "24K (99.9% Pure)", purity: 0.999 },
  { value: "22", label: "22K (91.7% Pure)", purity: 0.917 },
  { value: "21", label: "21K (87.5% Pure)", purity: 0.875 },
  { value: "18", label: "18K (75% Pure)", purity: 0.75 },
  { value: "14", label: "14K (58.3% Pure)", purity: 0.583 },
];

function getKaratLabel(label: string, isArabic: boolean): string {
  if (!isArabic) return label;
  const map: Record<string, string> = {
    "24K (99.9% Pure)": "24 قيراط (نقاء 99.9%)",
    "22K (91.7% Pure)": "22 قيراط (نقاء 91.7%)",
    "21K (87.5% Pure)": "21 قيراط (نقاء 87.5%)",
    "18K (75% Pure)": "18 قيراط (نقاء 75%)",
    "14K (58.3% Pure)": "14 قيراط (نقاء 58.3%)",
  };
  return map[label] ?? label;
}

const NISAB_GRAMS = 85;
const ZAKAT_RATE = 0.025;
const DEFAULT_GOLD_PRICE_QAR = 272.5; // QAR per gram fallback

function formatQAR(amount: number, isArabic: boolean): string {
  const prefix = isArabic ? "ر.ق" : "QAR";
  return `${prefix} ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

type ZakatCalculatorClientProps = {
  latestGoldPriceQAR?: number;
};

export function ZakatCalculatorClient({ latestGoldPriceQAR = DEFAULT_GOLD_PRICE_QAR }: ZakatCalculatorClientProps) {
  const { isArabic } = useLanguage();
  const [weight, setWeight] = useState("");
  const [karat, setKarat] = useState("22");
  const initialPurity = GOLD_KARATS.find((k) => k.value === "22")?.purity ?? 0.917;
  const [goldPrice, setGoldPrice] = useState(() =>
    goldPricePerGramAtPurity(latestGoldPriceQAR, initialPurity).toFixed(2)
  );
  const [syncPriceToSpot, setSyncPriceToSpot] = useState(true);
  const [result, setResult] = useState<{
    pureGold: number;
    totalValue: number;
    zakatDue: number;
    meetsNisab: boolean;
  } | null>(null);

  useEffect(() => {
    if (!syncPriceToSpot) return;
    const p = GOLD_KARATS.find((k) => k.value === karat)?.purity ?? 0.917;
    setGoldPrice(goldPricePerGramAtPurity(latestGoldPriceQAR, p).toFixed(2));
  }, [karat, latestGoldPriceQAR, syncPriceToSpot]);

  const calculate = () => {
    const weightNum = parseFloat(weight) || 0;
    const karatInfo = GOLD_KARATS.find((k) => k.value === karat);
    const purity = karatInfo?.purity || 0.917;
    const spotForKarat = goldPricePerGramAtPurity(latestGoldPriceQAR, purity);
    const priceNum = parseFloat(goldPrice) || spotForKarat;

    const pureGold = weightNum * purity;
    const totalValue = weightNum * priceNum;
    const meetsNisab = pureGold >= NISAB_GRAMS;
    const zakatDue = meetsNisab ? totalValue * ZAKAT_RATE : 0;

    setResult({
      pureGold: Math.round(pureGold * 100) / 100,
      totalValue: Math.round(totalValue * 100) / 100,
      zakatDue: Math.round(zakatDue * 100) / 100,
      meetsNisab,
    });
  };

  const reset = () => {
    setWeight("");
    setKarat("22");
    setSyncPriceToSpot(true);
    setResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-primary/10">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Calculator className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="font-luxury text-2xl">{isArabic ? "احسب زكاة الذهب" : "Calculate Your Gold Zakat"}</CardTitle>
          <CardDescription className="text-masa-gray">
            {isArabic ? "أدخل بيانات الذهب لحساب الزكاة" : "Enter your gold details to calculate your zakat obligation"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Gold Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight">{isArabic ? "إجمالي وزن الذهب (غرام)" : "Total Gold Weight (grams)"}</Label>
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
              <Select
                value={karat}
                onValueChange={(v) => {
                  setKarat(v);
                  setSyncPriceToSpot(true);
                }}
              >
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

            {/* Gold Price (per gram at selected karat) */}
            <div className="space-y-2">
              <Label htmlFor="price">
                {isArabic
                  ? "سعر الذهب (ر.ق/غرام حسب العيار المختار)"
                  : "Gold price (QAR per gram at selected karat)"}
              </Label>
              <Input
                id="price"
                type="number"
                placeholder={isArabic ? "سعر الغرام للعيار المختار" : "Price per gram for selected karat"}
                value={goldPrice}
                onChange={(e) => {
                  setSyncPriceToSpot(false);
                  setGoldPrice(e.target.value);
                }}
                className="bg-masa-light"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-masa-gray flex items-center gap-1">
                <Info className="w-3 h-3" />
                {isArabic
                  ? "يُحدَّث تلقائياً من سعر 24 عيار في السوق مضروباً في نقاء العيار. يمكنك تعديله يدوياً."
                  : "Updates from market 24K spot × purity for the karat you pick. You can override with your own quote."}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <Button onClick={calculate} className="flex-1 h-12">
                <Calculator className={`w-5 h-5 ${isArabic ? "ml-2" : "mr-2"}`} />
                {isArabic ? "احسب الزكاة" : "Calculate Zakat"}
              </Button>
              <Button variant="outline" onClick={reset}>
                {isArabic ? "إعادة ضبط" : "Reset"}
              </Button>
            </div>

            {/* Results */}
            {result && (
              <div className="mt-8 p-6 bg-masa-light rounded-xl space-y-4">
                <h3 className="font-luxury text-lg text-center mb-4">{isArabic ? "نتائج الحساب" : "Calculation Results"}</h3>

                <div className="grid grid-cols-2 gap-4">
                  <ResultItem label={isArabic ? "محتوى الذهب الخالص" : "Pure Gold Content"} value={`${result.pureGold} g`} />
                  <ResultItem label={isArabic ? "القيمة الإجمالية" : "Total Value"} value={formatQAR(result.totalValue, isArabic)} />
                </div>

                <div className="pt-4 border-t border-primary/10">
                  {result.meetsNisab ? (
                    <div className="text-center">
                      <p className="text-sm text-masa-gray mb-2">{isArabic ? "الزكاة المستحقة (2.5%)" : "Zakat Due (2.5%)"}</p>
                      <p className="text-3xl font-luxury text-primary">
                        {formatQAR(result.zakatDue, isArabic)}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-masa-gray">
                        {isArabic
                          ? `ذهبك (${result.pureGold}غ) أقل من نصاب ${NISAB_GRAMS}غ.`
                          : `Your gold (${result.pureGold}g) is below the nisab threshold of ${NISAB_GRAMS}g.`}
                      </p>
                      <p className="text-sm text-masa-gray mt-1">{isArabic ? "لا زكاة مستحقة حالياً." : "No zakat is due at this time."}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ResultItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-3 bg-white rounded-lg">
      <p className="text-xs text-masa-gray mb-1">{label}</p>
      <p className="font-medium text-masa-dark">{value}</p>
    </div>
  );
}
