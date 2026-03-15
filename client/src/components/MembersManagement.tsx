import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";

type MemberRole = "restricted" | "editor" | "admin" | "super_admin";

const ROLE_LABELS: Record<MemberRole, string> = {
  restricted: "Restricted",
  editor: "Editor",
  admin: "Admin",
  super_admin: "Super Admin",
};

const ROLE_DESCRIPTIONS: Record<MemberRole, string> = {
  restricted: "No permissions",
  editor: "Can create and edit products/news",
  admin: "Can delete products/news",
  super_admin: "Can manage member roles",
};

export default function MembersManagement() {
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<MemberRole>("restricted");

  // Fetch all members
  const { data: members, isLoading, error } = trpc.members.list.useQuery();
  
  // Update member role mutation
  const updateRoleMutation = trpc.members.updateRole.useMutation({
    onSuccess: () => {
      toast.success("Member role updated successfully");
      setSelectedMemberId(null);
      setSelectedRole("restricted");
    },
    onError: (error) => {
      toast.error(`Failed to update role: ${error.message}`);
    },
  });

  const handleUpdateRole = () => {
    if (!selectedMemberId) {
      toast.error("Please select a member");
      return;
    }

    updateRoleMutation.mutate({
      userId: selectedMemberId,
      memberRole: selectedRole,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin mr-2" />
        Loading members...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
        <AlertCircle className="text-red-600" />
        <span className="text-red-700">Error loading members: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Members Management</h2>
        <p className="text-gray-600">Manage member roles and permissions</p>
      </div>

      {/* Role Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(ROLE_LABELS).map(([role, label]) => (
              <div key={role} className="p-3 bg-gray-50 rounded-lg">
                <div className="font-semibold text-gray-900">{label}</div>
                <div className="text-sm text-gray-600">{ROLE_DESCRIPTIONS[role as MemberRole]}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>All Members ({members?.length || 0})</CardTitle>
          <CardDescription>Click on a member to change their role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {members && members.length > 0 ? (
              members.map((member) => (
                <div
                  key={member.id}
                  onClick={() => {
                    setSelectedMemberId(member.id);
                    setSelectedRole(member.memberRole as MemberRole);
                  }}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedMemberId === member.id
                      ? "bg-cyan-50 border-cyan-300"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{member.name || "Unknown"}</div>
                      <div className="text-sm text-gray-600">{member.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {ROLE_LABELS[member.memberRole as MemberRole]}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No members found</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role Update Form */}
      {selectedMemberId && (
        <Card className="border-cyan-200 bg-cyan-50">
          <CardHeader>
            <CardTitle>Update Member Role</CardTitle>
            <CardDescription>
              {members?.find((m) => m.id === selectedMemberId)?.name || "Selected member"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Role</label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as MemberRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([role, label]) => (
                    <SelectItem key={role} value={role}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600 mt-2">{ROLE_DESCRIPTIONS[selectedRole]}</p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleUpdateRole}
                disabled={updateRoleMutation.isPending}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {updateRoleMutation.isPending && <Loader2 className="animate-spin mr-2" />}
                Update Role
              </Button>
              <Button
                onClick={() => setSelectedMemberId(null)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
