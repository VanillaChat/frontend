import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import Button from "@/components/UI/Button";

type TableProps<TData> = {
	data: TData[];
	columns: ColumnDef<TData, any>[];
};

export default function Table<TData>(props: TableProps<TData>) {
	const table = useReactTable({
		columns: props.columns,
		data: props.data,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	return (
		<div className="w-full flex flex-col p-2">
			<table className="">
				<thead className="">
					{table.getHeaderGroups().map((headerGroup) => (
						<tr
							key={headerGroup.id}
							className="border-y-[#E5E7EB] dark:border-y-[#383630] dim:border-y-[#232321] border-b border-t-[2px]"
						>
							{headerGroup.headers.map((header) => (
								<th
									className="h-12 px-2 pl-4 text-left align-middle font-medium"
									key={header.id}
									colSpan={header.colSpan}
								>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody className="[&_tr:last-child]:border-0">
					{table.getRowModel().rows.map((row) => (
						<tr
							key={row.id}
							className="border-b border-b-[#E5E7EB] dark:border-b-[#383630] dim:border-b-[#232321]"
						>
							{row.getVisibleCells().map((cell) => (
								<td
									key={cell.id}
									className="p-3 pl-4 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] pointer-events-auto"
								>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
			<div className="flex items-center justify-end gap-2 w-full">
				<Button
					onClick={() => table.firstPage()}
					disabled={!table.getCanPreviousPage()}
				>
					{"<<"}
				</Button>
				<Button
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					{"<"}
				</Button>
				<Button>
					{table.getState().pagination.pageIndex + 1}/{table.getPageCount()}
				</Button>
				<Button
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					{">"}
				</Button>
				<Button
					onClick={() => table.lastPage()}
					disabled={!table.getCanNextPage()}
				>
					{">>"}
				</Button>
			</div>
			{/*<select*/}
			{/*	value={table.getState().pagination.pageSize}*/}
			{/*	onChange={(e) => {*/}
			{/*		table.setPageSize(Number(e.target.value));*/}
			{/*	}}*/}
			{/*>*/}
			{/*	{[10, 20, 30, 40, 50].map((pageSize) => (*/}
			{/*		<option key={pageSize} value={pageSize}>*/}
			{/*			{pageSize}*/}
			{/*		</option>*/}
			{/*	))}*/}
			{/*</select>*/}
		</div>
	);
}
