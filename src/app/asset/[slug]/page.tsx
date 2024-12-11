"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CoinData } from "@/types";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

const Page = () => {
  const params = useParams<{ slug: string }>();
  const history = useQuery({
    queryKey: ["history-data", params.slug],
    queryFn: async () => {
      const url = new URL(
        `https://api.coingecko.com/api/v3/coins/${params.slug}/market_chart/range`
      );
      url.searchParams.set("vs_currency", "usd");
      url.searchParams.set(
        "from",
        (Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 30 * 12).toString()
      );
      url.searchParams.set("to", Math.floor(Date.now() / 1000).toString());

      const res = await fetch(url.toString());
      const data = (await res.json()) as {
        prices: [number, number][];
        market_caps: [number, number][];
        total_volumes: [number, number][];
      };

      return data;
    },
  });

  const coinInfo = useQuery({
    queryKey: ["coin-info", params.slug],
    queryFn: async () => {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${params.slug}`
      );
      const data = (await res.json()) as CoinData;
      return data;
    },
  });

  const chartData =
    history.data?.prices.map(([timestamp, price]) => ({
      date: new Date(timestamp).toLocaleDateString(),
      price,
    })) || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 8,
    }).format(value);
  };

  if (history.isLoading || coinInfo.isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <header className="p-4 flex flex-col gap-2">
        <div>
          <Link href="/">
            <button>
              <ChevronLeft size={24} />
            </button>
          </Link>
        </div>

        <h1 className="text-2xl font-bold ">
          {coinInfo.data?.name} ({coinInfo.data?.symbol.toUpperCase()})
        </h1>
        <p className="">{coinInfo.data?.description?.en}</p>
        <a
          href={coinInfo.data?.links?.homepage[0]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline block"
        >
          {coinInfo.data?.links?.homepage[0]}
        </a>
        <p className="text-lg font-semibold">
          Current Price:{" "}
          {formatCurrency(coinInfo.data?.market_data?.current_price?.usd || 0)}
        </p>
      </header>

      <main className="p-4">
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <LineChart width={600} height={300} data={chartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(value as number)}
                />
              }
            />
            <CartesianGrid stroke="#f5f5f5" />
            <Line type="monotone" dataKey="price" stroke="#8884d8" />
          </LineChart>
        </ChartContainer>
      </main>
    </>
  );
};

export default Page;
