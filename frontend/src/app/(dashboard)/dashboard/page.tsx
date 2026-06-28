"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, CheckCircle, Clock, XCircle } from "lucide-react";

interface ContractSummary {
  total: number;
  active: number;
  draft: number;
  closed: number;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<ContractSummary>({
    total: 0,
    active: 0,
    draft: 0,
    closed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [all, active, draft, closed] = await Promise.all([
          api.contracts.list(),
          api.contracts.list({ status: "ACTIVE" }),
          api.contracts.list({ status: "DRAFT" }),
          api.contracts.list({ status: "CLOSED" }),
        ]);
        setSummary({
          total: all.total,
          active: active.total,
          draft: draft.total,
          closed: closed.total,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cards = [
    {
      label: "Total de Contratos",
      value: summary.total,
      icon: FileText,
      color: "text-slate-600",
      bg: "bg-slate-100",
    },
    {
      label: "Ativos",
      value: summary.active,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Rascunhos",
      value: summary.draft,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Encerrados",
      value: summary.closed,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-500 mt-1">
          Visão geral dos contratos do tenant
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-8" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-14" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  {label}
                </CardTitle>
                <div className={`p-2 rounded-md ${bg}`}>
                  <Icon size={16} className={color} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
