import AnalyticsGraph from "./AnalyticsGraph";
import DashBoardOrder from "./DashBoardOrder";
import DashBoardOverView from "./DashBoardOverView";
import ProgressBar from "./ProgressBar";


const DashboardManage = () => {

  return (
    <section className="self-padding">
      <div className="flex gap-4 justify-between">
        <div className="flex flex-col gap-6 w-[75%]">
          {/* OverView */}
          <DashBoardOverView />
          {/* Orders Table  */}
          <DashBoardOrder />
        </div>
        {/* Circular Stats  */}
        <ProgressBar />
      </div>

      {/* Graph  */}
      <div className="grid grid-cols-2 gap-4">
        <AnalyticsGraph
          title="Monthly"
          data={[40, 65, 52, 78, 60, 90]}
          categories={[
            "Week 1",
            "Week 2",
            "Week 3",
            "Week 4",
            "Week 5",
            "Week 6",
          ]}
        />
        <AnalyticsGraph
          title="Yearly"
          data={[120, 150, 142, 170, 180, 160]}
          categories={["Jan", "Feb", "March", "April", "May", "June"]}
        />
      </div>
    </section>
  );
}

export default DashboardManage