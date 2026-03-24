import { User, Package, Heart, MapPin, Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ProductCard } from "../components/ProductCard";

export function CustomerAccountPage() {
  const orders = [
    { id: "#ORD-1234", date: "Mar 6, 2024", status: "Delivered", total: "$12,500", items: 1 },
    { id: "#ORD-1235", date: "Feb 22, 2024", status: "Processing", total: "$8,900", items: 1 },
    { id: "#ORD-1236", date: "Jan 15, 2024", status: "Delivered", total: "$15,600", items: 2 },
  ];

  const wishlistItems = [
    {
      id: "w1",
      image: "https://images.unsplash.com/photo-1769857879388-df93b4c96bca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      title: "Pearl Necklace",
      brand: "Mikimoto",
      price: 6800,
      category: "Necklace",
      metal: "18K Gold",
    },
    {
      id: "w2",
      image: "https://images.unsplash.com/photo-1723328254549-24bb3deb4a83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      title: "Luxury Watch",
      brand: "Rolex",
      price: 45000,
      category: "Watch",
      metal: "18K Gold",
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-4xl mb-2 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
          My Account
        </h1>
        <p className="text-lg text-[#8F8F8F]" style={{ fontFamily: 'var(--font-ui)' }}>
          Welcome back, Sarah
        </p>
      </div>

      <Tabs defaultValue="orders" className="space-y-8">
        <TabsList>
          <TabsTrigger value="orders">
            <Package className="w-4 h-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="wishlist">
            <Heart className="w-4 h-4 mr-2" />
            Wishlist
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="addresses">
            <MapPin className="w-4 h-4 mr-2" />
            Addresses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg mb-1" style={{ fontFamily: 'var(--font-ui)' }}>
                        Order {order.id}
                      </div>
                      <div className="text-sm text-[#8F8F8F]">
                        Placed on {order.date} • {order.items} item(s)
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={order.status === "Delivered" ? "default" : "secondary"}
                        className={order.status === "Delivered" ? "bg-green-600" : ""}
                      >
                        {order.status}
                      </Badge>
                      <div className="text-xl text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
                        {order.total}
                      </div>
                      <Button variant="outline">View Details</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wishlist">
          <div className="grid grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <Card className="border-none shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle style={{ fontFamily: 'var(--font-luxury)' }}>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-[#8F8F8F] mb-1">First Name</div>
                  <div>Sarah</div>
                </div>
                <div>
                  <div className="text-sm text-[#8F8F8F] mb-1">Last Name</div>
                  <div>Johnson</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-[#8F8F8F] mb-1">Email</div>
                <div>sarah.johnson@email.com</div>
              </div>
              <div>
                <div className="text-sm text-[#8F8F8F] mb-1">Phone</div>
                <div>+1 (555) 123-4567</div>
              </div>
              <Button className="bg-[#531C24] hover:bg-[#531C24]/90">Edit Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <Card className="border-none shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle style={{ fontFamily: 'var(--font-luxury)' }}>Saved Addresses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-[#531C24]/10 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="mb-2">Default</Badge>
                      <div className="text-sm">123 Main Street</div>
                      <div className="text-sm">New York, NY 10001</div>
                      <div className="text-sm text-[#8F8F8F]">United States</div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full">+ Add New Address</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
