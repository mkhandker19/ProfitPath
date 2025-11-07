"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AssetsPage() {
  const { theme } = useTheme(); // 👈 Add this line
  const [assets, setAssets] = useState<any[]>([]);
  const [newAsset, setNewAsset] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [chartRange, setChartRange] = useState(30);
  const [comparePair, setComparePair] = useState<string[]>([]);
  const [compareResult, setCompareResult] = useState("");

  const polygonKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
  const openAiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  /* ─────────────── Load & Save Watchlist ─────────────── */
  useEffect(() => {
    const saved = localStorage.getItem("watchlist");
    if (saved) setAssets(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(assets));
  }, [assets]);

  /* ─────────────── Add Stock ─────────────── */
  const addAsset = async () => {
    if (!newAsset.trim()) return;
    setError("");
    setLoading(true);
    const symbol = newAsset.toUpperCase();

    try {
      const ref = await fetch(
        `https://api.polygon.io/v3/reference/tickers/${symbol}?apiKey=${polygonKey}`
      );
      if (!ref.ok) throw new Error("Invalid ticker symbol");
      const refData = await ref.json();

      const newEntry = await fetchAssetData(symbol, refData.results.name);
      setAssets((prev) => [...prev, newEntry]);
      setNewAsset("");
    } catch {
      setError("Invalid or unknown stock symbol.");
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────── Fetch Stock Data ─────────────── */
  const fetchAssetData = async (
    symbol: string,
    name: string,
    customFrom?: string,
    customTo?: string
  ) => {
    const now = new Date();
    const past = new Date();
    past.setDate(now.getDate() - chartRange);

    const from = customFrom || past.toISOString().split("T")[0];
    const to = customTo || now.toISOString().split("T")[0];

    const tradeRes = await fetch(
      `https://api.polygon.io/v2/last/trade/${symbol}?apiKey=${polygonKey}`
    );
    const tradeData = await tradeRes.json();

    const chartRes = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}?adjusted=true&sort=asc&apiKey=${polygonKey}`
    );
    const chartData = await chartRes.json();

    const chart = chartData.results
      ? chartData.results.map((d: any) => ({
          date: new Date(d.t).toLocaleDateString(),
          price: d.c,
        }))
      : [];

    const aiInsight = await generateAISummary(symbol, name);
    const aiNews = await fetchNewsSummary(symbol);
    const aiRating = await getAIRating(symbol, name);

    return {
      symbol,
      name,
      price: tradeData?.results?.p || "N/A",
      chart,
      aiInsight,
      aiNews,
      aiRating,
    };
  };

  /* ─────────────── AI Helpers ─────────────── */
  const generateAISummary = async (symbol: string, name: string) => {
    if (!openAiKey) return "AI summary unavailable.";
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a stock analyst providing concise factual market insights.",
            },
            {
              role: "user",
              content: `Summarize ${name} (${symbol})'s ${chartRange}-day market trend, performance, and risks.`,
            },
          ],
          max_tokens: 120,
        }),
      });
      const data = await res.json();
      return data.choices?.[0]?.message?.content || "No insight.";
    } catch {
      return "Error fetching AI summary.";
    }
  };

  const getAIRating = async (symbol: string, name: string) => {
    if (!openAiKey) return "N/A";
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You rate stocks from Strong Buy, Buy, Hold, Sell, Strong Sell.",
            },
            {
              role: "user",
              content: `Based on ${name} (${symbol})'s ${chartRange}-day performance and sentiment, rate it from Strong Buy → Strong Sell.`,
            },
          ],
          max_tokens: 20,
        }),
      });
      const data = await res.json();
      return data.choices?.[0]?.message?.content || "Hold";
    } catch {
      return "Hold";
    }
  };

  const fetchNewsSummary = async (symbol: string) => {
    try {
      const res = await fetch(
        `https://api.polygon.io/v2/reference/news?ticker=${symbol}&limit=5&apiKey=${polygonKey}`
      );
      const data = await res.json();
      if (!data.results || !openAiKey) return "No recent news.";
      const headlines = data.results.map((n: any) => n.title).join("; ");
      const ai = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `Summarize these news headlines for ${symbol}: ${headlines}`,
            },
          ],
          max_tokens: 100,
        }),
      });
      const json = await ai.json();
      return json.choices?.[0]?.message?.content || "No summary available.";
    } catch {
      return "Unable to fetch news.";
    }
  };

  /* ─────────────── Compare Two Stocks ─────────────── */
  const compareStocks = async () => {
    if (comparePair.length !== 2 || !openAiKey) return;
    const [s1, s2] = comparePair;
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Compare ${s1} and ${s2} regarding volatility, trend, investor sentiment, and recommend which is better (Strong Buy→Strong Sell).`,
          },
        ],
        max_tokens: 150,
      }),
    });
    const data = await res.json();
    setCompareResult(data.choices?.[0]?.message?.content || "No comparison result.");
  };

  /* ─────────────── Actions ─────────────── */
  const removeAsset = (symbol: string) => {
    setAssets((prev) => prev.filter((a) => a.symbol !== symbol));
  };

  const refreshAll = async () => {
    setRefreshing(true);
    try {
      const updated = await Promise.all(
        assets.map(async (a) => await fetchAssetData(a.symbol, a.name))
      );
      setAssets(updated);
    } catch {
      setError("Error refreshing data.");
    } finally {
      setRefreshing(false);
    }
  };

  /* ─────────────── Render ─────────────── */
  return (
    <main
      className={`min-h-screen px-8 py-20 transition-colors duration-500 ${
        theme === "dark"
          ? "bg-gradient-to-b from-black via-gray-950 to-black text-white"
          : "bg-gradient-to-b from-[#f5f7fa] via-[#c3e0dc] to-[#9ad0c2] text-gray-900"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          My Assets Dashboard (AI-Enhanced)
        </h1>

        {/* Add + Controls */}
        <div className="flex flex-wrap gap-3 mb-8 items-center">
          <input
            type="text"
            placeholder="Enter stock symbol (e.g. AAPL)"
            value={newAsset}
            onChange={(e) => setNewAsset(e.target.value)}
            className={`px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-white border-gray-300 text-black"
            }`}
          />
          <button
            onClick={addAsset}
            disabled={loading}
            className={`px-4 py-2 rounded-lg disabled:opacity-50 transition-all ${
              theme === "dark"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-400 hover:bg-blue-500 text-white"
            }`}
          >
            {loading ? "Adding..." : "Add"}
          </button>
          <button
            onClick={refreshAll}
            disabled={refreshing || assets.length === 0}
            className={`px-4 py-2 rounded-lg disabled:opacity-50 transition-all ${
              theme === "dark"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-green-400 hover:bg-green-500 text-white"
            }`}
          >
            {refreshing ? "Refreshing..." : "Refresh All"}
          </button>
        </div>

        {error && (
          <p className="text-red-500 mb-4 transition-colors">{error}</p>
        )}

        {/* Watchlist */}
        {assets.length === 0 ? (
          <p className="text-gray-400">No assets added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((a) => (
              <div
                key={a.symbol}
                className={`p-5 rounded-xl border shadow-md flex flex-col transition-colors ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-[#eaf5f3] border-[#cde3dd]"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold">
                    {a.name} ({a.symbol})
                  </h2>
                  <div className="flex items-center gap-3">
                    <p className="text-green-500 font-medium">
                      ${a.price?.toFixed?.(2) || a.price}
                    </p>
                    <button
                      onClick={() => removeAsset(a.symbol)}
                      className="text-red-500 hover:text-red-700 text-lg"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Chart */}
                {a.chart?.length > 0 && (
                  <div className="h-40 w-full my-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={a.chart}>
                        <XAxis
                          dataKey="date"
                          tick={{
                            fill: theme === "dark" ? "#ccc" : "#333",
                            fontSize: 10,
                          }}
                        />
                        {(() => {
                          const prices = a.chart.map((d: any) => d.price);
                          const minPrice = Math.min(...prices);
                          const maxPrice = Math.max(...prices);
                          return (
                            <YAxis
                              domain={[minPrice * 0.98, maxPrice * 1.02]}
                              tick={{
                                fill: theme === "dark" ? "#ccc" : "#333",
                              }}
                            />
                          );
                        })()}
                        <Tooltip
                          contentStyle={{
                            backgroundColor:
                              theme === "dark" ? "#1f1f1f" : "#eaf5f3",
                            border: "none",
                            color: theme === "dark" ? "#fff" : "#000",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke={theme === "dark" ? "#3b82f6" : "#2563eb"}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* AI Info */}
                <p className="text-sm mb-2">{a.aiInsight}</p>
                <p className="text-xs mb-1 italic">
                  Recommendation: {a.aiRating}
                </p>
                <p className="text-sm mb-2">
                  <strong>AI News Summary:</strong> {a.aiNews}
                </p>

                {/* Comparison selector */}
                <label className="flex items-center gap-2 text-sm mt-auto">
                  <input
                    type="checkbox"
                    checked={comparePair.includes(a.symbol)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        if (comparePair.length < 2)
                          setComparePair([...comparePair, a.symbol]);
                      } else {
                        setComparePair(
                          comparePair.filter((s) => s !== a.symbol)
                        );
                      }
                    }}
                  />
                  Select for comparison
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Comparison */}
        {comparePair.length === 2 && (
          <div
            className={`mt-10 p-5 rounded-xl border transition-colors ${
              theme === "dark"
                ? "bg-gray-900 border-gray-700"
                : "bg-[#eaf5f3] border-[#cde3dd]"
            }`}
          >
            <h3 className="text-2xl font-semibold mb-3">
              AI Stock Comparison
            </h3>
            <p className="mb-4">
              Comparing: {comparePair[0]} vs {comparePair[1]}
            </p>
            <button
              onClick={compareStocks}
              className={`px-4 py-2 rounded-lg transition-all ${
                theme === "dark"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-400 hover:bg-blue-500 text-white"
              }`}
            >
              Run Comparison
            </button>
            {compareResult && (
              <p className="mt-4 whitespace-pre-line">{compareResult}</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
