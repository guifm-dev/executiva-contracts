import ContractForm from "@/components/contract-form";

export default function NewContractPage() {
    return (
        <div className="max-w-xl space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Novo Contrato</h2>
                <p className="text-slate-500 mt-1 text-sm">Preencha os campos definidos no template</p>
            </div>
            <ContractForm />
        </div>
    )
}
