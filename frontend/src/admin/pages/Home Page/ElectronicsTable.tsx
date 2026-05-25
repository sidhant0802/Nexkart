import { useAppSelector } from "../../../Redux Toolkit/Store";
import HomeCategoryTable from "./HomeCategoryTable";

function ElectronicsTable() {
 const homePage = useAppSelector((s) => s.homePage);

  return (
    <>
      <HomeCategoryTable categories={homePage.homePageData?.electricCategories}/>
    </>
  );
}


export default ElectronicsTable