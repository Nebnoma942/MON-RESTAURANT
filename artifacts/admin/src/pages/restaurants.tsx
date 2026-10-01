import { useState } from "react";
import { useListAdminRestaurants, useSetRestaurantStatus, getListAdminRestaurantsQueryKey, getGetAdminStatsQueryKey, AdminRestaurant } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, Store, Star, CheckCircle, Ban, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Restaurants() {
  const { data: restaurants, isLoading } = useListAdminRestaurants();
  const setStatusMutation = useSetRestaurantStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleStatusChange = (id: number, status: "pending" | "approved" | "suspended") => {
    setStatusMutation.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast({ title: "Statut mis à jour", description: "Le statut du restaurant a été modifié avec succès." });
        queryClient.invalidateQueries({ queryKey: getListAdminRestaurantsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
      },
      onError: () => {
        toast({ title: "Erreur", description: "Impossible de modifier le statut.", variant: "destructive" });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Approuvé</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-amber-500 text-white hover:bg-amber-600">En attente</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspendu</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const filtered = restaurants?.filter(r => statusFilter === "all" || r.status === statusFilter) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">{filtered.length} restaurant(s) trouvé(s)</span>
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
              <SelectItem value="approved">Approuvé</SelectItem>
              <SelectItem value="suspended">Suspendu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow>
              <TableHead>Restaurant</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Propriétaire</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Inscription</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Aucun restaurant ne correspond à vos critères.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((restaurant) => (
                <TableRow key={restaurant.id}>
                  <TableCell>
                    <div className="font-medium">{restaurant.name}</div>
                    <div className="text-xs text-muted-foreground">{restaurant.type}</div>
                  </TableCell>
                  <TableCell>{restaurant.city}</TableCell>
                  <TableCell>
                    <div className="text-sm">{restaurant.ownerName || `Propriétaire #${restaurant.ownerId}`}</div>
                    <div className="text-xs text-muted-foreground">{restaurant.ownerPhone || restaurant.phone}</div>
                  </TableCell>
                  <TableCell>
                    {restaurant.rating !== null && restaurant.rating !== undefined ? (
                      <div className="flex items-center text-sm font-medium">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500 mr-1" />
                        {restaurant.rating.toFixed(1)} <span className="text-muted-foreground ml-1 font-normal">({restaurant.reviewCount})</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(restaurant.createdAt)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(restaurant.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Modifier le statut</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(restaurant.id, "approved")}
                          disabled={restaurant.status === "approved" || setStatusMutation.isPending}
                          className="text-emerald-600"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approuver
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(restaurant.id, "pending")}
                          disabled={restaurant.status === "pending" || setStatusMutation.isPending}
                          className="text-amber-600"
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          Mettre en attente
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(restaurant.id, "suspended")}
                          disabled={restaurant.status === "suspended" || setStatusMutation.isPending}
                          className="text-destructive"
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Suspendre
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
