import { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom'; 

const Shop = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();  

  const menuItems = [
    { label: 'Home', key: '1' },
    { label: 'Products', key: '2' },
    { label: 'Categories', key: '3' },
    { label: 'Cart', key: '4' },
    { label: 'Account', key: '5' },
  ];

  useEffect(() => {
    fetch('http://localhost:3000/api/inventory') 
      .then((response) => response.json())     
      .then((data) => setProducts(data))      
      .catch((error) => console.error('Error fetching products:', error));
  }, []); 

  const handleProductClick = (id) => {
    navigate(`/order/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <header className="bg-white shadow-md fixed w-full top-0 z-10">
        <nav className="container mx-auto flex justify-between items-center p-4">
          <h1 className="text-xl font-bold">Shop</h1>
          <ul className="flex space-x-6">
            {menuItems.map((item) => (
              <li key={item.key} className="cursor-pointer hover:text-blue-500">{item.label}</li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Content Section */}
      <main className="container mx-auto pt-20 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products.map((product) => (
              <div 
                key={product.id} 
                className="bg-white shadow-md rounded-lg overflow-hidden cursor-pointer"
                onClick={() => handleProductClick(product.id)} 
              >
                <img alt="product" src={product.boritokep} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h4 className="text-lg font-bold">{product.item_name}</h4>
                  <p className="text-gray-600">${product.unit_price}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center col-span-full">Loading products...</p>  
          )}
        </div>
      </main>
    </div>
  );
};

export default Shop;
