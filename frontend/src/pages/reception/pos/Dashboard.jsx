import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BarChart3, DollarSign, ShoppingCart, Users,
  TrendingUp, Package, Calendar, Filter,
  Download, Printer, RefreshCw, AlertCircle
} from 'lucide-react';
import { fetchBills } from '../../../features/billing/billingSlice';
import { fetchProducts } from '../../../features/product/productSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { items: products, loading: productsLoading } = useSelector(state => state.products);
  const { items: bills, loading: billsLoading } = useSelector(state => state.billing);

  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0] // Today
  });
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchBills());
    dispatch(fetchProducts());
  }, [dispatch]);

  // Ensure bills is always an array
  const billsArray = Array.isArray(bills) ? bills : [];

  // Filter bills based on date range and status
  const filteredBills = useMemo(() => {
    return billsArray.filter(bill => {
      const billDate = new Date(bill.createdAt);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // Include entire end date

      const dateInRange = billDate >= startDate && billDate <= endDate;
      const statusMatches = statusFilter === 'all' || bill.status === statusFilter;

      return dateInRange && statusMatches;
    });
  }, [billsArray, dateRange, statusFilter]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const completedBills = filteredBills.filter(bill => bill.status === 'completed' || bill.status === 'paid');

    const totalSales = completedBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const totalTransactions = completedBills.length;
    const totalProductsSold = completedBills.reduce((sum, bill) =>
      sum + bill.products.reduce((productSum, product) => productSum + product.quantity, 0), 0
    );
    const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    return {
      totalSales,
      totalTransactions,
      totalProductsSold,
      averageTransaction
    };
  }, [filteredBills]);

  // Get top selling products
  const topProducts = useMemo(() => {
    const productSales = {};

    filteredBills.forEach(bill => {
      if (bill.status === 'completed' || bill.status === 'paid') {
        bill.products.forEach(product => {
          const key = product.productId || product.name;
          if (!productSales[key]) {
            productSales[key] = {
              name: product.name,
              quantity: 0,
              revenue: 0
            };
          }
          productSales[key].quantity += product.quantity;
          productSales[key].revenue += product.total;
        });
      }
    });

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredBills]);

  // Get sales by category
  const salesByCategory = useMemo(() => {
    const categorySales = {};

    filteredBills.forEach(bill => {
      if (bill.status === 'completed' || bill.status === 'paid') {
        bill.products.forEach(product => {
          // Find product category from products data
          const productInfo = products.find(p => p._id === product.productId);
          const category = productInfo?.category || 'Unknown';

          if (!categorySales[category]) {
            categorySales[category] = {
              category,
              revenue: 0,
              count: 0
            };
          }
          categorySales[category].revenue += product.total;
          categorySales[category].count += product.quantity;
        });
      }
    });

    return Object.values(categorySales).sort((a, b) => b.revenue - a.revenue);
  }, [filteredBills, products]);

  // Get daily sales data for chart
  const dailySales = useMemo(() => {
    const salesByDay = {};
    const currentDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    // Initialize all days in range with 0 sales
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      salesByDay[dateStr] = 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add actual sales
    filteredBills.forEach(bill => {
      if (bill.status === 'completed' || bill.status === 'paid') {
        const billDate = new Date(bill.createdAt).toISOString().split('T')[0];
        if (salesByDay[billDate] !== undefined) {
          salesByDay[billDate] += bill.totalAmount;
        }
      }
    });

    return Object.entries(salesByDay).map(([date, revenue]) => ({
      date,
      revenue
    }));
  }, [filteredBills, dateRange]);

  const handleRefresh = () => {
    dispatch(fetchBills());
    dispatch(fetchProducts());
  };

  if (billsLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full p-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Al-Shahbaz Glasses</h1>
            <p className="text-gray-600">Overview of your business performance</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-primary-700 transition-colors"
            >
              <RefreshCw size={18} className="mr-2" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="paid">Paid</option>
                <option value="hold">On Hold</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">PKR {summaryStats.totalSales.toFixed(2)}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-lg">
                <DollarSign className="text-primary-600" size={24} />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp size={16} className="mr-1" />
              <span>+12.5% from last period</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-primary-900" >
                {summaryStats.totalTransactions}
                </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <ShoppingCart className="text-green-600" size={24} />
            </div>
          </div>
          <div className="mt-2 text text-gray-600">
            {summaryStats.averageTransaction > 0 && (
              <span>Avg: PKR {summaryStats.averageTransaction.toFixed(2)}</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Products Sold</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.totalProductsSold}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <Package className="text-amber-600" size={24} />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Across {filteredBills.length} bills
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="text-purple-600" size={24} />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            In inventory
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Products */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp size={20} className="mr-2" />
            Top Selling Products
          </h3>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.quantity} units sold</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">PKR {product.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package size={48} className="mx-auto mb-4 opacity-50" />
                <p>No sales data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 size={20} className="mr-2" />
            Sales by Category
          </h3>
          <div className="space-y-3">
            {salesByCategory.map((category, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{category.category}</span>
                  <span className="font-semibold">PKR {category.revenue.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${Math.min((category.revenue / summaryStats.totalSales) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{category.count} units</p>
              </div>
            ))}
            {salesByCategory.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                <p>No category data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Calendar size={20} className="mr-2" />
          Recent Transactions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Bill ID</th>
                <th className="text-left py-3 px-4">Customer</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Amount</th>
                <th className="text-left py-3 px-4">Items</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.slice(0, 10).map((bill) => (
                <tr key={bill._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">#{bill._id.slice(-6)}</td>
                  <td className="py-3 px-4">{bill.customerName || 'Walk-in Customer'}</td>
                  <td className="py-3 px-4">{new Date(bill.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${bill.status === 'completed' || bill.status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : bill.status === 'hold'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold">PKR {bill.totalAmount.toFixed(2)}</td>
                  <td className="py-3 px-4">{bill.products.length} items</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBills.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p>No transactions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div >
  );
};

export default Dashboard;