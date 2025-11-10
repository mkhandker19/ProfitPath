// /lib/fetchStockSummary.ts
export interface StockSummary {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}

const POLYGON_BASE = "https://api.polygon.io";

/**
 * Fetches a lightweight summary (current price + daily change) for one or multiple stock symbols.
 * Uses Polygon's previous close and latest quote endpoints.
 * Optimized for batching to reduce API usage.
 */
export async function fetchStockSummary(
  symbols: string[],
  apiKey: string
): Promise<StockSummary[]> {
  if (!symbols.length) return [];

  try {
    // Polygon endpoint for previous close data
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const formattedDate = date.toISOString().split("T")[0];

    // Use Promise.allSettled to fetch in parallel safely
    const results = await Promise.allSettled(
      symbols.map(async (symbol) => {
        const prevUrl = `${POLYGON_BASE}/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${apiKey}`;
        const quoteUrl = `${POLYGON_BASE}/v2/last/nbbo/${symbol}?apiKey=${apiKey}`;

        const [prevRes, quoteRes] = await Promise.all([
          fetch(prevUrl),
          fetch(quoteUrl),
        ]);

        if (!prevRes.ok || !quoteRes.ok)
          throw new Error(`Failed to fetch ${symbol}`);

        const prevData = await prevRes.json();
        const quoteData = await quoteRes.json();

        const prevClose = prevData?.results?.[0]?.c ?? null;
        const currentPrice = quoteData?.results?.p ?? prevClose ?? null;

        if (!currentPrice) throw new Error(`No price data for ${symbol}`);

        const changePercent = prevClose
          ? ((currentPrice - prevClose) / prevClose) * 100
          : 0;

        // For now, use symbol as name placeholder (we’ll fetch full name if needed)
        return {
          symbol,
          name: symbol,
          price: Number(currentPrice.toFixed(2)),
          changePercent: Number(changePercent.toFixed(2)),
        } as StockSummary;
      })
    );

    // Collect all successful results
    return results
      .filter((r): r is PromiseFulfilledResult<StockSummary> => r.status === "fulfilled")
      .map((r) => r.value);
  } catch (err) {
    console.error("Error in fetchStockSummary:", err);
    return [];
  }
}
