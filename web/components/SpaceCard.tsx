import Link from 'next/link';

export default function SpaceCard({ space }: { space: any }) {
  return (
    <Link
      href={`/espacios/${space.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-stone-100">
        {space.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={space.imageUrl}
            alt={space.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-400">
            <span className="text-sm">Sin imagen</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-stone-900">{space.name}</h3>
          <span className="whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            {space.type}
          </span>
        </div>
        <p className="text-sm text-stone-500">{space.location}</p>
        {space.description && (
          <p className="mt-1 line-clamp-2 text-sm text-stone-600">
            {space.description}
          </p>
        )}
        <div className="mt-2 text-sm text-stone-500">
          Capacidad: {space.capacity} personas
        </div>
      </div>
    </Link>
  );
}
