import Navbar from "@/components/Navbar";
import ShipmentTable from "@/components/ShipmentTable";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 p-6">
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-foreground">Logistics Module</h1>
          <p className="text-sm text-muted-foreground mt-1">Shipment tracking and management</p>
        </div>
        <ShipmentTable />
      </main>
      <footer className="border-t px-6 py-3 text-xs text-muted-foreground">
        © 2026 MyFreight360. All rights reserved.
      </footer>
    </div>
  );
};

export default Index;
