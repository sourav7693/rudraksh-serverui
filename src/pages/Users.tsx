import Helmet from "react-helmet";
import UserManagement from "../components/Users/UserManagement";

const Users = () => {
  return (
    <div className="self-padding">
      <Helmet>
        <title>Pri Priya Nursury Admin | Users</title>
      </Helmet>
      <h2 className="text-2xl font-semibold">Manage Users Role</h2>
      <UserManagement />
    </div>
  );
};

export default Users;
