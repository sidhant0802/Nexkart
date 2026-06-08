import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../Redux Toolkit/Store";
import { getAllProducts } from "../../../../Redux Toolkit/Customer/ProductSlice";
import SimilarProductCard from "./SimilarProductCard";

const SmilarProduct = () => {
  const dispatch       = useAppDispatch();
  const { categoryId } = useParams();
  const hasFetched     = useRef(false);

  // ✅ Use separate selector - don't use loading state
  const products = useAppSelector((s) => s.products.products);

  useEffect(() => {
    // ✅ Only fetch once, with delay so ProductDetails loads first
    if (hasFetched.current) return;
    hasFetched.current = true;

    const timer = setTimeout(() => {
      if (categoryId && categoryId !== "undefined" && categoryId !== "all") {
        dispatch(getAllProducts({ category: categoryId, pageSize: 12 }));
      } else {
        dispatch(getAllProducts({ pageSize: 12 }));
      }
    }, 1500); // ✅ Wait 1.5s so ProductDetails renders first

    return () => clearTimeout(timer);
  }, [categoryId, dispatch]);

  if (!products || products.length === 0) return null;

  return (
    <div className="grid lg:grid-cols-6 md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-4 gap-y-8">
      {products.slice(0, 12).map((item: any) => (
        <SimilarProductCard key={item._id} product={item} />
      ))}
    </div>
  );
};

export default SmilarProduct;