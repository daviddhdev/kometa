import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

interface ComicMetadataProps {
  metadata: {
    publisher: string;
    startYear: string | number;
    totalIssues: string | number;
    siteDetailUrl: string;
    aliases: string;
    deck: string;
    dateAdded: string;
    dateLastUpdated: string;
    [key: string]: string | number;
  };
}

export default function ComicMetadata({ metadata }: ComicMetadataProps) {
  const metadataItems = Object.entries(metadata).map(([key, value]) => ({
    label:
      key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
    value: value,
  }));

  return (
    <Table>
      <TableBody>
        {metadataItems.map((item) => (
          <TableRow key={item.label}>
            <TableCell className="font-medium w-1/3">{item.label}</TableCell>
            <TableCell>{item.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
