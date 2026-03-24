import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";

export default function AdminSettingsPage() {
  const language = getServerLanguage();
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "admin.settings.title")}</h1>
        <p className="text-masa-gray font-sans">{t(language, "admin.settings.subtitle")}</p>
      </div>
      <div className="max-w-2xl space-y-6">
        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle>{t(language, "admin.settings.general")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">{t(language, "admin.settings.siteName")}</Label>
              <Input id="siteName" defaultValue="MASA" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">{t(language, "admin.settings.supportEmail")}</Label>
              <Input id="supportEmail" type="email" placeholder="support@masa.com" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle>{t(language, "admin.settings.feesCommission")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="commission">{t(language, "admin.settings.platformCommission")}</Label>
              <Input id="commission" type="number" defaultValue="5" />
            </div>
          </CardContent>
        </Card>
        <Button className="bg-primary hover:bg-primary/90">{t(language, "common.saveChanges")}</Button>
      </div>
    </div>
  );
}
