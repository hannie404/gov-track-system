"use client"

import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Mail, Calendar, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type User = {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  organization?: string
  created_at: string
}

const roleColors: Record<string, string> = {
  'System_Administrator': 'bg-red-100 text-red-800 border-red-200',
  'Planner': 'bg-blue-100 text-blue-800 border-blue-200',
  'Development_Council': 'bg-purple-100 text-purple-800 border-purple-200',
  'Budget_Officer': 'bg-green-100 text-green-800 border-green-200',
  'BAC_Secretariat': 'bg-amber-100 text-amber-800 border-amber-200',
  'Technical_Inspector': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'Contractor': 'bg-orange-100 text-orange-800 border-orange-200',
  'Public_User': 'bg-gray-100 text-gray-800 border-gray-200',
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "first_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const user = row.original
      return (
        <div>
          <div className="font-medium">{user.first_name} {user.last_name}</div>
          {user.organization && (
            <div className="text-xs text-muted-foreground">{user.organization}</div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Mail className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{row.getValue("email")}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      return (
        <Badge variant="outline" className={roleColors[role] || 'bg-gray-100'}>
          {role.replace(/_/g, ' ')}
        </Badge>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {date.toLocaleDateString()}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              Copy user ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit user</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete user</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

interface UsersDataTableProps {
  data: User[]
}

export function UsersDataTable({ data }: UsersDataTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="first_name"
      searchPlaceholder="Search by name..."
    />
  )
}
