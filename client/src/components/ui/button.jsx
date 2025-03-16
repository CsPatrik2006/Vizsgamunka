export function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-[#5671c2] text-white rounded transition-all duration-300 hover:scale-105 cursor-pointer"
    >
      {children}
    </button>
  );
}