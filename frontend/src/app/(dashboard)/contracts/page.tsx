"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
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
import Link from "next/link";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth.context";

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

export default function ContractsPage() {
  const [data, setData] = useState<any>({ data: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  const { role } = useAuth();

  const router = useRouter();

  async function load(params: Record<string, string> = {}) {
    setLoading(true);

    try {
      const result = await api.contracts.list({
        page: String(page),
        limit: "8",
        ...(search && { search }),
        ...(status && { status }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...params,
      });
      setData(result);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [page]);

  function handleSearch() {
    setPage(1);
    load({ page: "1" });
  }

  async function clearFilters() {
    setSearch("");
    setStatus("");
    setStartDate("");
    setEndDate("");
    setPage(1);

    setLoading(true);
    try {
      const result = await api.contracts.list({ page: "1", limit: "8" });
      setData(result);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Contratos</h2>
          <p className="text-slate-500 mt-1 text-sm">
            {data.total} contrato(s) encontrado(s)
          </p>
        </div>
        {role === "ADMIN" && (
          <Button size="sm" onClick={() => router.push("/contracts/new")}>
            <Plus size={14} className="mr-1.5" />
            Novo Contrato
          </Button>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            placeholder="Buscar por valor do campo"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9 text-sm"
          />
        </div>

        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
            load({ status: v, page: "1" });
          }}
        >
          <SelectTrigger className="w-40 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Rascunho</SelectItem>
            <SelectItem value="ACTIVE">Ativo</SelectItem>
            <SelectItem value="CLOSED">Encerrado</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40 text-sm"
            placeholder="Data início"
          />

          <span className="text-slate-400 text-sm">até</span>

          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40 text-sm"
            placeholder="Data fim"
          />
        </div>

        <Button variant="outline" size="sm" onClick={handleSearch}>
          Buscar
        </Button>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Limpar
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                ID
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                Campos
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                Criado em
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={index} className="border-b border-slate-100">
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-64 max-w-full" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="ml-auto h-4 w-8" />
                  </td>
                </tr>
              ))
            )}
            {!loading && data.data.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  Nenhum contrato encontrado.
                </td>
              </tr>
            )}
            {!loading &&
              data.data.map((contract: any) => (
                <tr
                  key={contract.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">
                    {contract.id.slice(0, 8)}...
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[contract.status]}`}
                    >
                      {STATUS_LABELS[contract.status]}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    {contract.fieldValues?.slice(0, 2).map((f: any) => (
                      <span key={f.id} className="mr-2">
                        <span className="text-slate-400">{f.fieldName}:</span>{" "}
                        {f.value ?? "-"}
                      </span>
                    ))}
                  </td>

                  <td className="px-4 py-3 text-slate-400">
                    {new Date(contract.createdAt).toLocaleDateString("pt-BR")}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/contracts/${contract.id}`}
                      className="text-xs text-slate-600 hover:text-slate-900 underline underline-offset-2"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            Página {page} de {data.totalPages}
          </span>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={14} />
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={page === data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
