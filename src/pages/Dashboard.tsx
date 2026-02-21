import DashboardManage from '../components/Dashboard/DashboardManage'
import Helmet from "react-helmet"




const Dashboard = () => {
  return (
    <>
    <Helmet>
      <title>Pri Priya Nursury Admin | Dashboard</title>
    </Helmet>
    
    <DashboardManage />
    </>
  )
}

export default Dashboard