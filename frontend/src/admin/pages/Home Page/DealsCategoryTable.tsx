import { useAppSelector } from "../../../Redux Toolkit/Store";
import HomeCategoryTable from "./HomeCategoryTable";

function DealsCategoryTable() {
const homePage = useAppSelector((s) => s.homePage);

  return (
    <>
      <HomeCategoryTable categories={homePage.homePageData?.dealCategories}/>
    </>
  );
}


export default DealsCategoryTable