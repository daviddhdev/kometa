import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"

interface ComicMetadataProps {
  metadata: {
    format: string
    language: string
    pages: number
    ageRating: string
    colorist: string
    letterer: string
    editor: string
    releaseDate: string
    isbn: string
    [key: string]: string | number
  }
}

export default function ComicMetadata({ metadata }: ComicMetadataProps) {
  const metadataItems = Object.entries(metadata).map(([key, value]) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
    value: value,
  }))

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
  )
}
