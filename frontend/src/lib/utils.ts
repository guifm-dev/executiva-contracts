import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFieldValue(field: { value: any; fieldType: string }) {
  if (!field) return null;

  let formattedValue = field.value;

  if (field.fieldType === "BOOLEAN") {
    formattedValue = field.value ? "Sim" : "Não";
  }

  if (field.fieldType === "DATE") {
    formattedValue = new Date(field.value).toLocaleDateString("pt-BR");
  }

  return formattedValue;
}
