import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { ArrowUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import { useSupabase } from "~/context/supabase";
import { DownloadIcon } from "./icons";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

type Props = {
  data: CustomFile[] | null;
};

export default function DowmloadSection({ data }: Props) {
  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.data?.ok) {
      toast.success(`Downloaded all files successfully`);
    } else if (fetcher.data?.errors) {
      fetcher.data?.errors.forEach((error: string) => {
        toast.error("Error downloading file", {
          description: error,
        });
      });
    }
  }, [fetcher.data]);

  const { url, anonKey } = useSupabase();

  const handleDownloadAll = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!data) return;

    const formData = new FormData();
    data.forEach((file) => formData.append("files", file.name));

    formData.append(
      "supabaseEnv",
      JSON.stringify({
        SUPABASE_URL: url,
        SUPABASE_ANON_KEY: anonKey,
      }),
    );

    fetcher.submit(formData, {
      action: "/download/all",
      encType: "multipart/form-data",
      method: "POST",
    });
  };

  return (
    <>
      <div className="min-w-[65rem] max-h-[45rem] flex flex-col items-center justify-center rounded-md overflow-auto p-2">
        <div className="w-[90%] flex justify-end">
          <Button
            onClick={handleDownloadAll}
            className="cursor-pointer select-none"
            disabled={!data || data.length === 0}
          >
            <DownloadIcon /> Download All
          </Button>
        </div>
        <div className="min-w-[90%] my-5 rounded-md bg-slate-600/50 p-1">
          <DataTable columns={columns} data={data ? data : []} />
        </div>
      </div>
    </>
  );
}

export type CustomFile = {
  name: string;
  size: string;
  type: string;
  modified: string;
};

const columns: ColumnDef<CustomFile>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() == "asc")}
        >
          Name
          <ArrowUpDown />
        </Button>
      );
    },
  },
  {
    accessorKey: "size",
    header: "Size",
  },
  {
    accessorKey: "type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() == "asc")}
        >
          Type
          <ArrowUpDown />
        </Button>
      );
    },
  },
  {
    accessorKey: "modified",
    header: "Modified",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const name = row.original.name;
      const fetcher = useFetcher();

      // toast
      useEffect(() => {
        if (fetcher.data?.ok) {
          toast.success(`Downloaded ${name} successfully`);
        } else if (fetcher.data?.error) {
          toast.error("Error downloading file", {
            description: fetcher.data.error,
          });
        }
      }, [fetcher.data]);

      const { url, anonKey } = useSupabase();

      const handleDownload = async (e: React.FormEvent) => {
        const formData = new FormData();
        formData.append(
          "supabaseEnv",
          JSON.stringify({
            SUPABASE_URL: url,
            SUPABASE_ANON_KEY: anonKey,
          }),
        );
        formData.append("name", name);

        fetcher.submit(formData, {
          action: "/download",
          encType: "multipart/form-data",
          method: "POST",
        });
      };

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 w-9 p-0 cursor-pointer"
                onClick={handleDownload}
              >
                <span className="sr-only">Download</span>
                <DownloadIcon fill="white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
];

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader className="select-none">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No files to download
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
