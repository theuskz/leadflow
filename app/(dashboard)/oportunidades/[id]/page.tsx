import { DetalhesOportunidade } from "@/components/oportunidades/detalhes-oportunidade";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function Page({
    params,
}: Props) {
    const { id } = await params;

    return (
        <DetalhesOportunidade
            oportunidadeId={id}
        />
    );
}