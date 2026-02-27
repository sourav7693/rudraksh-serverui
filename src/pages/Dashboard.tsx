import DashboardManage from '../components/Dashboard/DashboardManage'
import Helmet from "react-helmet"




const Dashboard = () => {
  return (
    <>
    <Helmet>
      <title>Ganapati Rudrakshaam Admin | Dashboard</title>
    </Helmet>
    
    <DashboardManage />
    </>
  )
}

export default Dashboard