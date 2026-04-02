import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StoreCancelledOrdersRow } from "@/lib/admin";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";

type Props = { rows: StoreCancelledOrdersRow[] };

export function AdminStoresCancelledOrders({ rows }: Props) {
  const language = getServerLanguage();

  return (
    <Card className="border-primary/10 shadow-sm">
      <CardHeader>
        <CardTitle>{t(language, "admin.products.storesMostCancelledTitle")}</CardTitle>
        <CardDescription className="font-sans">
          {t(language, "admin.products.storesMostCancelledHint")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>{t(language, "admin.products.brandStore")}</TableHead>
                <TableHead className="text-end">{t(language, "admin.products.cancelledOrdersColumn")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-masa-gray py-8 font-sans">
                    {t(language, "admin.products.noCancelledStoreData")}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, i) => (
                  <TableRow key={row.store_id}>
                    <TableCell className="font-sans text-masa-gray tabular-nums">{i + 1}</TableCell>
                    <TableCell className="font-sans">
                      {row.store_slug ? (
                        <Link href={`/store/${row.store_slug}`} className="text-primary hover:underline font-medium">
                          {row.store_name}
                        </Link>
                      ) : (
                        row.store_name
                      )}
                    </TableCell>
                    <TableCell className="text-end font-sans tabular-nums">{row.cancelled_orders}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
