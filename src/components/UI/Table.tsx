import {ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable} from "@tanstack/react-table";
import React from "react";

type TableProps<TData> = {
    data: TData[];
    columns: ColumnDef<TData, any>[];
}

export default function Table<TData>(props: TableProps<TData>) {
    const table = useReactTable({
        columns: props.columns,
        data: props.data,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel()
    });

    return <table className="">
        <thead className="">
        {
            table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-y-[#E5E7EB] dark:border-y-[#383630] dim:border-y-[#232321] border-b border-t-[2px]">
                    {
                        headerGroup.headers.map((header) => (
                            <th className="h-12 px-2 pl-4 text-left align-middle font-medium" key={header.id} colSpan={header.colSpan}>
                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                        ))
                    }
                </tr>
            ))
        }
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
        {
            table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-b-[#E5E7EB] dark:border-b-[#383630] dim:border-b-[#232321]">
                    {
                        row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="p-3 pl-4 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] pointer-events-auto">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))
                    }
                </tr>
            ))
        }
        </tbody>
    </table>
}