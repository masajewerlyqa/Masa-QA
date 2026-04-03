import { Package, ShoppingCart, DollarSign, TrendingUp, Plus, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

export function SellerDashboardPage() {
  const stats = [
    { label: "Total Revenue", value: "$248,500", change: "+12.5%", icon: DollarSign, color: "text-green-600" },
    { label: "Total Orders", value: "156", change: "+8.3%", icon: ShoppingCart, color: "text-blue-600" },
    { label: "Products Listed", value: "42", change: "+3", icon: Package, color: "text-[#531C24]" },
    { label: "Avg. Order Value", value: "$1,593", change: "+5.2%", icon: TrendingUp, color: "text-purple-600" },
  ];

  const revenueData = [
    { month: "Jan", revenue: 18500 },
    { month: "Feb", revenue: 22300 },
    { month: "Mar", revenue: 19800 },
    { month: "Apr", revenue: 25600 },
    { month: "May", revenue: 28900 },
    { month: "Jun", revenue: 31200 },
  ];

  const categoryData = [
    { category: "Rings", sales: 45 },
    { category: "Necklaces", sales: 38 },
    { category: "Earrings", sales: 32 },
    { category: "Bracelets", sales: 28 },
    { category: "Watches", sales: 13 },
  ];

  const products = [
    { id: 1, name: "Diamond Engagement Ring", price: "$12,500", stock: 3, status: "Active", sales: 24 },
    { id: 2, name: "Gold Chain Necklace", price: "$8,900", stock: 8, status: "Active", sales: 18 },
    { id: 3, name: "Pearl Earrings", price: "$3,200", stock: 0, status: "Out of Stock", sales: 15 },
    { id: 4, name: "Tennis Bracelet", price: "$15,600", stock: 5, status: "Active", sales: 12 },
    { id: 5, name: "Luxury Watch", price: "$45,000", stock: 2, status: "Active", sales: 8 },
  ];

  const recentOrders = [
    { id: "#ORD-1234", customer: "Sarah Johnson", product: "Diamond Ring", amount: "$12,500", status: "Delivered", date: "Mar 6, 2024" },
    { id: "#ORD-1235", customer: "Michael Chen", product: "Gold Necklace", amount: "$8,900", status: "Processing", date: "Mar 6, 2024" },
    { id: "#ORD-1236", customer: "Emma Wilson", product: "Pearl Earrings", amount: "$3,200", status: "Shipped", date: "Mar 5, 2024" },
    { id: "#ORD-1237", customer: "James Brown", product: "Tennis Bracelet", amount: "$15,600", status: "Delivered", date: "Mar 5, 2024" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-[#531C24] text-white flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2 L2 7 L12 12 L22 7 L12 2Z" fill="#E7D8C3"/>
                <path d="M12 12 L2 7 L2 17 L12 22 L12 12Z" fill="#D4AF37"/>
                <path d="M12 12 L22 7 L22 17 L12 22 L12 12Z" fill="#531C24"/>
              </svg>
            </div>
            <div>
              <div className="text-lg" style={{ fontFamily: 'var(--font-luxury)' }}>MASA</div>
              <div className="text-xs text-[#E7D8C3]">Seller Dashboard</div>
            </div>
          </div>

          <nav className="space-y-2" style={{ fontFamily: 'var(--font-ui)' }}>
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-lg">
              <TrendingUp className="w-5 h-5" />
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg transition-colors">
              <Package className="w-5 h-5" />
              <span>Products</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg transition-colors">
              <ShoppingCart className="w-5 h-5" />
              <span>Orders</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg transition-colors">
              <DollarSign className="w-5 h-5" />
              <span>Analytics</span>
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 bg-[#F7F3EE]">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl mb-2 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
              Dashboard Overview
            </h1>
            <p className="text-[#635C5C]" style={{ fontFamily: 'var(--font-ui)' }}>
              Welcome back, Cartier Boutique
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <Card key={idx} className="border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {stat.change}
                    </Badge>
                  </div>
                  <div className="text-3xl mb-1" style={{ fontFamily: 'var(--font-luxury)' }}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-[#635C5C]" style={{ fontFamily: 'var(--font-ui)' }}>
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle style={{ fontFamily: 'var(--font-luxury)' }}>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E7D8C3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#531C24" fill="#E7D8C3" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle style={{ fontFamily: 'var(--font-luxury)' }}>Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E7D8C3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#531C24" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tables */}
          <Tabs defaultValue="products" className="mb-8">
            <TabsList>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">Recent Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle style={{ fontFamily: 'var(--font-luxury)' }}>Product Inventory</CardTitle>
                  <Button className="bg-[#531C24] hover:bg-[#531C24]/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sales</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell style={{ fontFamily: 'var(--font-ui)' }}>{product.name}</TableCell>
                          <TableCell>{product.price}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>
                            <Badge variant={product.status === "Active" ? "default" : "secondary"}>
                              {product.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{product.sales}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle style={{ fontFamily: 'var(--font-luxury)' }}>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell style={{ fontFamily: 'var(--font-ui)' }}>{order.id}</TableCell>
                          <TableCell>{order.customer}</TableCell>
                          <TableCell>{order.product}</TableCell>
                          <TableCell>{order.amount}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                order.status === "Delivered"
                                  ? "default"
                                  : order.status === "Shipped"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{order.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
