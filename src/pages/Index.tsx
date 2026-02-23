import Navbar from "@/components/Navbar";
import ShipmentTable from "@/components/ShipmentTable";

const Index = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Navbar />
      <div className="shrink-0 px-6 pt-5 pb-3">
        <h1 className="text-xl font-semibold text-foreground">Logistics Module</h1>
        <p className="text-sm text-muted-foreground mt-1">Shipment tracking and management</p>
      </div>
      <main className="flex-1 min-h-0 px-6 pb-0">
        <ShipmentTable />
      </main>
    </div>
  );
};

export default Index;
