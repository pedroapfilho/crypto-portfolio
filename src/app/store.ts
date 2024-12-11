import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type Asset = {
  id: string;
  name: string;
  symbol: string;
  quantity: string;
};

type Portfolio = {
  assets: Asset[];
  addAsset: (asset: Asset) => void;
  editAsset: (asset: Asset) => void;
  removeAsset: (asset: Asset) => void;
  reorderAssets: (fromIndex: number, toIndex: number) => void;
};

const usePortfolioStore = create<Portfolio>()(
  devtools(
    persist(
      (set) => ({
        assets: [],
        addAsset: (asset) =>
          set((state) => {
            if (state.assets.some((a) => a.id === asset.id)) {
              return state;
            }
            return {
              assets: [...state.assets, asset],
            };
          }),
        editAsset: (asset) =>
          set((state) => ({
            assets: state.assets.map((a) => (a.id === asset.id ? asset : a)),
          })),
        removeAsset: (asset) =>
          set((state) => ({
            assets: state.assets.filter((a) => a.id !== asset.id),
          })),
        reorderAssets: (fromIndex, toIndex) =>
          set((state) => {
            const updatedAssets = [...state.assets];
            const [movedAsset] = updatedAssets.splice(fromIndex, 1);
            updatedAssets.splice(toIndex, 0, movedAsset);
            return { assets: updatedAssets };
          }),
      }),
      {
        name: "portfolio-storage",
      }
    )
  )
);

export type { Asset };

export { usePortfolioStore };
