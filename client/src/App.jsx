import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Shop from "./page/shop"; 
import RingPage from "./page/ring";
import ProductOrder from "./page/order";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Shop />}/> 
        <Route path="/ring" element={<RingPage />} />
        <Route path="/order/:id" element={<ProductOrder />} />
      </Routes>
    </Router>
  );
}

export default App;
