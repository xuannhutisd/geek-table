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
    company: "Snatia Ebereum",
    occupation: "CEO",
  },
  {
    id: 2,
    name: "Mathew Lawrence",
    surname: "Joshua",
    birth: new Date("1943-12-02"),
    mobile: 684739283,
    company: "De-Jaiz Mens Clothing",
    occupation: "Technical recruiter",
  },
  {
    id: 3,
    name: "Susie Evelyn",
    surname: "Spencer",
    birth: new Date("1976-01-23"),
    mobile: 684739283,
    company: "Harold Powell",
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
  { columnId: "Name", width: 200, resizable: true },
  { columnId: "Surname", width: 200, resizable: true },
  { columnId: "Birth Data", width: 200, resizable: true },
  { columnId: "Phone", width: 200, resizable: true },
  { columnId: "Company", width: 200, resizable: true },
  { columnId: "Occupation", width: 200, resizable: true },
];

const headerRow: Row = {
  rowId: "header",
  cells: [
    { type: "header", text: "Name" },
    { type: "header", text: "Surname" },
    { type: "header", text: "Birth Data" },
    { type: "header", text: "Phone" },
    { type: "header", text: "Company" },
    { type: "header", text: "Occupation" },
  ],
};

const getRows = (people: Person[]): Row[] => [
  headerRow,
  ...people.map<Row>((person, idx) => ({
    rowId: idx,
    cells: [
      { type: "text", text: person.name },
      { type: "text", text: person.surname },
      { type: "date", date: person.birth },
      { type: "number", value: person.mobile },
      { type: "text", text: person.company },
      { type: "text", text: person.occupation },
    ],
  })),
];

const applyChangesToPeople = (
  changes: CellChange<any>[],
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
const handleCanReorderRows = (targetRowId: Id, rowIds: Id[]): boolean => {
  return targetRowId !== "header";
};
function App() {
  const [people, setPeople] = React.useState<Person[]>(getPeople());
  const rows = getRows(people);
  const [columns, setColumns] = React.useState<Column[]>(getColumns());

  const handleChanges = (changes: CellChange<any>[]) => {
    setPeople((prevPeople) => applyChangesToPeople(changes, prevPeople));
  };

  const handleColumnResize = (ci: Id, width: number) => {
    setColumns((prevColumns) => {
      const columnIndex = prevColumns.findIndex((el) => el.columnId === ci);
      const resizedColumn = prevColumns[columnIndex];
      const updatedColumn = { ...resizedColumn, width };
      prevColumns[columnIndex] = updatedColumn;
      return [...prevColumns];
    });
  };
  const reorderArray = <T extends {}>(arr: T[], idxs: number[], to: number) => {
    const movedElements = arr.filter((_, idx) => idxs.includes(idx));
    const targetIdx =
      Math.min(...idxs) < to
        ? (to += 1)
        : (to -= idxs.filter((idx) => idx < to).length);
    const leftSide = arr.filter(
      (_, idx) => idx < targetIdx && !idxs.includes(idx)
    );
    const rightSide = arr.filter(
      (_, idx) => idx >= targetIdx && !idxs.includes(idx)
    );
    return [...leftSide, ...movedElements, ...rightSide];
  };
  const handleColumnsReorder = (targetColumnId: Id, columnIds: Id[]) => {
    const to = columns.findIndex(
      (column) => column.columnId === targetColumnId
    );
    const columnIdxs = columnIds.map((columnId) =>
      columns.findIndex((c) => c.columnId === columnId)
    );
    setColumns((prevColumns) => reorderArray(prevColumns, columnIdxs, to));
  };
  const handleRowsReorder = (targetRowId: Id, rowIds: Id[]) => {
    setPeople((prevPeople) => {
      const to = people.findIndex((person) => person.id === targetRowId);
      const rowsIds = rowIds.map((id) =>
        people.findIndex((person) => person.id === id)
      );
      return reorderArray(prevPeople, rowsIds, to);
    });
  };

  const applyNewValue = (
    changes: CellChange<TextCell>[],
    prevPeople: Person[],
    usePrevValue: boolean = false
  ): Person[] => {
    changes.forEach((change) => {
      const personIndex = change.rowId;
      const fieldName = change.columnId;
      const cell = usePrevValue ? change.previousCell : change.newCell;
      // @ts-ignore
      prevPeople[personIndex][fieldName] = cell.text;
    });
    return [...prevPeople];
  };

  const undoChanges = (
    changes: CellChange<TextCell>[],
    prevPeople: Person[]
  ): Person[] => {
    const updated = applyNewValue(changes, prevPeople, true);
    setCellChangesIndex(cellChangesIndex - 1);
    return updated;
  };
  const redoChanges = (
    changes: CellChange<TextCell>[],
    prevPeople: Person[]
  ): Person[] => {
    const updated = applyNewValue(changes, prevPeople);
    setCellChangesIndex(cellChangesIndex + 1);
    return updated;
  };
  const [cellChangesIndex, setCellChangesIndex] = React.useState(() => -1);
  const [cellChanges, setCellChanges] = React.useState<
    CellChange<TextCell>[][]
  >(() => []);

  const handleUndoChanges = () => {
    if (cellChangesIndex >= 0) {
      setPeople((prevPeople) =>
        undoChanges(cellChanges[cellChangesIndex], prevPeople)
      );
    }
  };

  const handleRedoChanges = () => {
    if (cellChangesIndex + 1 <= cellChanges.length - 1) {
      setPeople((prevPeople) =>
        redoChanges(cellChanges[cellChangesIndex + 1], prevPeople)
      );
    }
  };
  return (
    <div style={{ padding: "12px" }}>
      <ReactGrid
        rows={rows}
        columns={columns}
        onCellsChanged={handleChanges}
        onColumnResized={handleColumnResize}
        // onColumnsReordered={handleColumnsReorder}
        // onRowsReordered={handleRowsReorder}
        // canReorderRows={handleCanReorderRows}
        // enableRowSelection
        // enableColumnSelection
        // stickyLeftColumns={1}
        // stickyRightColumns={1}
        // stickyTopRows={1}
        // enableFillHandle
        // enableRangeSelection
      />
      <button onClick={handleUndoChanges}>Undo</button>
      <button onClick={handleRedoChanges}>Redo</button>
    </div>
  );
}

export default App;
