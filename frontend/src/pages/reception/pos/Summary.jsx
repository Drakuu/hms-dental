import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BarChart3, DollarSign, ShoppingCart, Users,
  TrendingUp, Package, Calendar, Filter,
  Download, Printer, RefreshCw, AlertCircle,
  Search, X, ChevronDown, ChevronUp, FileText,
  CreditCard, User, Clock, TrendingDown
} from 'lucide-react';
import { fetchBills } from '../../../features/billing/billingSlice';
import { fetchProducts } from '../../../features/product/productSlice';

const Summary = () => {
  const dispatch = useDispatch();
  const { items: products, loading: productsLoading } = useSelector(state => state.products);
  const { items: bills, loading: billsLoading } = useSelector(state => state.billing);

  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0] // Today
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBill, setExpandedBill] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    dispatch(fetchBills());
    dispatch(fetchProducts());
  }, [dispatch]);

  // Ensure bills is always an array
  const billsArray = Array.isArray(bills) ? bills : [];

  // Filter bills based on date range, status, and search
  const filteredBills = useMemo(() => {
    return billsArray.filter(bill => {
      const billDate = new Date(bill.createdAt);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // Include entire end date

      const dateInRange = billDate >= startDate && billDate <= endDate;
      const statusMatches = statusFilter === 'all' || bill.status === statusFilter;
      const searchMatches =
        bill.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.paymentMethod?.toLowerCase().includes(searchQuery.toLowerCase());

      return dateInRange && statusMatches && searchMatches;
    });
  }, [billsArray, dateRange, statusFilter, searchQuery]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const completedBills = filteredBills.filter(bill => bill.status === 'completed' || bill.status === 'paid');
    const holdBills = filteredBills.filter(bill => bill.status === 'hold');

    const totalSales = completedBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const totalTransactions = completedBills.length;
    const totalProductsSold = completedBills.reduce((sum, bill) =>
      sum + bill.products.reduce((productSum, product) => productSum + product.quantity, 0), 0
    );
    const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // Calculate comparison with previous period
    const prevStartDate = new Date(dateRange.start);
    const prevEndDate = new Date(dateRange.end);
    const periodDays = Math.floor((new Date(dateRange.end) - new Date(dateRange.start)) / (1000 * 60 * 60 * 24));

    prevStartDate.setDate(prevStartDate.getDate() - periodDays - 1);
    prevEndDate.setDate(prevEndDate.getDate() - periodDays - 1);

    const prevPeriodBills = billsArray.filter(bill => {
      const billDate = new Date(bill.createdAt);
      return billDate >= prevStartDate && billDate <= prevEndDate &&
        (bill.status === 'completed' || bill.status === 'paid');
    });

    const prevPeriodSales = prevPeriodBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const salesChange = prevPeriodSales > 0 ?
      ((totalSales - prevPeriodSales) / prevPeriodSales) * 100 : 0;

    return {
      totalSales,
      totalTransactions,
      totalProductsSold,
      averageTransaction,
      holdBills: holdBills.length,
      salesChange,
      completedBills: completedBills.length
    };
  }, [filteredBills, billsArray, dateRange]);

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
              revenue: 0,
              productId: product.productId
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
      salesByDay[dateStr] = {
        revenue: 0,
        transactions: 0,
        products: 0
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add actual sales
    filteredBills.forEach(bill => {
      if (bill.status === 'completed' || bill.status === 'paid') {
        const billDate = new Date(bill.createdAt).toISOString().split('T')[0];
        if (salesByDay[billDate] !== undefined) {
          salesByDay[billDate].revenue += bill.totalAmount;
          salesByDay[billDate].transactions += 1;
          salesByDay[billDate].products += bill.products.reduce((sum, product) => sum + product.quantity, 0);
        }
      }
    });

    return Object.entries(salesByDay).map(([date, data]) => ({
      date,
      ...data
    }));
  }, [filteredBills, dateRange]);

  // Get payment method breakdown
  const paymentMethods = useMemo(() => {
    const methods = {};

    filteredBills.forEach(bill => {
      if (bill.status === 'completed' || bill.status === 'paid') {
        const method = bill.paymentMethod || 'Unknown';
        if (!methods[method]) {
          methods[method] = {
            method,
            amount: 0,
            count: 0
          };
        }
        methods[method].amount += bill.totalAmount;
        methods[method].count += 1;
      }
    });

    return Object.values(methods).sort((a, b) => b.amount - a.amount);
  }, [filteredBills]);

  const handleRefresh = () => {
    dispatch(fetchBills());
    dispatch(fetchProducts());
  };

  if (billsLoading || productsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-600">Loading sales data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Summary</h1>
            <p className="text-gray-600 mt-1">Comprehensive overview of your business performance</p>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <button className="bg-white border border-gray-300 rounded-xl px-4 py-2.5 flex items-center hover:bg-gray-50 transition-colors">
              <Printer size={18} className="mr-2" />
              Print
            </button>
            <button className="bg-white border border-gray-300 rounded-xl px-4 py-2.5 flex items-center hover:bg-gray-50 transition-colors">
              <Download size={18} className="mr-2" />
              Export
            </button>
            <button
              onClick={handleRefresh}
              className="bg-primary-600 text-white rounded-xl px-4 py-2.5 flex items-center hover:bg-primary-700 transition-colors"
            >
              <RefreshCw size={18} className="mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="paid">Paid</option>
                <option value="hold">On Hold</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search bills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl p-1 mb-6 shadow-sm inline-flex">
          {['overview', 'products', 'categories', 'transactions'].map(tab => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === tab
                  ? "bg-primary-100 text-primary-700"
                  : "text-gray-600 hover:text-gray-800"
                }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">PKR {summaryStats.totalSales.toFixed(2)}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-xl">
                <DollarSign className="text-primary-600" size={24} />
              </div>
            </div>
            <div className={`mt-2 flex items-center text-sm ${summaryStats.salesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summaryStats.salesChange >= 0 ? (
                <TrendingUp size={16} className="mr-1" />
              ) : (
                <TrendingDown size={16} className="mr-1" />
              )}
              <span>{Math.abs(summaryStats.salesChange).toFixed(1)}% from previous period</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-极减少 font-bold text-gray-900">{summaryStats.totalTransactions}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <ShoppingCart className="text-green-600" size={24} />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {summaryStats.averageTransaction > 0 && (
                <span>Avg: PKR {summaryStats.averageTransaction.toFixed(2)}</span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Products Sold</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.totalProductsSold}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-xl">
                <Package className="text-amber-600" size={24} />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Across {summaryStats.completed极减少} completed bills
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hold Bills</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.holdBills}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <Clock className="text-purple-600" size={24} />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Pending completion
            </div>
          </div>
        </div>

        {/* Daily Sales Chart */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 size={20} className="mr-2" />
              Daily Sales Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {dailySales.map((day, index) => (
                <div key={index} className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className="text-xs text-gray-500 mb-1">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <div className="bg-primary-50 rounded-lg p-3">
                    <p className="font-semibold text-primary-700">PKR {day.revenue.toFixed(2)}</p>
                    <p className="text-xs text-gray-600 mt-1">{day.transactions} transactions</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Methods */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CreditCard size={20} className="mr-2" />
              Payment Methods
            </h3>
            <div className="grid grid-cols-1 md:极减少-cols-3 gap-4">
              {paymentMethods.map((method, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium capitalize">{method.method}</span>
                    <span className="font-semibold">PKR {method.amount.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${Math.min((method.amount / summaryStats.totalSales) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{method.count} transactions</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Package size={20} className="mr-2" />
              Top Selling Products
            </h3>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray极减少 rounded-xl">
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.quantity} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">PKR {product.revenue.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">
                      {summaryStats.totalSales > 0 ?
                        ((product.revenue / summaryStats.totalSales) * 100).toFixed(1) : 0}% of total
                    </p>
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
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 size={20} className="mr-2" />
              Sales by Category
            </h3>
            <div className="space-y-4">
              {salesByCategory.map((category, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{category.category}</span>
                    <span className="font-semibold">PKR {category.revenue.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-primary-600 h-2.5 rounded-full"
                      style={{ width: `${Math.min((category.revenue / summaryStats.totalSales) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="极减少 justify-between items-center mt-2">
                    <p className="text-sm text-gray-600">{category.count} units sold</p>
                    <p className="text-sm text-gray-600">
                      {summaryStats.totalSales > 0 ?
                        ((category.revenue / summaryStats.totalSales) * 100).toFixed(1) : 0}% of total
                    </p>
                  </div>
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
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center">
                <FileText size={20} className="mr-2" />
                Recent Transactions
              </h3>
              <span className="text-sm text-gray-500">
                {filteredBills.length} {filteredBills.length === 1 ? 'transaction' : 'transactions'}
              </span>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredBills.slice(0, 10).map((bill) => (
                <div key={bill._id} className="p-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${bill.status === 'completed' || bill.status === 'paid'
                            ? 'bg-green-极减少 text-green-800'
                            : bill.status === 'hold'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                          {bill.status.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(bill.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-semibold text-gray-800">
                        Bill #{bill._id.slice(-6).toUpperCase()}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <User size={16} className="mr-1" />
                          {bill.customerName || "Walk-in Customer"}
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <Package size={16} className="mr-1" />
                          {bill.products.length} items
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <CreditCard size={16} className="mr-1" />
                          {bill.paymentMethod || "Not specified"}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary-600">
                          PKR {bill.totalAmount.toFixed(2)}
                        </div>
                      </div>

                      <button
                        onClick={() => setExpandedBill(expandedBill === bill._id ? null : bill._id)}
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        {expandedBill === bill._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {expandedBill === bill._id && (
                    <div className="mt-4 pl-2 border-l-2 border-primary-200">
                      <h4 className="font-medium text-gray-700 mb-2">Products:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {bill.products.map((product, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-3">
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600">
                              {product.quantity} × PKR {product.price.toFixed(2)} = PKR {product.total.toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {filteredBills.length === 0 && (
                <div className="p-10 text-center">
                  <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No transactions found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {searchQuery
                      ? `No results for "${searchQuery}"`
                      : "Try adjusting your filters or date range"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Summary;