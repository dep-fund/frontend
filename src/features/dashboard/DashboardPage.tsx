import { WalletProvider } from "../wallet";
import Dashboard from "./Dashboard";

export default function DashboardPage() {
  return (
    <WalletProvider>
      <Dashboard />
    </WalletProvider>
  );
}
