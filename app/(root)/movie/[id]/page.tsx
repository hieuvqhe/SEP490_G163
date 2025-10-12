import { getMoviesById } from "@/apis/movie.api";
import MovieCard from "@/components/homepage/MovieCard";
import { Movie } from "@/types/movie.type";
import { useQuery } from "@tanstack/react-query";

async function page({ params }: { params: { id: number } }) {
  if (!params.id) return null;

  const movie = await getMoviesById(params.id);

  return (
    <div>
      <MovieCard movie={movie} />
    </div>
  );
}

export default page;
