import { create } from "zustand";

export interface Recipe {
  name: string;
  ingredients: string[];
  emoji: string;
}

export const RECIPES: Recipe[] = [
  { name: "Espresso", ingredients: ["espresso"], emoji: "\u2615" },
  { name: "Latte", ingredients: ["espresso", "milk"], emoji: "\ud83e\udd5b" },
  { name: "Cappuccino", ingredients: ["espresso", "milk", "foam"], emoji: "\u2615" },
  { name: "Mocha", ingredients: ["espresso", "chocolate", "milk"], emoji: "\ud83c\udf6b" },
  { name: "Americano", ingredients: ["espresso", "water"], emoji: "\ud83d\udca7" },
  { name: "Iced Latte", ingredients: ["espresso", "milk", "ice"], emoji: "\ud83e\uddca" },
];

export const INGREDIENTS = [
  { name: "espresso", emoji: "\u2615", color: "#6b4226" },
  { name: "milk", emoji: "\ud83e\udd5b", color: "#f5f5dc" },
  { name: "foam", emoji: "\u2601\ufe0f", color: "#fffaf0" },
  { name: "chocolate", emoji: "\ud83c\udf6b", color: "#7b3f00" },
  { name: "water", emoji: "\ud83d\udca7", color: "#4fc3f7" },
  { name: "ice", emoji: "\ud83e\uddca", color: "#b3e5fc" },
];

interface Order {
  id: number;
  recipe: Recipe;
  createdAt: number; // timestamp
}

interface OneMinuteBaristaState {
  orders: Order[];
  currentCup: string[];
  timer: number; // seconds remaining
  score: number;
  ordersCompleted: number;
  ordersFailed: number;
  nextOrderId: number;
  addIngredient: (ingredient: string) => void;
  clearCup: () => void;
  serveDrink: () => { success: boolean; points: number };
  generateOrder: () => void;
  tickTimer: () => void;
  reset: () => void;
}

function getRandomRecipe(): Recipe {
  return RECIPES[Math.floor(Math.random() * RECIPES.length)];
}

export const useOneMinuteBaristaStore = create<OneMinuteBaristaState>(
  (set, get) => ({
    orders: [],
    currentCup: [],
    timer: 60,
    score: 0,
    ordersCompleted: 0,
    ordersFailed: 0,
    nextOrderId: 1,

    addIngredient: (ingredient: string) => {
      set((state) => ({
        currentCup: [...state.currentCup, ingredient],
      }));
    },

    clearCup: () => {
      set({ currentCup: [] });
    },

    serveDrink: () => {
      const state = get();
      const cup = [...state.currentCup].sort();

      // Check if the current cup matches any visible order
      for (let i = 0; i < state.orders.length; i++) {
        const order = state.orders[i];
        const recipe = [...order.recipe.ingredients].sort();

        if (
          cup.length === recipe.length &&
          cup.every((ing, idx) => ing === recipe[idx])
        ) {
          // Match found
          const now = Date.now();
          const elapsed = (now - order.createdAt) / 1000;
          const speedBonus = elapsed < 5 ? 5 : 0;
          const points = 10 + speedBonus;

          const newOrders = state.orders.filter((o) => o.id !== order.id);

          set({
            orders: newOrders,
            currentCup: [],
            score: state.score + points,
            ordersCompleted: state.ordersCompleted + 1,
          });

          return { success: true, points };
        }
      }

      // No match — wrong drink
      set({
        currentCup: [],
        score: Math.max(0, state.score - 5),
        ordersFailed: state.ordersFailed + 1,
      });

      return { success: false, points: -5 };
    },

    generateOrder: () => {
      const state = get();
      if (state.orders.length >= 3) return;

      const newOrder: Order = {
        id: state.nextOrderId,
        recipe: getRandomRecipe(),
        createdAt: Date.now(),
      };

      set({
        orders: [...state.orders, newOrder],
        nextOrderId: state.nextOrderId + 1,
      });
    },

    tickTimer: () => {
      set((state) => ({
        timer: Math.max(0, state.timer - 1),
      }));
    },

    reset: () =>
      set({
        orders: [],
        currentCup: [],
        timer: 60,
        score: 0,
        ordersCompleted: 0,
        ordersFailed: 0,
        nextOrderId: 1,
      }),
  })
);
