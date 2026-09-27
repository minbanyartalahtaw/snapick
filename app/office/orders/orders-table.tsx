"use client"

import { useRouter } from "next/navigation"
import { IconNote } from "@tabler/icons-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SearchHighlight } from "@/components/search-highlight"
import { formatKyats } from "@/lib/format"

import { StatusMenu } from "./status-menu"

export type OrderTableRow = {
  id: number
  code: string
  customerName: string
  phone: string
  placedAt: string
  itemCount: number
  total: number
  status: string
  note: boolean
}

export function OrdersTable({
  orders,
  query,
}: {
  orders: OrderTableRow[]
  query: string
}) {
  const router = useRouter()

  return (
    <div className="overflow-hidden rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              className="cursor-pointer"
              onClick={() => router.push(`/office/orders/${order.code}`)}
            >
              <TableCell className="font-mono font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <SearchHighlight text={order.code} query={query} />
                  {order.note && (
                    <IconNote className="size-3.5 text-muted-foreground" />
                  )}
                </span>
              </TableCell>
              <TableCell>
                <SearchHighlight text={order.customerName} query={query} />
              </TableCell>
              <TableCell className="font-mono whitespace-nowrap">
                <SearchHighlight text={order.phone} query={query} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {order.placedAt}
              </TableCell>
              <TableCell className="tabular-nums">{order.itemCount}</TableCell>
              <TableCell className="text-right font-medium tabular-nums whitespace-nowrap">
                {formatKyats(order.total)}
              </TableCell>
              <TableCell onClick={(event) => event.stopPropagation()}>
                <StatusMenu orderId={order.id} status={order.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
