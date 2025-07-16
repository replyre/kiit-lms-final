import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

const WeeklyPlanTable = ({ course }) => {
  const columns = [
    {
      accessorKey: "weekNumber",
      header: "Week Number",
    },
    {
      accessorKey: "topics",
      header: "Topics",
      cell: ({ row }) => (
        <ul className="list-disc pl-5">
          {row.original.topics.map((topic, index) => (
            <li key={index}>{topic}</li>
          ))}
        </ul>
      ),
    },
  ];

  const table = useReactTable({
    data: course.weeklyPlan,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-4">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-gray-200">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="border p-2 text-left">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border p-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklyPlanTable;
