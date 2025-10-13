import { redirect } from "next/navigation";

export default function Page({ params }: { params: { id: string } }) {
  if (!params?.id) {
    redirect("/movie");
  }
  redirect(`/movie/${params.id}`);
}


