"use client";

import { Asset, usePortfolioStore } from "./store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { CircleX, Edit } from "lucide-react";
import Link from "next/link";

const newFormSchema = z.object({
  id: z.string().min(1, { message: "ID is required." }),
  name: z.string().min(1, { message: "Name is required." }),
  symbol: z.string().min(1, { message: "Symbol is required." }),
  quantity: z.coerce
    .string()
    .min(1, { message: "Quantity must be a valid number." }),
});

const editFormSchema = z.object({
  quantity: z.coerce
    .string()
    .min(1, { message: "Quantity must be a valid number." }),
});

const BASE_CURRENCY = "usd";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: BASE_CURRENCY,
    maximumFractionDigits: 8,
  }).format(value);
};

const Page = () => {
  const coins = useQuery({
    queryKey: ["coins"],
    queryFn: async () => {
      const url = new URL("https://api.coingecko.com/api/v3/coins/list");

      const res = await fetch(url, {
        headers: {
          "x-cg-demo-api-key": process.env.NEXT_PUBLIC_COINGECKO_API_KEY!,
        },
      });

      const data = (await res.json()) as {
        id: string;
        name: string;
        symbol: string;
      }[];

      return data;
    },
    refetchInterval: 5000,
  });

  const { assets, addAsset, editAsset, removeAsset } = usePortfolioStore(
    useShallow((state) => ({
      assets: state.assets,
      addAsset: state.addAsset,
      editAsset: state.editAsset,
      removeAsset: state.removeAsset,
    }))
  );

  const prices = useQuery({
    queryKey: ["prices", assets.map((asset) => asset.id)],
    queryFn: async () => {
      const url = new URL("https://api.coingecko.com/api/v3/simple/price");

      url.searchParams.set("ids", assets.map((asset) => asset.id).join(","));
      url.searchParams.set("vs_currencies", BASE_CURRENCY);

      const res = await fetch(url, {
        headers: {
          "x-cg-demo-api-key": process.env.NEXT_PUBLIC_COINGECKO_API_KEY!,
        },
      });

      const data = (await res.json()) as Record<
        string,
        {
          [BASE_CURRENCY]: number;
        }
      >;

      return data;
    },
  });

  const [isAddNewAssetDialogOpen, setIsAddNewAssetDialogOpen] = useState(false);
  const [editQuantityDialogOpen, setEditQuantityDialogOpen] = useState<{
    [key: string]: boolean;
  }>({});

  const newAssetForm = useForm<z.infer<typeof newFormSchema>>({
    resolver: zodResolver(newFormSchema),
    defaultValues: {
      id: "",
      name: "",
      symbol: "",
      quantity: "",
    },
  });

  const editAssetForm = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
  });

  const handleBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
    const id = event.target.value;

    if (!id) return;

    const coin = coins.data?.find((coin) => coin.id === id);
    if (coin) {
      newAssetForm.setValue("name", coin.name);
      newAssetForm.setValue("symbol", coin.symbol);
      newAssetForm.setValue("id", coin.id);
      newAssetForm.setFocus("quantity");
    }
  };

  const onSubmitNewAsset = (data: z.infer<typeof newFormSchema>) => {
    addAsset(data);

    newAssetForm.reset();

    setIsAddNewAssetDialogOpen(false);
  };

  const onSubmitEditAsset = (
    data: z.infer<typeof editFormSchema>,
    asset: Asset
  ) => {
    editAsset({ ...asset, quantity: data.quantity });

    editAssetForm.reset();

    setEditQuantityDialogOpen((prev) => ({
      ...prev,
      [asset.id]: false,
    }));
  };

  if (coins.isLoading || prices.isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <header className="flex justify-between items-center p-4">
        <div>
          <h1 className="font-extrabold text-lg">Crypto Portfolio</h1>
        </div>

        <Dialog
          open={isAddNewAssetDialogOpen}
          onOpenChange={setIsAddNewAssetDialogOpen}
        >
          <DialogTrigger asChild>
            <Button>+ Add New Holding</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Asset</DialogTitle>
              <DialogDescription>
                Fill in the details of the new asset.
              </DialogDescription>
            </DialogHeader>
            <Form {...newAssetForm}>
              <form
                onSubmit={newAssetForm.handleSubmit(onSubmitNewAsset)}
                className="space-y-8"
              >
                <FormField
                  control={newAssetForm.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          onBlur={handleBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newAssetForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newAssetForm.control}
                  name="symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symbol</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newAssetForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value?.toString() || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Add Asset</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </header>

      <main className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <Card key={asset.symbol}>
              <CardHeader className="flex flex-row gap-2 items-center justify-between">
                <Link
                  href={`/asset/${asset.id}`}
                  className="hover:text-neutral-600 transition-colors"
                >
                  <CardTitle>{asset.name}</CardTitle>
                </Link>

                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => removeAsset(asset)}>
                    <CircleX size={16} />
                  </button>

                  <Dialog
                    open={editQuantityDialogOpen[asset.id] || false}
                    onOpenChange={(isOpen) =>
                      setEditQuantityDialogOpen((prev) => ({
                        ...prev,
                        [asset.id]: isOpen,
                      }))
                    }
                  >
                    <DialogTrigger>
                      <Edit size={16} />
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Quantity</DialogTitle>
                        <DialogDescription>
                          Change the quantity of the selected asset.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...editAssetForm}>
                        <form
                          onSubmit={editAssetForm.handleSubmit((d) =>
                            onSubmitEditAsset(d, asset)
                          )}
                          className="space-y-8"
                        >
                          <FormField
                            control={editAssetForm.control}
                            name="quantity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    value={
                                      field.value?.toString() || asset.quantity
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <DialogFooter>
                            <Button type="submit">Save</Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Symbol</span>

                  <span className="font-semibold text-sm">
                    {asset.symbol.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Quantity</span>

                  <span className="font-semibold text-sm">
                    {asset.quantity}
                  </span>
                </div>
                {prices.data?.[asset.id] ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Price</span>

                    <span className="font-semibold text-sm">
                      {formatCurrency(prices.data[asset.id][BASE_CURRENCY])}
                    </span>
                  </div>
                ) : null}
                {prices.data?.[asset.id] ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Value</span>

                    <span className="font-semibold text-sm">
                      {formatCurrency(
                        prices.data[asset.id][BASE_CURRENCY] * +asset.quantity
                      )}
                    </span>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
};

export default Page;
