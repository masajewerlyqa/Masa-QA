import { Users, Store, Package, DollarSign, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export function AdminDashboardPage() {
  const stats = [
    { label: "Total Revenue", value: "$2.4M", change: "+18.2%", icon: DollarSign },
    { label: "Active Sellers", value: "156", change: "+12", icon: Store },
    { label: "Total Products", value: "2,847", change: "+234", icon: Package },
    { label: "Active Users", value: "12,450", change: "+1,234", icon: Users },
  ];

  const platformData = [
    { month: "Jan", revenue: 185000, users: 8200 },
    { month: "Feb", revenue: 223000, users: 9100 },
    { month: "Mar", revenue: 198000, users: 9800 },
    { month: "Apr", revenue: 256000, users: 10500 },
    { month: "May", revenue: 289000, users: 11200 },
    { month: "Jun", revenue: 312000, users: 12450 },
  ];

  const categoryDistribution = [
    { name: "Rings", value: 35, color: "#531C24" },
    { name: "Necklaces", value: 28, color: "#E7D8C3" },
    { name: "Earrings", value: 20, color: "#D4AF37" },
    { name: "Bracelets", value: 12, color: "#8F8F8F" },
    { name: "Watches", value: 5, color: "#F7F3EE" },
  ];

  const pendingSellers = [
    { id: 1, name: "Luxury Gems Co.", email: "contact@luxurygems.com", products: 24, status: "Pending", date: "Mar 6, 2024" },
    { id: 2, name: "Golden Treasures", email: "info@goldentreasures.com", products: 18, status: "Pending", date: "Mar 5, 2024" },
    { id: 3, name: "Diamond Palace", email: "sales@diamondpalace.com", products: 31, status: "Pending", date: "Mar 4, 2024" },
  ];

  const recentTransactions = [
    { id: "#TXN-5678", seller: "Cartier Boutique", buyer: "Sarah Johnson", amount: "$12,500", fee: "$625", date: "Mar 6, 2024" },
    { id: "#TXN-5679", seller: "Tiffany Store", buyer: "Michael Chen", amount: "$8,900", fee: "$445", date: "Mar 6, 2024" },
    { id: "#TXN-5680", seller: "Bvlgari Shop", buyer: "Emma Wilson", amount: "$15,600", fee: "$780", date: "Mar 5, 2024" },
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
              <div className="text-xs text-[#E7D8C3]">Admin Panel</div>
            </div>
          </div>

          <nav className="space-y-2" style={{ fontFamily: 'var(--font-ui)' }}>
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-lg">
              <TrendingUp className="w-5 h-5" />
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg transition-colors">
              <Store className="w-5 h-5" />
              <span>Sellers</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg transition-colors">
              <Users className="w-5 h-5" />
              <span>Users</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg transition-colors">
              <Package className="w-5 h-5" />
              <span>Products</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg transition-colors">
              <DollarSign className="w-5 h-5" />
              <span>Transactions</span>
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
              Platform Overview
            </h1>
            <p className="text-[#8F8F8F]" style={{ fontFamily: 'var(--font-ui)' }}>
              MASA Admin Dashboard
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <Card key={idx} className="border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <stat.icon className="w-8 h-8 text-[#531C24]" />
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {stat.change}
                    </Badge>
                  </div>
                  <div className="text-3xl mb-1" style={{ fontFamily: 'var(--font-luxury)' }}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-[#8F8F8F]" style={{ fontFamily: 'var(--font-ui)' }}>
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <Card className="col-span-2 border-none shadow-sm">
              <CardHeader>
                <CardTitle style={{ fontFamily: 'var(--font-luxury)' }}>Platform Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={platformData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E7D8C3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#531C24" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="users" stroke="#D4AF37" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle style={{ fontFamily: 'var(--font-luxury)' }}>Product Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tables */}
          <Tabs defaultValue="sellers" className="mb-8">
            <TabsList>
              <TabsTrigger value="sellers">Pending Sellers</TabsTrigger>
              <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="sellers">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle style={{ fontFamily: 'var(--font-luxury)' }}>Seller Approval Queue</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Seller Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingSellers.map((seller) => (
                        <TableRow key={seller.id}>
                          <TableCell style={{ fontFamily: 'var(--font-ui)' }}>{seller.name}</TableCell>
                          <TableCell className="text-[#8F8F8F]">{seller.email}</TableCell>
                          <TableCell>{seller.products}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              {seller.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{seller.date}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-600">
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
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

            <TabsContent value="transactions">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle style={{ fontFamily: 'var(--font-luxury)' }}>Recent Platform Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Seller</TableHead>
                        <TableHead>Buyer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Platform Fee</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTransactions.map((txn) => (
                        <TableRow key={txn.id}>
                          <TableCell style={{ fontFamily: 'var(--font-ui)' }}>{txn.id}</TableCell>
                          <TableCell>{txn.seller}</TableCell>
                          <TableCell>{txn.buyer}</TableCell>
                          <TableCell>{txn.amount}</TableCell>
                          <TableCell className="text-green-600">{txn.fee}</TableCell>
                          <TableCell>{txn.date}</TableCell>
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
