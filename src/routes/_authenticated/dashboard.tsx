import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, AlertTriangle, Leaf, ShieldAlert } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listDiagnoses, type DiagnosisRow } from "@/lib/diagnoses";
import { healthStatus } from "@/lib/crops";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Farmer dashboard | AgriVision AI" },
      {
        name: "description",
        content:
          "Track your crop analyses, disease frequency and crop-health distribution over time in one dashboard.",
      },
      { property: "og:title", content: "Your AgriVision AI crop dashboard" },
      {
        property: "og:description",
        content: "Statistics and charts covering every crop photo you have analysed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

const PIE_COLORS = ["var(--color-success)", "var(--color-warning)", "var(--color-destructive)"];

function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ["diagnoses"], queryFn: listDiagnoses });
  const rows: DiagnosisRow[] = data ?? [];

  const statuses = rows.map((row) => healthStatus(row.diagnosis, row.severity));
  const healthy = statuses.filter((s) => s === "Healthy").length;
  const highRisk = statuses.filter((s) => s === "High risk").length;
  const disease = statuses.filter((s) => s === "Disease").length;

  const overTime = Object.entries(
    rows.reduce<Record<string, number>>((acc, row) => {
      const day = new Date(row.created_at).toISOString().slice(0, 10);
      acc[day] = (acc[day] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date: date.slice(5), count }));

  const frequency = Object.entries(
    rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.diagnosis] = (acc[row.diagnosis] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  const distribution = [
    { name: "Healthy", value: healthy },
    { name: "Disease", value: disease },
    { name: "High risk", value: highRisk },
  ].filter((d) => d.value > 0);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Farmer dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              An overview of every crop photograph you have analysed.
            </p>
          </div>
          <Button asChild>
            <Link to="/analyze">Analyze a crop</Link>
          </Button>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total analyses" value={rows.length} icon={<Activity className="size-4" />} />
          <Stat label="Healthy crops" value={healthy} icon={<Leaf className="size-4" />} />
          <Stat
            label="Possible diseases"
            value={disease}
            icon={<AlertTriangle className="size-4" />}
          />
          <Stat label="High-risk cases" value={highRisk} icon={<ShieldAlert className="size-4" />} />
        </section>

        {isLoading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading your analyses…</p>
        ) : rows.length === 0 ? (
          <div className="surface-card mt-8 p-8 text-center">
            <h2 className="text-lg font-semibold">No analyses yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload your first crop photo to start building your crop-health record.
            </p>
            <Button className="mt-4" asChild>
              <Link to="/analyze">Analyze a crop</Link>
            </Button>
          </div>
        ) : (
          <>
            <section className="mt-8 grid gap-6 lg:grid-cols-3">
              <ChartCard title="Diagnoses over time" className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={overTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="date" fontSize={12} stroke="var(--color-muted-foreground)" />
                    <YAxis allowDecimals={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Crop health distribution">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={distribution} dataKey="value" nameKey="name" outerRadius={90} label>
                      {distribution.map((entry, index) => (
                        <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Disease frequency" className="lg:col-span-3">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={frequency}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="name" fontSize={12} stroke="var(--color-muted-foreground)" />
                    <YAxis allowDecimals={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </section>

            <section className="surface-card mt-8 overflow-x-auto p-2">
              <h2 className="px-4 py-3 text-sm font-semibold">Recent analyses</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Crop</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="sr-only">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 8).map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{row.crop_type}</TableCell>
                      <TableCell className="max-w-48 truncate">{row.diagnosis}</TableCell>
                      <TableCell>{Math.round(row.confidence * 100)}%</TableCell>
                      <TableCell>{row.severity}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {healthStatus(row.diagnosis, row.severity)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" asChild>
                          <Link to="/history" search={{ q: row.diagnosis }}>
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span aria-hidden="true">{icon}</span>
        {label}
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function ChartCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`surface-card p-5 ${className ?? ""}`}>
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}
