import { getMoviesById } from "@/apis/movie.api";
import MovieDetail from "./components/MovieDetail";

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) return null;

  const movieId = Number(id);
  if (Number.isNaN(movieId)) return null;

  const data = await getMoviesById(movieId);
  const movie = data?.result;
  if (!movie) return null;

  return <MovieDetail movie={movie} />;
}
