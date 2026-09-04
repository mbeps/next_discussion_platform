import { useEffect, useState } from "react";
import { getSearchData } from "@/lib/search/getSearchData";
import type { Community } from "@/types/community";
import type { Post } from "@/types/post";

/**
 * A custom hook that handles client-side search logic for communities and posts.
 * It preloads a subset of public data and provides filtered results based on the user's search term.
 * @param searchTerm - The current string being searched for.
 * @returns An object containing the filtered search results and a loading state indicator.
 */
const useSearch = (searchTerm: string) => {
  const [results, setResults] = useState<{
    communities: Community[];
    posts: Post[];
  }>({
    communities: [],
    posts: [],
  });
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState<{
    communities: Community[];
    posts: Post[];
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { communities, posts } = await getSearchData();
        setAllData({ communities, posts });
      } catch (error) {
        console.error("Error fetching search data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!allData || !searchTerm) {
      setResults({ communities: [], posts: [] });
      return;
    }

    const lowerTerm = searchTerm.toLowerCase();

    const filteredCommunities = allData.communities.filter((comm) =>
      comm.id.toLowerCase().includes(lowerTerm),
    );

    const filteredPosts = allData.posts.filter(
      (post) =>
        post.title.toLowerCase().includes(lowerTerm) ||
        post.body.toLowerCase().includes(lowerTerm),
    );

    setResults({
      communities: filteredCommunities,
      posts: filteredPosts,
    });
  }, [searchTerm, allData]);

  return { results, loading: loading && !allData };
};

export default useSearch;
