import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Shop from "./page/shop"; 
import ProductOrder from "./page/order";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Shop />}/> 
        <Route path="/order/:id" element={<ProductOrder />} />
      </Routes>
    </Router>
  );
}

export default App;
