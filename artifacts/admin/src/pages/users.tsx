import { useState } from "react";
import { useListAdminUsers, useSetUserRole, getListAdminUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Loader2, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UsersPage() {
  const { data: users, isLoading } = useListAdminUsers();
  const setRoleMutation = useSetUserRole();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const handleRoleChange = (id: number, role: "client" | "restaurant_owner" | "admin") => {
    setRoleMutation.mutate({ id, data: { role } }, {
      onSuccess: () => {
        toast({ title: "Rôle mis à jour", description: "Le rôle de l'utilisateur a été modifié avec succès." });
        queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey() });
      },
      onError: () => {
        toast({ title: "Erreur", description: "Impossible de modifier le rôle.", variant: "destructive" });
      }
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="default" className="bg-purple-600 hover:bg-purple-700">Admin</Badge>;
      case "restaurant_owner":
        return <Badge variant="secondary" className="bg-orange-500 text-white hover:bg-orange-600">Restaurateur</Badge>;
      case "client":
        return <Badge variant="outline" className="border-blue-200 text-blue-700 dark:text-blue-400">Client</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const filtered = users?.filter(u => roleFilter === "all" || u.role === roleFilter) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">{filtered.length} utilisateur(s) trouvé(s)</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">Filtrer par rôle:</span>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les rôles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="restaurant_owner">Restaurateur</SelectItem>
              <SelectItem value="admin">Administrateur</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Fidélité</TableHead>
              <TableHead>Inscription</TableHead>
              <TableHead>Rôle Actuel</TableHead>
              <TableHead className="text-right">Modifier le Rôle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Aucun utilisateur ne correspond à vos critères.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-muted-foreground">#{user.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{user.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{user.phone}</div>
                    <div className="text-xs text-muted-foreground">{user.email || "—"}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Award className="h-4 w-4 text-amber-500" />
                      {user.loyaltyPoints} pts
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell>
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Select 
                      defaultValue={user.role} 
                      onValueChange={(val: any) => handleRoleChange(user.id, val)}
                      disabled={setRoleMutation.isPending}
                    >
                      <SelectTrigger className="w-[140px] ml-auto h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="restaurant_owner">Restaurateur</SelectItem>
                        <SelectItem value="admin">Administrateur</SelectItem>
                      </SelectContent>
                    </Select>
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
