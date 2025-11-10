import { getMoviesById } from "@/apis/movie.api";
import MovieDetail from "./components/MovieDetail";

export default async function MovieDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = (await params) as { id: string };
  if (!id) return null;

  const movieId = Number(id);
  if (Number.isNaN(movieId)) return null;

  const data = await getMoviesById(movieId);
  const movie = data?.result;
  if (!movie) return null;

  return <MovieDetail movie={movie} />;
}
