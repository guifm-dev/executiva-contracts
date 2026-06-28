"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import ContractForm from "@/components/contract-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditContractPage() {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.contracts.get(id).then((c) => {
      setContract(c);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-xl space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (contract.status !== "DRAFT") {
    return (
      <p className="text-slate-500 text-sm">
        Apenas contratos em rascunho podem ser editados.
      </p>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Editar Contrato</h2>
        <p className="text-slate-500 mt-1 text-sm">
          Somente campos de contratos em rascunho podem ser alterados.
        </p>
      </div>

      <ContractForm
        contractId={id}
        initialValues={contract.fieldValues?.map((f: any) => ({
          name: f.fieldName,
          value: f.value,
          type: f.fieldType,
          required: f.required,
        }))}
      />
    </div>
  );
}
