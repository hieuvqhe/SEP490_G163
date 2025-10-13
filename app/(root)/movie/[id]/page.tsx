import { getMoviesById } from "@/apis/movie.api";

async function page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return null;
  const movieId = Number(id);
  if (Number.isNaN(movieId)) return null;

  const data = await getMoviesById(movieId);
  const movie = data?.result;
  if (!movie) return null;

  return (
    <div className="container mx-auto px-4 py-6 mt-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <img
            src={movie.posterUrl || "/logo.png"}
            alt={movie.title}
            className="w-full rounded-xl object-cover"
          />
        </div>
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-2xl md:text-3xl font-semibold text-white">{movie.title}</h1>
          <p className="text-sm text-gray-300">
            {movie.genre} • {movie.durationMinutes} phút • {new Date(movie.premiereDate).toLocaleDateString()} - {new Date(movie.endDate).toLocaleDateString()}
          </p>
          <div className="text-gray-300 space-y-1 text-sm">
            <p><span className="text-gray-400">Đạo diễn:</span> {movie.director}</p>
            <p><span className="text-gray-400">Ngôn ngữ:</span> {movie.language}</p>
            <p><span className="text-gray-400">Quốc gia:</span> {movie.country}</p>
            {typeof movie.averageRating === "number" && (
              <p><span className="text-gray-400">Đánh giá trung bình:</span> {movie.averageRating} ({movie.ratingsCount})</p>
            )}
          </div>

          <div>
            <h2 className="text-lg font-medium text-white mb-2">Mô tả</h2>
            <p className="text-gray-300 leading-relaxed">{movie.description}</p>
          </div>

          {Array.isArray(movie.actor) && movie.actor.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-white mb-3">Diễn viên</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {movie.actor.map((a: { id: number; name: string; profileImage?: string }) => (
                  <div key={a.id} className="flex items-center gap-3 bg-zinc-800/60 rounded-lg p-3">
                    <img
                      src={a.profileImage || "/logo.png"}
                      alt={a.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="text-sm text-gray-200">{a.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {movie.trailerUrl && (
            <div>
              <a
                href={movie.trailerUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block px-4 py-2 rounded-full bg-primary hover:bg-primary-dull text-white text-sm"
              >
                Xem trailer
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default page;
