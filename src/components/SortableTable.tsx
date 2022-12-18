import * as React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { visuallyHidden } from '@mui/utils';

type Order = 'asc' | 'desc';

function sortData(array: any[], columnConfig: IColumnConfigEntry[], order: 'asc' | 'desc', orderBy: string) {
  let sortedArray = array.sort((a, b) => {
    let sortedColumnConfig = columnConfig.find((item) => item.valueKey === orderBy);
    if(sortedColumnConfig && sortedColumnConfig.numeric) {
      return order === 'desc' ? a[orderBy] - b[orderBy] : b[orderBy] - a[orderBy];
    } else {
      return order === 'desc' ? a[orderBy].localeCompare(b[orderBy]) : b[orderBy].localeCompare(a[orderBy]);
    }
  });
  return sortedArray;
}

interface IColumnConfigEntry {
  id: string
  label: string
  valueKey: string
  numeric: boolean
  disablePadding: boolean
  valueFormatter?: (arg0: any) => any
  imageGetter?: (arg0: any) => any
  fallbackImage?: string
}

interface EnhancedTableProps {
  columnConfig: IColumnConfigEntry[];
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { 
    columnConfig,
    order,
    orderBy,
    onRequestSort
  } = props;
  const createSortHandler =
    (property: string) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {columnConfig.map((columnConfigEntry) => (
          <TableCell
            key={columnConfigEntry.id}
            align={'left'}
            padding={columnConfigEntry.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === columnConfigEntry.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === columnConfigEntry.valueKey}
              direction={orderBy === columnConfigEntry.valueKey ? order : 'asc'}
              onClick={createSortHandler(columnConfigEntry.valueKey)}
              style={{whiteSpace: 'nowrap'}}
            >
              {columnConfigEntry.label}
              {orderBy === columnConfigEntry.valueKey ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

interface EnhancedTableToolbarProps {
  tableHeading: string;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const {
    tableHeading
  } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
      }}
    >
      <Typography
        sx={{ flex: '1 1 100%' }}
        variant="h6"
        id="tableTitle"
        component="div"
      >
        {tableHeading}
      </Typography>
    </Toolbar>
  );
}

interface ISortableTableProps {
  tableHeading: string
  defaultSortValueKey: string
  columnConfig: IColumnConfigEntry[]
  tableData: any[]
}

export default function SortableTable(props: ISortableTableProps) {

  let {
    tableHeading,
    defaultSortValueKey,
    columnConfig,
    tableData,
  } = props;
  
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState(defaultSortValueKey);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(100);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: string,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClick = (event: React.MouseEvent<unknown>, index: number) => {
    console.log({index})
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - tableData.length) : 0;

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar tableHeading={tableHeading} />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={'medium'}
          >
            <EnhancedTableHead
              columnConfig={columnConfig}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={tableData.length}
            />
            <TableBody>
              {sortData(tableData, columnConfig, order, orderBy)
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row: any, index) => {
                  const labelId = `enhanced-table-checkbox-${index}`;
                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, index)}
                      tabIndex={-1}
                      key={row.name}
                    >
                      {columnConfig.map((columnConfigEntry, index) => {
                        return (
                          <TableCell
                            key={`${labelId}-${index}`}
                            component="th"
                            scope="row"
                            align={index > 0 ? "left" : "left"}
                          >
                            <div style={{display: 'flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
                              {columnConfigEntry?.imageGetter &&
                                <img
                                  loading="lazy"
                                  width="25"
                                  style={{marginRight: 18}}
                                  src={columnConfigEntry?.imageGetter(row[columnConfigEntry.valueKey])}
                                  onError={({ currentTarget }) => {
                                    currentTarget.onerror = null; // prevents looping
                                    currentTarget.src="https://vagabond-public-storage.s3.eu-west-2.amazonaws.com/question-mark-white.svg";
                                  }}
                                  alt=""
                                />
                              }
                              {columnConfigEntry.valueFormatter ? columnConfigEntry.valueFormatter(row[columnConfigEntry.valueKey]) : row[columnConfigEntry.valueKey]}
                            </div>
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={tableData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}