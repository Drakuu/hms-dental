import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  deleteProduct
} from "../../../features/product/productSlice";
import ProductForm from "./ProductForm";
import SearchBar from "./SearchBar";

export default function Inventory() {
  const dispatch = useDispatch();
  const { items: products, loading, error } = useSelector(state => state.products);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewVariantsProduct, setViewVariantsProduct] = useState(null);

  const itemsPerPage = 8;

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleDeleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(id));
    }
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const searchLower = searchTerm.toLowerCase();

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        product.brand.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.variants.some((variant) =>
          variant.barcode.toString().toLowerCase().includes(searchLower) ||
          variant.color.toLowerCase().includes(searchLower) ||
          variant.size.toLowerCase().includes(searchLower)
        )
      );
    });
  }, [products, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div className="p-6">Loading products...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">Inventory Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your product inventory efficiently</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 shadow-sm text-sm font-medium"
        >
          + Add Product
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by name, category, brand, barcode, color, or size..."
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Product", "Category", "Brand", "Variants", "Stock", "Actions"].map((head) => (
                  <th
                    key={head}
                    className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    {searchTerm ? "No products match your search." : "No products found."}
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    {/* Product Info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 flex items-center justify-center rounded-md text-xs font-bold">
                          {product.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500 line-clamp-1">{product.description}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700">
                        {product.category}
                      </span>
                    </td>

                    <td className="px-4 py-3">{product.brand}</td>

                    {/* Compact Variants */}
                    <td className="px-4 py-3">
                      {product.variants.slice(0, 2).map((variant, idx) => (
                        <div key={idx} className="flex justify-between text-xs border-b border-gray-100 py-1">
                          <span>
                            {variant.size} {variant.color && `• ${variant.color}`}
                          </span>
                          <span className="font-medium text-green-600">Rs. {variant.sellingPrice}</span>
                        </div>
                      ))}
                      {product.variants.length > 2 && (
                        <button
                          onClick={() => setViewVariantsProduct(product)}
                          className="text-xs text-blue-600 mt-1 hover:underline"
                        >
                          + {product.variants.length - 2} more
                        </button>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3 font-semibold">
                      {product.variants.reduce((t, v) => t + v.stock, 0)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="text-red-600 hover:bg-red-50 p-1 rounded"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-md border ${currentPage === i + 1
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* View Variants Modal */}
      {viewVariantsProduct && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">
              Variants of {viewVariantsProduct.name}
            </h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {viewVariantsProduct.variants.map((variant, idx) => (
                <div key={idx} className="border p-3 rounded text-sm flex justify-between">
                  <div>
                    <div className="font-medium">
                      {variant.size} {variant.color && `• ${variant.color}`}
                    </div>
                    <div className="text-gray-500 text-xs">#{variant.barcode}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-600 font-medium">Rs. {variant.sellingPrice}</div>
                    <div className="text-gray-500 text-xs">Cost: Rs. {variant.buyingPrice}</div>
                    <div
                      className={`mt-1 text-xs px-2 py-0.5 rounded-full ${variant.stock > 10
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}
                    >
                      {variant.stock} in stock
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setViewVariantsProduct(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <ProductForm
          mode="create"
          product={null}
          onClose={() => setIsAddModalOpen(false)}
          onSave={() => setIsAddModalOpen(false)}
        />
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <ProductForm
          mode="edit"
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
}