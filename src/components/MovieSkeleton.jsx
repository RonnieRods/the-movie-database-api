const MovieSkeleton = () => (
    <div className="bg-slate-800 rounded-xl overflow-hidden shadow-xl animate-pulse">
        <div className="aspect-[2/3] bg-slate-700" />
        <div className="p-4 space-y-2">
            <div className="h-4 bg-slate-700 rounded w-3/4" />
            <div className="h-3 bg-slate-700 rounded w-1/2" />
        </div>
    </div>
);

export default MovieSkeleton