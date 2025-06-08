import { fetchBlogs } from "@/actions/fetchBlogs";
import FeaturedPost from "./components/FeaturedPost";


export default async function Page() {




    // Fetching categories


    const initialBlogs = await fetchBlogs(1, 10);




    return (
        <div className="container mx-auto relative flex flex-col gap-8 ">

            <section className="w-full">
                <FeaturedPost initialBlogs={initialBlogs} />
            </section>




        </div>
    );
}
