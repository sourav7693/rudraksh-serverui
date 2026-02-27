import { Helmet } from "react-helmet";
import { useQueryParams } from "../hooks/useQueryParams";
import ReviewFilter from "../components/reviews/ReviewFilter";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import ReviewTable from "../components/reviews/ReviewTable";

export default function Reviews() {
  const { getParam } = useQueryParams();

  const [responseData, setResponseData] = useState({
    reviews: [],
    pagination: { total: 0, page: 1, pages: 1 },
  });

  const search = getParam("search") || "";

  const page = getParam("page") || 1;
  const minRating = getParam("minRating") || 0;
  const status = getParam("status") || "";

  async function fetchReviews() {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/review`,
        {
          params: {
            search,
            page,
            minRating,
            status,
          },
        },
      );
      setResponseData((prev) => ({
        ...prev,
        pagination: data.pagination,
        reviews: data.reviews,
      }));
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    fetchReviews();
  }, [search, page, minRating, status]);

  return (
    <>
      <Helmet>
        <title>Ganapati Rudrakshaam Admin | Reviews</title>
      </Helmet>
      <div className="self-padding">
        <h2 className="text-2xl font-semibold">Manage Reviews</h2>
        <ReviewFilter />
        <ReviewTable
          pagination={responseData.pagination}
          reviews={responseData.reviews}
        />
      </div>
    </>
  );
}
