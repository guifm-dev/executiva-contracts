"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho",
  ACTIVE: "Ativo",
  CLOSED: "Encerrado",
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-yellow-50 text-yellow-700 border-yellow-200",
  ACTIVE: "bg-green-50 text-green-700 border-green-200",
  CLOSED: "bg-slate-100 text-slate-500 border-slate-200",
};

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  async function load() {
    const [c, h] = await Promise.all([
      api.contracts.get(id),
      api.contracts.history(id),
    ]);
    setContract(c);
    setHistory(h);
    setNewStatus(c.status);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function updateStatus() {
    if (newStatus === contract.status) return;
    setUpdating(true);

    try {
      await api.contracts.updateStatus(id, newStatus);
      await load();
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <p className="text-slate-500">Carregando contrato</p>;

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/contracts"
          className="text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">Contrato</h2>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[contract.status]}`}
            >
              {STATUS_LABELS[contract.status]}
            </span>
          </div>

          <p className="text-xs text-slate-400 font-mono mt-0.5">
            {contract.id}
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">
            Campos do contrato
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {contract.fieldValues.map((field: any) => (
            <div
              key={field.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="text-sm text-slate-500">{field.fieldName}</span>
              <span className="text-sm font-medium text-slate-900">
                {field.value ?? (
                  <span className="text-slate-300 font-normal">-</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Alterar status</h3>
        <div className="flex items-center gap-3">
          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger className="w-44 text-sm">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="DRAFT">Rascunho</SelectItem>
              <SelectItem value="ACTIVE">Ativo</SelectItem>
              <SelectItem value="CLOSED">Encerrado</SelectItem>
            </SelectContent>
          </Select>

          <Button
            size="sm"
            disabled={updating || newStatus === contract.status}
            onClick={updateStatus}
          >
            Confirmar
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock size={15} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700">
            Histórico de alterações
          </h3>
        </div>

        {history.length === 0 && (
          <p className="text-sm text-slate-400">
            Nenhuma alteração registrada.
          </p>
        )}

        <div className="space-y-2">
          {history.map((entry: any) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700">
                  Campo <span className="font-medium">"{entry.field}"</span>{" "}
                  alterado de{" "}
                  <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">
                    {entry.oldValue ?? "vazio"}
                  </span>{" "}
                  para{" "}
                  <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">
                    {entry.newValue}
                  </span>
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400">
                    {entry.user?.name ?? "Sistema"}
                  </span>

                  <span className="text-slate-300">|</span>
                  <span className="text-xs text-slate-400">
                    {new Date(entry.changedAt).toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
