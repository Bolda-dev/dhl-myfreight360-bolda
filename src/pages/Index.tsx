import Navbar from "@/components/Navbar";
import ShipmentTable from "@/components/ShipmentTable";

const Index = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Navbar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <div className="shrink-0 px-6 pt-4 pb-2">
          <h1 className="text-lg font-semibold text-foreground">Shipments</h1>
        </div>
        <main className="flex-1 min-h-0 px-6 pb-0">
          <ShipmentTable />
        </main>
      </div>
    </div>
  );
};

export default Index;
