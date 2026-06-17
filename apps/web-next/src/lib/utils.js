import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}

export function formatINR(amount) {
  if (amount === null || amount === undefined) return "";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

const PRICE_UNIT_LABELS = {
  night: "/night",
  person_per_day: "/day/person",
};

export function priceUnitLabel(priceUnit) {
  return PRICE_UNIT_LABELS[priceUnit] || PRICE_UNIT_LABELS.night;
}

export const PRICE_UNIT_OPTIONS = [
  { value: "night", label: "Per night (per room)" },
  { value: "person_per_day", label: "Per day, per head" },
];
