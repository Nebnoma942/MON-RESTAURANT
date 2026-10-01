import { useState } from "react";
import { useListAdminOrders } from "@workspace/api-client-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingBag, Loader2 } from "lucide-react";

export default function OrdersPage() {
  const { data: orders, isLoading } = useListAdminOrders();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary" className="bg-amber-500 text-white">En attente</Badge>;
      case 'confirmed': return <Badge className="bg-blue-500">Confirmée</Badge>;
      case 'preparing': return <Badge className="bg-orange-500">En préparation</Badge>;
      case 'ready': return <Badge className="bg-green-500">Prête</Badge>;
      case 'delivering': return <Badge className="bg-purple-500">En livraison</Badge>;
      case 'delivered': return <Badge className="bg-emerald-600">Livrée</Badge>;
      case 'cancelled': return <Badge variant="destructive">Annulée</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'orange_money': return 'Orange Money';
      case 'moov_money': return 'Moov Money';
      case 'cash': return 'Espèces';
      default: return method;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const filtered = orders?.filter(o => statusFilter === "all" || o.status === statusFilter) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">{filtered.length} commande(s) trouvée(s)</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">Filtrer par statut:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="confirmed">Confirmée</SelectItem>
              <SelectItem value="preparing">En préparation</SelectItem>
              <SelectItem value="ready">Prête</SelectItem>
              <SelectItem value="delivering">En livraison</SelectItem>
              <SelectItem value="delivered">Livrée</SelectItem>
              <SelectItem value="cancelled">Annulée</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Restaurant</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Articles</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paiement</TableHead>
              <TableHead className="text-right">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Aucune commande ne correspond à vos critères.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-muted-foreground">#{order.id}</TableCell>
                  <TableCell className="text-sm">{formatDateTime(order.createdAt)}</TableCell>
                  <TableCell className="font-medium">{order.restaurantName}</TableCell>
                  <TableCell>{order.deliveryCity}</TableCell>
                  <TableCell>{order.itemCount} article(s)</TableCell>
                  <TableCell className="font-bold">{formatCurrency(order.total)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatPaymentMethod(order.paymentMethod)}
                  </TableCell>
                  <TableCell className="text-right">
                    {getOrderStatusBadge(order.status)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
