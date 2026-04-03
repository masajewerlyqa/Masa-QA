import { Vault, TrendingUp, Shield, Plus, Eye, FileText } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DiamondPattern } from "../components/DiamondPattern";

export function JewelryVaultPage() {
  const vaultStats = [
    { label: "Total Value", value: "$87,400", change: "+$4,200" },
    { label: "Items", value: "12", change: "+2" },
    { label: "Appreciation", value: "+12.3%", change: "This Year" },
  ];

  const valueData = [
    { month: "Jan", value: 75000 },
    { month: "Feb", value: 77500 },
    { month: "Mar", value: 79200 },
    { month: "Apr", value: 82100 },
    { month: "May", value: 84800 },
    { month: "Jun", value: 87400 },
  ];

  const vaultItems = [
    {
      id: 1,
      name: "Diamond Engagement Ring",
      brand: "Cartier",
      purchaseDate: "Jan 15, 2023",
      purchasePrice: "$12,500",
      currentValue: "$13,800",
      appreciation: "+10.4%",
      certificate: "GIA-123456",
    },
    {
      id: 2,
      name: "Gold Chain Necklace",
      brand: "Tiffany & Co",
      purchaseDate: "Mar 22, 2023",
      purchasePrice: "$8,900",
      currentValue: "$9,700",
      appreciation: "+9.0%",
      certificate: "GIA-789012",
    },
    {
      id: 3,
      name: "Pearl Earrings",
      brand: "Mikimoto",
      purchaseDate: "May 10, 2023",
      purchasePrice: "$4,200",
      currentValue: "$4,800",
      appreciation: "+14.3%",
      certificate: "GIA-345678",
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-[#531C24] to-[#8B3940] rounded-2xl p-12 mb-12 overflow-hidden text-white">
        <DiamondPattern className="opacity-10" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <Badge className="mb-4 bg-[#D4AF37] text-white">
              <Vault className="w-3 h-3 mr-1" />
              Digital Vault
            </Badge>
            <h1 className="text-5xl mb-4" style={{ fontFamily: 'var(--font-luxury)' }}>
              Your Jewelry Vault
            </h1>
            <p className="text-xl text-[#E7D8C3] max-w-2xl" style={{ fontFamily: 'var(--font-ui)' }}>
              Track, manage, and monitor the value of your luxury jewelry collection
            </p>
          </div>
          <Button className="bg-white text-[#531C24] hover:bg-[#E7D8C3]" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Add Item to Vault
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        {vaultStats.map((stat, idx) => (
          <Card key={idx} className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="text-3xl mb-2 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
                {stat.value}
              </div>
              <div className="text-sm text-[#635C5C] mb-2" style={{ fontFamily: 'var(--font-ui)' }}>
                {stat.label}
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                {stat.change}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Value Chart */}
      <Card className="border-none shadow-sm mb-12">
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-luxury)' }}>Portfolio Value Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={valueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7D8C3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#531C24" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Vault Items */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-luxury)' }}>Your Collection</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Purchase Price</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>Appreciation</TableHead>
                <TableHead>Certificate</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vaultItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="text-sm" style={{ fontFamily: 'var(--font-ui)' }}>{item.name}</div>
                      <div className="text-xs text-[#635C5C]">{item.brand}</div>
                    </div>
                  </TableCell>
                  <TableCell>{item.purchaseDate}</TableCell>
                  <TableCell>{item.purchasePrice}</TableCell>
                  <TableCell className="text-[#531C24]">{item.currentValue}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-600">{item.appreciation}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-[#635C5C]">{item.certificate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-3 gap-6 mt-12">
        <Card className="border-none shadow-sm text-center p-8">
          <Shield className="w-12 h-12 text-[#531C24] mx-auto mb-4" />
          <h3 className="text-lg mb-2" style={{ fontFamily: 'var(--font-luxury)' }}>Secure Storage</h3>
          <p className="text-sm text-[#635C5C]" style={{ fontFamily: 'var(--font-ui)' }}>
            Your jewelry data is encrypted and stored securely
          </p>
        </Card>
        <Card className="border-none shadow-sm text-center p-8">
          <TrendingUp className="w-12 h-12 text-[#531C24] mx-auto mb-4" />
          <h3 className="text-lg mb-2" style={{ fontFamily: 'var(--font-luxury)' }}>Value Tracking</h3>
          <p className="text-sm text-[#635C5C]" style={{ fontFamily: 'var(--font-ui)' }}>
            Real-time market value updates for your collection
          </p>
        </Card>
        <Card className="border-none shadow-sm text-center p-8">
          <FileText className="w-12 h-12 text-[#531C24] mx-auto mb-4" />
          <h3 className="text-lg mb-2" style={{ fontFamily: 'var(--font-luxury)' }}>Digital Certificates</h3>
          <p className="text-sm text-[#635C5C]" style={{ fontFamily: 'var(--font-ui)' }}>
            Store and access all your jewelry certificates
          </p>
        </Card>
      </div>
    </div>
  );
}
