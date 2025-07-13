import React from "react";
import "@/styles/Pages/Index.css";
import useMeta from "../hooks/useMeta";
import Table from "@/components/UI/Table";

function Index() {
  useMeta("Home");
  return (
    <main className="mt-[15vh]">
      <h1>Do something here</h1>
      <Table
          columns={[
            {
              accessorKey: 'code',
              header: "Code",
              filterFn: "includesString"
            },
            {
              accessorKey: 'name',
              header: "Name",
              filterFn: "includesString"
            }
          ]}
          data={[
            {
              code: 'test',
              name: 'test name'
            }
          ]}
      />
    </main>
  );
}

export default Index;
