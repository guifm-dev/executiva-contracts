"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TemplateField {
  id: string;
  name: string;
  type: string;
  required: boolean;
}

interface FieldValue {
  name: string;
  value: string;
  type?: string;
  required?: boolean;
}

interface Props {
  contractId?: string;
  initialValues?: FieldValue[];
  onSuccess?: () => void;
}

const INPUT_TYPE: Record<string, string> = {
  TEXT: "text",
  NUMBER: "number",
  DATE: "date",
  BOOLEAN: "checkbox",
};

const INPUT_LABEL: Record<string, string> = {
  TEXT: "Texto",
  NUMBER: "Número",
  DATE: "Data",
  BOOLEAN: "Sim/Não",
};

export default function ContractForm({
  contractId,
  initialValues,
  onSuccess,
}: Props) {
  const router = useRouter();
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (contractId && initialValues && initialValues.length > 0) {
      setFields(
        initialValues.map((v) => ({
          id: v.name,
          name: v.name,
          type: v.type ?? "TEXT",
          required: v.required ?? false,
        })),
      );

      const map: Record<string, string> = {};
      for (const v of initialValues) {
        map[v.name] = v.value ?? "";
      }

      setValues(map);
      setLoading(false);
    } else {
      api.template.get().then((t) => {
        setFields(t.fields ?? []);
        setLoading(false);
      });
    }
  }, []);

  function setValue(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = fields.map((f) => ({
      name: f.name,
      value: values[f.name] ?? null,
    }));

    try {
      if (contractId) {
        await api.contracts.updateFields(contractId, payload);
      } else {
        const createdContract = await api.contracts.create(payload);
        contractId = createdContract.id;
      }

      onSuccess ? onSuccess() : router.push(`/contracts/${contractId}`);
    } catch (err: any) {
      setError(err.message ?? "Erro ao salvar contrato");
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return <p className="text-slate-500 text-sm">Carregando campos</p>;

  if (fields.length === 0) {
    return (
      <p className="text-slate-400 text-sm">
        Nenhum campo configurado no template.{" "}
        <a href="/template" className="underline text-slate-600">
          Configurar Template
        </a>
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.id} className="space-y-1.5">
          <Label htmlFor={field.name} className="text-sm">
            {field.name}
            {field.required && <span className="text-red-500 ml-1">*</span>}
            <span className="text-xs text-slate-400 ml-2 font-normal">
              {INPUT_LABEL[field.type]}
            </span>
          </Label>

          {field.type === "BOOLEAN" ? (
            <div className="flex items-center gap-2">
              <input
                id={field.name}
                type="checkbox"
                checked={values[field.name] === "true"}
                onChange={(e) =>
                  setValue(field.name, e.target.checked ? "true" : "false")
                }
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-600">
                {values[field.name] === "true" ? "Sim" : "Não"}
              </span>
            </div>
          ) : (
            <Input
              id={field.name}
              type={INPUT_TYPE[field.type] ?? "text"}
              value={values[field.name] ?? ""}
              onChange={(e) => setValue(field.name, e.target.value)}
              required={field.required}
              className="text-sm"
            />
          )}
        </div>
      ))}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving}>
          {contractId ? "Salvar alterações" : "Criar contrato"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            router.push(contractId ? `/contracts/${contractId}` : "/contracts")
          }
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
