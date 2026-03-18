type Props = { params: Promise<{ slug: string }> };

export default async function MemorialSlugPage({ params }: Props) {
  const { slug } = await params;
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Memoriale</h1>
      <p className="mt-2 text-slate-600">
        Pagina singolo memoriale — slug: <strong>{slug}</strong>. Placeholder. UI con v0.
      </p>
    </div>
  );
}
