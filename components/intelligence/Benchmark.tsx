import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const benchmarks = [
  { name: "Ashoka University", outputs: "3,111", fwci: 1.4, oa: "68%", intl: "42%", isPrimary: true },
  { name: "IIT Madras", outputs: "145,210", fwci: 1.1, oa: "32%", intl: "25%", isPrimary: false },
  { name: "IISc", outputs: "112,050", fwci: 1.2, oa: "35%", intl: "30%", isPrimary: false },
  { name: "MIT", outputs: "850,200", fwci: 2.1, oa: "75%", intl: "55%", isPrimary: false },
  { name: "Oxford", outputs: "920,400", fwci: 2.3, oa: "80%", intl: "60%", isPrimary: false },
];

export function Benchmark() {
  return (
    <div className="p-6 border rounded-xl bg-card text-card-foreground shadow">
      <h3 className="font-semibold text-xl mb-4">Benchmark Comparison</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Institution</TableHead>
            <TableHead className="text-right">Outputs</TableHead>
            <TableHead className="text-right">FWCI (Mocked)</TableHead>
            <TableHead className="text-right">Open Access %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {benchmarks.map((inst) => (
            <TableRow key={inst.name} className={inst.isPrimary ? "bg-muted/50 font-medium" : ""}>
              <TableCell>
                {inst.name}
                {inst.isPrimary && <Badge variant="default" className="ml-2">Target</Badge>}
              </TableCell>
              <TableCell className="text-right">{inst.outputs}</TableCell>
              <TableCell className="text-right">{inst.fwci}</TableCell>
              <TableCell className="text-right">{inst.oa}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
