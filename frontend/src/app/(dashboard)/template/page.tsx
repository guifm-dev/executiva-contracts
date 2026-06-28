"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Trash2, Plus, Save, ChevronUp, ChevronDown } from "lucide-react";

type FieldType = "TEXT" | "NUMBER" | "DATE" | "BOOLEAN";

interface Field {
  name: string;
  type: FieldType;
  required: boolean;
}

const TYPE_LABELS: Record<FieldType, string> = {
  TEXT: "Texto",
  NUMBER: "Número",
  DATE: "Data",
  BOOLEAN: "Sim/Não",
};

const TYPE_COLORS: Record<FieldType, string> = {
  TEXT: "bg-slate-50 text-slate-700",
  NUMBER: "bg-slate-50 text-slate-700",
  DATE: "bg-slate-50 text-slate-700",
  BOOLEAN: "bg-slate-50 text-slate-700",
};

export default function TemplatePage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.template.get().then((t) => {
      setFields(t.fields ?? []);
      setLoading(false);
    });
  }, []);

  function addField() {
    setFields((prev) => [...prev, { name: "", type: "TEXT", required: false }]);
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }

  function updateField(index: number, patch: Partial<Field>) {
    setFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    );
  }

  function moveField(index: number, direction: "up" | "down") {
    setFields((prev) => {
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function save() {
    setSaving(true);
    try {
      await api.template.updateFields(
        fields.map((f, i) => ({ ...f, order: i })),
      );

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Template de Contrato
          </h2>
          <p className="text-slate-500 mt-1 text-sm">
            Defina os campos que vão compor os contratos do seu escritório.
            Alterações não afetam contratos já criados.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {fields.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
            <p className="text-slate-400 text-sm">
              Nenhum campo configurado ainda.
            </p>
            <p className="text-slate-400 text-sm">
              Clique em "Adicionar campo" para começar.
            </p>
          </div>
        )}

        {fields.map((field, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg group"
          >
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => moveField(index, "up")}
                disabled={index === 0}
                className="text-slate-300 hover:text-slate-500 disabled:opacity-20 transition-colors"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={() => moveField(index, "down")}
                disabled={index === fields.length - 1}
                className="text-slate-300 hover:text-slate-500 disabled:opacity-20 transition-colors"
              >
                <ChevronDown size={14} />
              </button>
            </div>

            <Input
              placeholder="Nome do campo"
              value={field.name}
              onChange={(e) => updateField(index, { name: e.target.value })}
              className="flex-1 border-0 bg-transparent p-0 text-sm font-medium focus-visible:ring-0 placeholder:text-slate-300"
            />

            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[field.type]}`}
            >
              {TYPE_LABELS[field.type]}
            </span>

            <Select
              value={field.type}
              onValueChange={(v) =>
                updateField(index, { type: v as FieldType })
              }
            >
              <SelectTrigger className="w-32 h-8 text-xs border-slate-200">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value} className="text-xs">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button
              onClick={() => updateField(index, { required: !field.required })}
              className={`text-xs px-2 py-1 rounded border transition-colors ${
                field.required
                  ? "border-red-200 bg-red-50 text-red-600"
                  : "border-slate-200 text-slate-400 hover:border-slate-300"
              }`}
            >
              {field.required ? "Obrigatório" : "Opcional"}
            </button>

            <button
              onClick={() => removeField(index)}
              className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button variant="outline" onClick={addField} className="gap-2">
          <Plus size={15} />
          Adicionar campo
        </Button>

        <Button onClick={save} disabled={saving} className="gap-2">
          <Save size={15} />
          Salvar template
        </Button>

        {saved && (
          <span className="text-sm text-green-600 font-medium">
            Template salvo!
          </span>
        )}
      </div>
    </div>
  );
}
