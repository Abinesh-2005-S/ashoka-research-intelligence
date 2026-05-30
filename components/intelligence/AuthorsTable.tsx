"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AuthorsTable({ authors }: { authors: any[] }) {
  return (
    <div className="p-6 border rounded-xl bg-card text-card-foreground shadow">
      <h3 className="font-semibold text-xl mb-4">Top Researchers</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Author</TableHead>
            <TableHead className="text-right">Outputs</TableHead>
            <TableHead className="text-right">Citations</TableHead>
            <TableHead className="text-right">h-index</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {authors.map((author) => (
            <TableRow key={author.id}>
              <TableCell className="font-medium flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${author.display_name}`} />
                  <AvatarFallback>{author.display_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span>{author.display_name}</span>
              </TableCell>
              <TableCell className="text-right">{author.works_count}</TableCell>
              <TableCell className="text-right">{author.cited_by_count}</TableCell>
              <TableCell className="text-right">{author.summary_stats?.h_index || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
