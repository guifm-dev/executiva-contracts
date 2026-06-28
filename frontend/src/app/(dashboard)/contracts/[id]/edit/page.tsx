"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import ContractForm from "@/components/contract-form";

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

  if (loading) return <p className="text-slate-500">Carregando</p>;

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
