import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Shop from "./page/shop"; 
import ProductOrder from "./page/order";
import HomePage from "./page/home";
import RegisterForm from "./page/register";
import LoginForm from "./page/login";
import TyreShopHomepage from "./page/main";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TyreShopHomepage />}/>
        <Route path="/home" element={<HomePage />}/> 
        <Route path="/order/:id" element={<ProductOrder />} />
        <Route path="/register" element={<RegisterForm />}/>
        <Route path="/login" element={<LoginForm />}/>
      </Routes>
    </Router>
  );
}

export default App;
