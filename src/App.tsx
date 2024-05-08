import * as React from "react";
import {
  ReactGrid,
  Column,
  Row,
  CellChange,
  TextCell,
  Id,
} from "@silevis/reactgrid";
import "@silevis/reactgrid/styles.css";

interface Person {
  id: number;
  name: string;
  surname: string;
  birth: Date | undefined;
  mobile: number;
  company: string;
  occupation: string;
}

const getPeople = (): Person[] => [
  {
    id: 1,
    name: "Thomas",
    surname: "Goldman",
    birth: new Date("1970-12-02"),
    mobile: 574839457,
    company: "A",
    occupation: "CEO",
  },
  {
    id: 2,
    name: "Mathew Lawrence",
    surname: "Joshua",
    birth: new Date("1943-12-02"),
    mobile: 684739283,
    company: "B",
    occupation: "Technical recruiter",
  },
  {
    id: 3,
    name: "Susie Evelyn",
    surname: "Spencer",
    birth: new Date("1976-01-23"),
    mobile: 684739283,
    company: "A",
    occupation: "Concrete paving machine operator",
  },
  {
    id: 4,
    name: "",
    surname: "",
    birth: undefined,
    mobile: NaN,
    company: "",
    occupation: "",
  },
];

const getColumns = (): Column[] => [
  { columnId: "name", width: 200, resizable: true },
  { columnId: "surname", width: 200, resizable: true },
  { columnId: "birth", width: 200, resizable: true },
  { columnId: "mobile", width: 200, resizable: true },
  { columnId: "company", width: 200, resizable: true },
  { columnId: "occupation", width: 250, resizable: true },
];
const styles = {
  header: {
    background: "#f5f5f5",
  },
};
const headerRow: Row = {
  rowId: "header",
  cells: [
    {
      type: "header",
      text: "Name",
      style: styles.header,
    },
    {
      type: "header",
      text: "Surname",
      style: styles.header,
    },
    {
      type: "header",
      text: "Birth Data",
      style: styles.header,
    },
    {
      type: "header",
      text: "Phone",
      style: styles.header,
    },
    {
      type: "header",
      text: "Company",
      style: styles.header,
    },
    {
      type: "header",
      text: "Occupation",
      style: styles.header,
    },
  ],
};
const getRows = (people: Person[]): Row[] => [
  headerRow,
  ...people.map<Row>((person, idx) => ({
    rowId: idx,
    cells: [
      { type: "text", text: person.name },
      { type: "text", text: person.surname },
      {
        type: "date",
        date: person.birth ? new Date(person.birth) : undefined,
        format: new Intl.DateTimeFormat("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      },
      { type: "number", value: person.mobile },
      {
        type: "dropdown",
        values: dropdownCompany,
        selectedValue: person.company,
        isOpen: true
      },
      { type: "text", text: person.occupation },
    ],
  })),
];

const dropdownCompany = [
  {
    label: "Công ty A",
    value: "A",
  },
  {
    label: "Công ty B",
    value: "B",
  },
];
const applyChangesToPeople = (
  changes: CellChange<TextCell>[],
  prevPeople: Person[]
): Person[] => {
  changes.forEach((change) => {
    const personIndex = change.rowId;
    const fieldName = change.columnId;
    // @ts-ignore
    prevPeople[personIndex][fieldName] = change.newCell.text;
  });
  return [...prevPeople];
};
function App() {
  const [people, setPeople] = React.useState<Person[]>(getPeople());
  const [columns, setColumns] = React.useState<Column[]>(getColumns());
  const handleColumnResize = (ci: Id, width: number) => {
    setColumns((prevColumns) => {
      const columnIndex = prevColumns.findIndex((el) => el.columnId === ci);
      const resizedColumn = prevColumns[columnIndex];
      const updatedColumn = { ...resizedColumn, width };
      prevColumns[columnIndex] = updatedColumn;
      return [...prevColumns];
    });
  };
  const rows = getRows(people);

  const handleChanges = (changes: CellChange<any>[]) => {
    setPeople((prevPeople) => applyChangesToPeople(changes, prevPeople));
  };
  return (
    <div style={{ padding: "12px" }}>
      <ReactGrid
        rows={rows}
        columns={columns}
        onCellsChanged={handleChanges}
        onColumnResized={handleColumnResize}
      />
    </div>
  );
}

export default App;
