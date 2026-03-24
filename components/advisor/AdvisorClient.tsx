"use client";

import { useState, useTransition } from "react";
import { AdvisorForm } from "./AdvisorForm";
import { AdvisorResults } from "./AdvisorResults";
import { getRecommendations } from "@/lib/advisor";
import type { AdvisorPreferences, AdvisorResponse, ProductRecommendation } from "@/lib/advisor-types";
import type { Product } from "@/lib/types";

type AdvisorClientProps = {
  wishlistIds: string[];
};

type AdvisorState = {
  response: AdvisorResponse | null;
  products: Product[];
  recommendations: ProductRecommendation[];
};

export function AdvisorClient({ wishlistIds }: AdvisorClientProps) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<AdvisorState>({
    response: null,
    products: [],
    recommendations: [],
  });

  const handleSubmit = async (preferences: AdvisorPreferences) => {
    startTransition(async () => {
      const { response, products } = await getRecommendations(preferences);
      setState({
        response,
        products,
        recommendations: response.products,
      });
    });
  };

  const handleReset = () => {
    setState({ response: null, products: [], recommendations: [] });
  };

  return (
    <div className="max-w-5xl mx-auto">
      {state.response === null ? (
        <AdvisorForm onSubmit={handleSubmit} isLoading={isPending} />
      ) : (
        <AdvisorResults
          response={state.response}
          products={state.products}
          recommendations={state.recommendations}
          wishlistIds={wishlistIds}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
